import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


def mount_storage(dbutils, config: Dict[str, Any]) -> List[str]:
    """
    Mounts Azure Blob Storage containers based on the provided configuration.

    Args:
        dbutils: Databricks utilities for mounting storage.
        config (Dict[str, Any]): Configuration dictionary containing mount point details.

    Returns:
        List[str]: List of successfully mounted paths.
    """
    mounted_paths = []

    for mount in config.get("mount_points", []):
        container_name = mount["container_name"]
        storage_account_name = mount["storage_account_name"]
        storage_account_access_key = mount["storage_account_access_key"]

        mount_point = f"/mnt/{container_name}"

        try:
            # Check if already mounted
            if any(m.mountPoint == mount_point for m in dbutils.fs.mounts()):
                logger.info(f"Mount point '{mount_point}' already exists. Skipping.")
                mounted_paths.append(mount_point)
                continue

            # Construct the source URL
            source = f"wasbs://{container_name}@{storage_account_name}.blob.core.windows.net/"

            # Mount the storage
            dbutils.fs.mount(
                source=source,
                mount_point=mount_point,
                extra_configs={
                    f"fs.azure.account.key.{storage_account_name}.blob.core.windows.net": storage_account_access_key
                }
            )
            logger.info(f"Successfully mounted '{mount_point}'.")
            mounted_paths.append(mount_point)
        except Exception as e:
            logger.error(f"Failed to mount '{mount_point}': {e}", exc_info=True)
            raise

    return mounted_paths
