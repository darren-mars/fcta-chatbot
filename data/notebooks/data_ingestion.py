# Databricks notebook source
# MAGIC %sh
# MAGIC sudo apt-get update
# MAGIC sudo apt-get install -y tesseract-ocr

# COMMAND ----------

# DBTITLE 1,Install dependencies
# MAGIC %pip install PyMuPDF jsonschema pytesseract

# COMMAND ----------

# MAGIC %sql drop table ta_itinerary_chatbot_rag_test

# COMMAND ----------

dbutils.fs.rm("/mnt/chatbot-rag-data/checkpoints/", recurse=True)

# COMMAND ----------

# MAGIC %fs unmount /mnt/chatbot-rag-data/

# COMMAND ----------

# MAGIC %fs ls /mnt/chatbot-rag-data

# COMMAND ----------

# DBTITLE 1,Set widgets
import json

# Define single-value widgets
dbutils.widgets.text("STORAGE_ACCOUNT_NAME", "fctainnovationstorage", "Storage Account Name")
dbutils.widgets.text("CATALOG_NAME", "fcta_innovation_stream", "Catalog Name")
dbutils.widgets.text("SCHEMA_NAME", "default", "Schema Name")
dbutils.widgets.text("TABLE_NAME", "ta_itinerary_chatbot_rag_test", "Table Name")
dbutils.widgets.text("CHECKPOINT_PATH", "/mnt/chatbot-rag-data/checkpoints", "Checkpoint Path")

# Define widgets for both configuration files
dbutils.widgets.text(
    "DATA_CONFIG_FILE_PATH", 
    "data_mount_points.json",
    "Path to Data Mount Points Configuration File"
)

dbutils.widgets.text(
    "SYSTEM_CONFIG_FILE_PATH", 
    "system_mount_points.json",
    "Path to System Mount Points Configuration File"
)


# COMMAND ----------

# Configure Logging
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s: %(message)s')
logger = logging.getLogger(__name__)
logger.setLevel = logging.INFO
logger.info("Logging configured.")

# COMMAND ----------

# DBTITLE 1,Imports and initialization
import sys
import os

# Get the absolute path to the root directory
root_dir = os.path.abspath(os.path.join('..', '..'))

# Add the root directory to sys.path
if root_dir not in sys.path:
    sys.path.append(root_dir)

from data.src.config import get_config
from data.src.mount import mount_storage
from data.src.load import ingest

config = get_config(dbutils)

# COMMAND ----------

# DBTITLE 1,Mount Azure Blob Storage
try:
    mounted_paths = mount_storage(dbutils, config)
except Exception as e:
    logger.error(f"Failed to mount storage: {e}")
    raise

# COMMAND ----------

# DBTITLE 1,Run Ingestion
try:
    ingest(spark, config, initial_run = "true")
    logger.info("Batch loading job triggered and completed. All currently available files have been processed and the job has ended.")
except Exception as e:
    logger.error(f"Failed to complete batch ingestion: {e}")
    raise

# COMMAND ----------

dbutils.library.restartPython()

# COMMAND ----------

# MAGIC %sql
# MAGIC select * from ta_itinerary_chatbot_rag_test 
# MAGIC where split(filename, '\\.')[1] = 'csv'
# MAGIC limit 10

# COMMAND ----------

# MAGIC %sql
# MAGIC select count(1) from ta_itinerary_chatbot_rag_test

# COMMAND ----------

# MAGIC %md
# MAGIC ##DEBUGGING

# COMMAND ----------

# MAGIC %sql
# MAGIC select count(1)
# MAGIC from ta_itinerary_chatbot_rag_test
# MAGIC where filename = 'ta_website_scraped_packages.csv'
# MAGIC and len(content_chunk) < 900
