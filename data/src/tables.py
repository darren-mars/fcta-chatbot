import logging
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, ArrayType

logger = logging.getLogger(__name__)

def ensure_table_exists(spark, config):
    """
    Ensures that the target Delta table exists. If not, it creates an empty Delta table with the appropriate schema.
    
    Args:
        spark (SparkSession): The Spark Session.
        config (dict): Configuration dictionary containing catalog, schema, and table name information.
    """
    full_table_name = f"{config['catalog_name']}.{config['schema_name']}.{config['table_name']}"

    logger.info(f"Checking if Delta table {full_table_name} exists.")
    schema = StructType([
        StructField("filename", StringType(), True),
        StructField("categories_vibe", ArrayType(StringType(), True)),
        StructField("categories_where", ArrayType(StringType(), True)),
        StructField("categories_experiences", ArrayType(StringType(), True)),
        StructField("content_chunk", StringType(), True),
        StructField("load_timestamp", TimestampType(), True)
    ])

    try:
        if not spark.catalog.tableExists(full_table_name):
            logger.info(f"Table {full_table_name} does not exist. Creating it.")
            empty_df = spark.createDataFrame([], schema)
            (
                empty_df
                .write
                .format("delta")
                .option("delta.enableChangeDataFeed", "true")
                .mode("overwrite")
                .saveAsTable(full_table_name)
            )
            logger.info(f"Table {full_table_name} created successfully.")
        else:
            logger.info(f"Table {full_table_name} already exists.")
    except Exception as e:
        logger.error(f"Error ensuring Delta table exists: {e}", exc_info=True)
        raise
