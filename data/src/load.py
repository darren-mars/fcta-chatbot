import logging
from pyspark.sql.functions import col, substring_index, explode, current_timestamp
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, BinaryType, LongType

logger = logging.getLogger(__name__)

def ingest(spark, config, extract_and_chunk_text_udf):
    """
    Ingests binary PDF files from the mounted Azure Blob Storage, extracts and chunks the text,
    and writes the results to a Delta table specified in the config.
    
    Since 'trigger(availableNow=True)' is used, this operation behaves like a batch job:
    it processes all currently available data and then stops, rather than running continuously.
    
    Args:
        spark (SparkSession): The Spark Session.
        config (dict): Configuration dictionary with table, container, and checkpoint info.
        extract_and_chunk_text_udf (function): A UDF for extracting and chunking text from PDF content.
    """
    full_table_name = f"{config['catalog_name']}.{config['schema_name']}.{config['table_name']}"
    container_mount = f"/mnt/{config['container_name']}"

    logger.info(f"Starting batch ingestion from {container_mount} into {full_table_name}.")

    binary_schema = StructType([
        StructField("path", StringType(), True),
        StructField("modificationTime", TimestampType(), False),
        StructField("length", LongType(), False),
        StructField("content", BinaryType(), True)
    ])

    try:
        (
            spark.readStream
                .format("cloudFiles")
                .option("cloudFiles.format", "binaryFile")
                .option("cloudFiles.includeExistingFiles", "false")
                .option("cloudFiles.schemaLocation", config["checkpoint_path"])
                .schema(binary_schema)
                .load(container_mount)
                .withColumn("filename", substring_index(col("path"), "/", -1))
                .withColumn("content_chunks", extract_and_chunk_text_udf(col("content")))
                .withColumn("content_chunk", explode("content_chunks"))
                .withColumn("load_timestamp", current_timestamp())
                .select("filename", "content_chunk", "load_timestamp")
                .writeStream
                .format("delta")
                .option("checkpointLocation", config["checkpoint_path"])
                .trigger(availableNow=True)  # Processes all available data once and then stops
                .table(full_table_name)
        )
        logger.info("Batch ingestion completed successfully. All available files have been processed.")
    except Exception as e:
        logger.error(f"Error during batch ingestion: {e}", exc_info=True)
        raise
