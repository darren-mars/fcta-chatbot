# Databricks notebook source
# DBTITLE 1,Install dependencies
# MAGIC %pip install PyMuPDF

# COMMAND ----------

# DBTITLE 1,Set environment variables
import os
dbutils.widgets.removeAll() # type: ignore

# Retrieve secrets using dbutils and set them as environment variables for config
os.environ["STORAGE_ACCOUNT_NAME"] = "fctainnovationstorage"
os.environ["STORAGE_ACCOUNT_ACCESS_KEY"] = dbutils.secrets.get(scope="my-secret-scope", key="storage-access-key") # type: ignore
os.environ["CONTAINER_NAME"] = "dev-chatbot-rag-data"
os.environ["CATALOG_NAME"] = "fcta_innovation_stream"
os.environ["SCHEMA_NAME"] = "default"
os.environ["TABLE_NAME"] = "ta_magazines_contents"
os.environ["CHECKPOINT_PATH"] = "/mnt/dev-chatbot-rag-data/_checkpoint"

# COMMAND ----------

# Configure Logging
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)
logger.info("Logging configured.")

# COMMAND ----------

# DBTITLE 1,Imports and initialization
from pyspark.sql import SparkSession
spark = SparkSession.builder.getOrCreate()

from data.src.config import get_config
from data.src.mount import mount_storage
from data.src.chunk import extract_and_chunk_text_udf
from data.src.tables import ensure_table_exists
from data.src.load import ingest

config = get_config()

# COMMAND ----------

# DBTITLE 1,Mount Azure Blob Storage
try:
    mount_path = mount_storage(dbutils, config) # type: ignore
    display(dbutils.fs.ls(mount_path)) # type: ignore
except Exception as e:
    logger.error(f"Failed to mount storage: {e}")
    raise

# COMMAND ----------

# DBTITLE 1,Ensure Delta Table Exists
try:
    ensure_table_exists(spark, config)
except Exception as e:
    logger.error(f"Failed to ensure table exists: {e}")
    raise

# COMMAND ----------

# DBTITLE 1,Run Ingestion
try:
    ingest(spark, config, extract_and_chunk_text_udf)
    logger.info("Batch loading job triggered and completed. All currently available files have been processed and the job has ended.")
except Exception as e:
    logger.error(f"Failed to complete batch ingestion: {e}")
    raise
