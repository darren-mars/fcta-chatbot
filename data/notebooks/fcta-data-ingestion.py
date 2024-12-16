# Databricks notebook source
# DBTITLE 1,Install dependencies
# MAGIC %pip install PyMuPDF openai

# COMMAND ----------

# DBTITLE 1,Storage variables
storage_account_name = "fctainnovationstorage"
storage_account_access_key = dbutils.secrets.get(scope="my-secret-scope", key="storage-access-key")
container_name = "dev-chatbot-rag-data"

# COMMAND ----------

# DBTITLE 1,Create mounting point on Azure Blob Storage
# Mount the blob storage
dbutils.fs.mount(
    source = f"wasbs://{container_name}@{storage_account_name}.blob.core.windows.net/",
    mount_point = f"/mnt/{container_name}",
    extra_configs = {f"fs.azure.account.key.{storage_account_name}.blob.core.windows.net": storage_account_access_key}
)

# COMMAND ----------

# DBTITLE 1,Function to extract and chunk text from PDF files
import fitz  # PyMuPDF
from pyspark.sql.functions import udf, explode
from pyspark.sql.types import ArrayType, StringType

@udf(ArrayType(StringType()))
def extract_and_chunk_text(content, chunk_size=4000, overlap_size=400):
    text_chunks = []
    try:
        pdf = fitz.open(stream=content, filetype="pdf")
        for page_num in range(len(pdf)):
            page = pdf.load_page(page_num)
            text = page.get_text()
            # Selecting only pages with over 300 characters to avoid meaningless content
            # Also removing the contents page
            if len(text) > 300 and 'C O N T E N T S' not in text:
                # Create chunks with overlapping
                for i in range(0, len(text), chunk_size - overlap_size):
                    text_chunks.append(text[i:i + chunk_size])
    except:
        text_chunks = []
    return text_chunks

# COMMAND ----------

# DBTITLE 1,Create embeddings table if it does not exist
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, ArrayType, FloatType
from pyspark.sql.functions import current_timestamp

# Define schema for the DataFrame
schema = StructType([
    StructField("filename", StringType(), True),
    StructField("content_chunk", StringType(), True),
    StructField("load_timestamp", TimestampType(), True)
])

# Specify catalog and schema
catalog_name = "fcta_innovation_stream"
schema_name = "default"
table_name = "travel_associates_magazines_contents"
full_table_name = f"{catalog_name}.{schema_name}.{table_name}"

# Check if table exists and create if it does not
if not spark.catalog.tableExists(full_table_name):
    empty_df = spark.createDataFrame([], schema)
    (
        empty_df
        .write
        .format("delta")
        .option("delta.enableChangeDataFeed", "true")
        .mode("overwrite")
        .saveAsTable(full_table_name)
    )

# COMMAND ----------

from pyspark.sql.functions import col, substring_index
from pyspark.sql.types import BinaryType, LongType

# Define the schema of the binary files (since we are reading raw PDF files)
binary_schema = StructType([
    StructField("path", StringType(), True),
    StructField("modificationTime",TimestampType(), False),
    StructField("length", LongType(), False),
    StructField("content", BinaryType(), True)
])

checkpoint_path = f"/mnt/{container_name}/_checkpoint"

(
    spark.readStream
        .format("cloudFiles")
        .option("cloudFiles.format", "binaryFile")
        .option("cloudFiles.includeExistingFiles", "false")
        .option("cloudFiles.schemaLocation", checkpoint_path)
        .schema(binary_schema)
        .load(f"/mnt/{container_name}/")
        .withColumn("filename", substring_index(col("path"), "/", -1))
        .withColumn("content_chunks", extract_and_chunk_text(col("content")))
        .withColumn("content_chunk", explode("content_chunks"))
        .withColumn("load_timestamp", current_timestamp())
        .select("filename", "content_chunk", "load_timestamp")
        .writeStream
        .format("delta")
        .option("checkpointLocation", checkpoint_path)
        .trigger(availableNow=True)
        .table(full_table_name)
)
