# tests/test_mount.py
import pytest
from unittest.mock import MagicMock
from data.src.mount import mount_storage


def test_mount_storage_already_mounted():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mounts.return_value = [MagicMock(mountPoint="/mnt/test_container")]
    config = {
        "mount_points": [
            {
                "container_name": "test_container",
                "storage_account_name": "test_account",
                "storage_account_access_key": "test_key",
                "data_source_type": "csv"
            }
        ]
    }

    mounted_paths = mount_storage(dbutils_mock, config)
    assert mounted_paths == ["/mnt/test_container"]
    # Ensure no attempt to mount again
    dbutils_mock.fs.mount.assert_not_called()


def test_mount_storage_new_mount():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mounts.return_value = []
    config = {
        "mount_points": [
            {
                "container_name": "test_container",
                "storage_account_name": "test_account",
                "storage_account_access_key": "test_key",
                "data_source_type": "csv"
            }
        ]
    }

    mounted_paths = mount_storage(dbutils_mock, config)
    assert mounted_paths == ["/mnt/test_container"]
    dbutils_mock.fs.mount.assert_called_once_with(
        source="wasbs://test_container@test_account.blob.core.windows.net/",
        mount_point="/mnt/test_container",
        extra_configs={"fs.azure.account.key.test_account.blob.core.windows.net": "test_key"}
    )


def test_mount_storage_multiple_mounts():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mounts.return_value = []
    config = {
        "mount_points": [
            {
                "container_name": "test_container1",
                "storage_account_name": "test_account1",
                "storage_account_access_key": "test_key1",
                "data_source_type": "csv"
            },
            {
                "container_name": "test_container2",
                "storage_account_name": "test_account2",
                "storage_account_access_key": "test_key2",
                "data_source_type": "csv"
            }
        ]
    }

    mounted_paths = mount_storage(dbutils_mock, config)
    assert mounted_paths == ["/mnt/test_container1", "/mnt/test_container2"]
    assert dbutils_mock.fs.mount.call_count == 2
    dbutils_mock.fs.mount.assert_any_call(
        source="wasbs://test_container1@test_account1.blob.core.windows.net/",
        mount_point="/mnt/test_container1",
        extra_configs={"fs.azure.account.key.test_account1.blob.core.windows.net": "test_key1"}
    )
    dbutils_mock.fs.mount.assert_any_call(
        source="wasbs://test_container2@test_account2.blob.core.windows.net/",
        mount_point="/mnt/test_container2",
        extra_configs={"fs.azure.account.key.test_account2.blob.core.windows.net": "test_key2"}
    )


def test_mount_storage_failure():
    dbutils_mock = MagicMock()
    dbutils_mock.fs.mount.side_effect = Exception("Mount error")
    config = {
        "mount_points": [
            {
                "container_name": "test_container",
                "storage_account_name": "test_account",
                "storage_account_access_key": "test_key",
                "data_source_type": "csv"
            }
        ]
    }

    with pytest.raises(Exception):
        mount_storage(dbutils_mock, config)
