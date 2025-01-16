import json
import jsonschema
import logging
import os
from typing import Any, Dict

logger = logging.getLogger(__name__)

MOUNT_POINTS_SCHEMA = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "container_name": {"type": "string"},
            "storage_account_name": {"type": "string"},
            "storage_account_access_key": {"type": "string"},
            "data_source_type": {"type": "string"},
            "subdirectories": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "schema_name": {"type": "string"},
                        "columns": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["name", "schema_name", "columns"]
                }
            }
        },
        "required": [
            "container_name",
            "storage_account_name",
            "storage_account_access_key",
            "data_source_type",
            "subdirectories"
        ]
    }
}

TABLE_SCHEMA = [
    {"name": "filename", "type": "string"},
    {"name": "content_chunk", "type": "string"},
    {"name": "load_timestamp", "type": "timestamp"},
]


def validate_json_config(config_data, schema, config_type="Configuration"):
    try:
        jsonschema.validate(instance=config_data, schema=schema)
        logger.info(f"{config_type} validation passed.")
    except jsonschema.exceptions.ValidationError as ve:
        logger.error(f"{config_type} validation failed: {ve.message}")
        raise


def get_config(dbutils) -> Dict[str, Any]:
    try:
        catalog_name = dbutils.widgets.get("CATALOG_NAME")
        schema_name = dbutils.widgets.get("SCHEMA_NAME")
        table_name = dbutils.widgets.get("TABLE_NAME")
        checkpoint_path = dbutils.widgets.get("CHECKPOINT_PATH")
        data_config_file = dbutils.widgets.get("DATA_CONFIG_FILE_PATH")
        system_config_file = dbutils.widgets.get("SYSTEM_CONFIG_FILE_PATH")

        # Determine absolute paths
        current_dir = os.path.dirname(__file__)
        data_config_path = os.path.join(current_dir, data_config_file)
        system_config_path = os.path.join(current_dir, system_config_file)

        # Load data mount points
        with open(data_config_path, 'r') as file:
            data_mount_points = json.load(file)

        # Load system mount points
        with open(system_config_path, 'r') as file:
            system_mount_points = json.load(file)

        # Combine mount points
        all_mount_points = data_mount_points + system_mount_points

        # Validate the combined mount points
        validate_json_config(
            all_mount_points, MOUNT_POINTS_SCHEMA, config_type="Mount Points"
        )

        # Replace placeholders with secrets
        storage_account_access_key = dbutils.secrets.get(
            scope="my-secret-scope", key="storage-access-key"
        )
        for mount in all_mount_points:
            if (
                "storage_account_access_key" in mount
                and mount["storage_account_access_key"]
                == "${STORAGE_ACCOUNT_ACCESS_KEY}"
            ):
                mount["storage_account_access_key"] = (
                    storage_account_access_key
                )
                logger.info(
                    f"Replaced storage_account_access_key for container "
                    f"'{mount['container_name']}'"
                )

        config = {
            "checkpoint_path": checkpoint_path,
            "mount_points": all_mount_points,
            "delta_table": {
                "catalog_name": catalog_name,
                "schema_name": schema_name,
                "table_name": table_name,
                "schema": TABLE_SCHEMA,
                "delta_options": {
                    "delta.enableChangeDataFeed": "true",
                }
            }
        }

        logger.info("Configuration successfully retrieved and parsed.")
        return config
    except Exception as e:
        logger.error(f"Error retrieving configuration: {e}", exc_info=True)
        raise
