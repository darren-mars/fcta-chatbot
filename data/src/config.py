import os
import logging

logger = logging.getLogger(__name__)

def get_config():
    """
    Retrieves configuration from environment variables.
    
    Returns:
        dict: A dictionary containing configuration parameters such as storage account name, container name, 
              catalog name, schema name, table name, and checkpoint path.
    """
    logger.info("Loading configuration from environment variables.")
    try:
        config = {
            "storage_account_name": os.environ["STORAGE_ACCOUNT_NAME"],
            "storage_account_access_key": os.environ["STORAGE_ACCOUNT_ACCESS_KEY"],
            "container_name": os.environ["CONTAINER_NAME"],
            "catalog_name": os.environ["CATALOG_NAME"],
            "schema_name": os.environ["SCHEMA_NAME"],
            "table_name": os.environ["TABLE_NAME"],
            "checkpoint_path": os.environ["CHECKPOINT_PATH"]
        }
        logger.info("Configuration loaded successfully.")
        return config
    except KeyError as e:
        logger.error(f"Missing expected environment variable: {e}")
        raise
