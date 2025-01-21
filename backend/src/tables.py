import logging
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType
from typing import Dict, Any

logger = logging.getLogger(__name__)


def get_struct_type(schema_config: list) -> StructType:
    """
    Converts a list of schema dictionaries into a Spark StructType.

    Args:
        schema_config (list): List of dictionaries with 'name' and 'type' keys.

    Returns:
        StructType: Spark StructType object representing the schema.
    """
    from pyspark.sql.types import (
        StructType, StructField, StringType, TimestampType, ArrayType
    )

    type_mapping = {
        "string": StringType(),
        "timestamp": TimestampType(),
        "array<string>": ArrayType(StringType(), True),
        # Extend as necessary
    }

    fields = []
    for field in schema_config:
        field_type = type_mapping.get(field["type"].lower())
        if not field_type:
            raise ValueError(f"Unsupported field type: {field['type']}")
        fields.append(StructField(field["name"], field_type, True))

    return StructType(fields)


def ensure_table_exists(spark: SparkSession, table_config: Dict[str, Any]):
    """
    Ensures that the target Delta table exists. If not, it creates an empty Delta table with the appropriate schema.

    Args:
        spark (SparkSession): The Spark Session.
        table_config (dict): Configuration dictionary containing catalog, schema, table name, and schema information.
    """
    full_table_name = f"{table_config['catalog_name']}.{table_config['schema_name']}.{table_config['table_name']}"
    logger.info(f"Checking if Delta table {full_table_name} exists.")

    try:
        if not spark.catalog.tableExists(full_table_name):
            logger.info(f"Table {full_table_name} does not exist. Creating it.")
            schema = get_struct_type(table_config["schema"])
            empty_df = spark.createDataFrame([], schema)
            (
                empty_df
                .write
                .format("delta")
                .options(**table_config.get("delta_options", {}))
                .mode("overwrite")
                .saveAsTable(full_table_name)
            )
            logger.info(f"Table {full_table_name} created successfully.")
        else:
            logger.info(f"Table {full_table_name} already exists.")
    except Exception as e:
        logger.error(f"Error ensuring Delta table exists: {e}", exc_info=True)
        raise
