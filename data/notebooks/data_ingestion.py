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

# MAGIC %sql
# MAGIC select *
# MAGIC from ta_itinerary_chatbot_rag_test 
# MAGIC where split(filename, '\\.')[1] = 'pdf'
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

# COMMAND ----------

from pyspark.sql.types import StructType, StructField, StringType

from typing import List

def get_csv_schema(columns: List[str]) -> StructType:
    return StructType([StructField(column, StringType(), True) for column in columns])

subdir = {
                "name": "packages-website",
                "schema_name": "packages_website",
                "columns": [
                    "airline_name_selection",
                    "expoint_destination",
                    "price_secondary",
                    "tag_line",
                    "hotel_commerce_info",
                    "land_ex_points",
                    "commerce_publish_date",
                    "price",
                    "search_result_weight",
                    "supplier",
                    "id",
                    "product_description",
                    "sku",
                    "brand",
                    "ship_id",
                    "bookable_type",
                    "campaign_medium",
                    "images",
                    "travellers",
                    "ship_line",
                    "indexed",
                    "field_product_holiday_experience:name",
                    "airline_name",
                    "price_zar_computed",
                    "package_description",
                    "tags",
                    "campaign_location",
                    "departing_months",
                    "selection",
                    "meta",
                    "conditions",
                    "air_ex_points",
                    "inclusions",
                    "supplier_product_code",
                    "commerce_expiry_date",
                    "status",
                    "continent",
                    "supplier_secondary_image",
                    "bookable",
                    "latitude",
                    "product_status",
                    "supplier_condition",
                    "availability",
                    "price_usd_computed",
                    "expoint_category",
                    "booking_class",
                    "price_gbp_computed",
                    "destination_geo",
                    "campaign_end_date",
                    "travel_dates",
                    "hotel_commerce_id",
                    "address",
                    "has_price",
                    "price_cad_computed",
                    "upsell_options",
                    "price_zar",
                    "price_hkd_computed",
                    "price_sgd_computed",
                    "price_nzd",
                    "roundtrip",
                    "campaign_start_date",
                    "origin_code",
                    "duration_minutes",
                    "duration_days",
                    "price_nzd_computed",
                    "destination_category",
                    "air_sale_date",
                    "price_cad",
                    "country",
                    "seo_url",
                    "price_aud_computed",
                    "raw_inclusions",
                    "routing_code",
                    "field_product_campaign_medium:name",
                    "experience_type",
                    "pricead_from",
                    "star_rating",
                    "price_aed",
                    "price_hkd",
                    "promotion_start_date",
                    "package_name_category",
                    "destination_in",
                    "ship_name",
                    "longitude",
                    "child_price",
                    "maps",
                    "pricead_was",
                    "created",
                    "search_api_language",
                    "oneway_flag",
                    "destination_selection",
                    "alt_package_name",
                    "experiences",
                    "destination_code",
                    "price_gbp",
                    "expoint_selection",
                    "itinerary_destination_in",
                    "departure",
                    "changed",
                    "price_usd",
                    "campaign_location_list",
                    "destination",
                    "description",
                    "gne_reference",
                    "price_sgd",
                    "airline_logo",
                    "land_extra_nights",
                    "line_id",
                    "duration",
                    "promotion_end_date",
                    "itinerary_last",
                    "comments",
                    "supplier_exclusion",
                    "price_tax",
                    "price_aud",
                    "airline_name_destination",
                    "field_product_tags:name",
                    "expoint_country",
                    "extra_info",
                    "airline_code",
                    "package_name",
                    "category",
                    "supplier_product_image"
                ],
                "needed_columns": [
                    "product_description",
                    "brand",
                    "travellers",
                    "field_product_holiday_experience:name",
                    "package_description",
                    "tags",
                    "departing_months",
                    "selection",
                    "inclusions",
                    "continent",
                    "destination_geo",
                    "duration_days",
                    "country",
                    "experience_type",
                    "destination_in",
                    "experiences",
                    "campaign_location_list",
                    "destination",
                    "package_name"
                ]
            }

csv_schema = get_csv_schema(subdir.get("needed_columns", None))

df = (
        spark.read.format("csv")
        .option("header", "true")
        .option("inferSchema", "false")
        .option("sep", ",")
        .option("multiLine", "true")      # Handle multi-line fields
        .option("quote", "|") \
        .option("mode", "PERMISSIVE")    # Continue parsing even if some rows are malformed
        .schema(csv_schema)
        .load(f"/mnt/chatbot-rag-data/csv/debug/")
)

display(df)
