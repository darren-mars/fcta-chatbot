import pytest
from unittest.mock import MagicMock, patch
from data.src.mount import mount_storage

def test_mount_storage_already_mounted():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mounts.return_value = [MagicMock(mountPoint="/mnt/test_container")]
    config = {"container_name": "test_container", "storage_account_name": "acc", "storage_account_access_key": "key"}
    
    mount_point = mount_storage(dbutils_mock, config)
    assert mount_point == "/mnt/test_container"
    # Ensure no attempt to mount again
    dbutils_mock.fs.mount.assert_not_called()

def test_mount_storage_new_mount():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mounts.return_value = []
    config = {"container_name": "test_container", "storage_account_name": "acc", "storage_account_access_key": "key"}
    
    mount_point = mount_storage(dbutils_mock, config)
    assert mount_point == "/mnt/test_container"
    dbutils_mock.fs.mount.assert_called_once()

def test_mount_storage_failure():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mount.side_effect = Exception("Mount error")
    config = {"container_name": "test_container", "storage_account_name": "acc", "storage_account_access_key": "key"}
    
    with pytest.raises(Exception):
        mount_storage(dbutils_mock, config)
