import logging

logger = logging.getLogger(__name__)

def mount_storage(dbutils, config):
    """
    Mounts the Azure Blob Storage container specified in the configuration if not already mounted.
    
    Args:
        dbutils: Databricks utilities object.
        config (dict): Configuration dictionary containing storage account and container info.
    
    Returns:
        str: The mount point for the Azure Blob Storage container.
    """
    mount_point = f"/mnt/{config['container_name']}"
    logger.info(f"Attempting to mount {config['container_name']} at {mount_point}.")
    try:
        mounts = [m.mountPoint for m in dbutils.fs.mounts()]
        if mount_point not in mounts:
            dbutils.fs.mount(
                source=f"wasbs://{config['container_name']}@{config['storage_account_name']}.blob.core.windows.net/",
                mount_point=mount_point,
                extra_configs={f"fs.azure.account.key.{config['storage_account_name']}.blob.core.windows.net": config['storage_account_access_key']}
            )
            logger.info(f"Mounted {config['container_name']} successfully at {mount_point}.")
        else:
            logger.info(f"{mount_point} is already mounted.")
        return mount_point
    except Exception as e:
        logger.error(f"Error mounting storage: {e}")
        raise
