# tests/test_config.py

import pytest
import json
from unittest.mock import MagicMock, mock_open, patch
import jsonschema
from data.src.config import get_config, validate_json_config, MOUNT_POINTS_SCHEMA


# Mock dbutils module
class MockDbutils:
    def __init__(self):
        self.widgets = MagicMock()
        self.secrets = MagicMock()


mock_dbutils = MockDbutils()

data_mount_points = [
    {
        "container_name": "test_container",
        "storage_account_name": "test_account",
        "storage_account_access_key": "${STORAGE_ACCOUNT_ACCESS_KEY}",
        "data_source_type": "csv",
        "subdirectories": [
            {
                "name": "subdir1",
                "schema_name": "schema1",
                "columns": ["col1", "col2"]
            }
        ]
    }
]

system_mount_points = [
    {
        "container_name": "system_container",
        "storage_account_name": "system_account",
        "storage_account_access_key": "${STORAGE_ACCOUNT_ACCESS_KEY}",
        "data_source_type": "pdf",
        "subdirectories": [
            {
                "name": "subdir2",
                "schema_name": "schema2",
                "columns": ["col3", "col4"]
            }
        ]
    }
]


@patch("builtins.open", new_callable=mock_open)
@patch("data.src.config.os.path.join", side_effect=lambda *args: "/".join(args))
def test_get_config_all_vars_set(mock_path_join, mock_file):
    # Mock the open function to return different JSON for data and system config files
    def mock_file_open(filepath, *args, **kwargs):
        if "data_mount_points.json" in filepath:
            return mock_open(read_data=json.dumps(data_mount_points)).return_value
        elif "system_mount_points.json" in filepath:
            return mock_open(read_data=json.dumps(system_mount_points)).return_value
        else:
            raise FileNotFoundError

    mock_file.side_effect = mock_file_open

    # Mock the widgets.get method
    def mock_widgets_get(key):
        return {
            "CATALOG_NAME": "test_catalog",
            "SCHEMA_NAME": "test_schema",
            "TABLE_NAME": "test_table",
            "CHECKPOINT_PATH": "/test/checkpoint",
            "DATA_CONFIG_FILE_PATH": "data_mount_points.json",
            "SYSTEM_CONFIG_FILE_PATH": "system_mount_points.json"
        }[key]

    mock_dbutils.widgets.get.side_effect = mock_widgets_get

    # Mock dbutils.secrets.get to return a fake access key
    mock_dbutils.secrets.get.return_value = "fake_access_key"

    config = get_config(mock_dbutils)

    expected_mount_points = [
        {
            "container_name": "test_container",
            "storage_account_name": "test_account",
            "storage_account_access_key": "fake_access_key",  # Placeholder replaced with secret
            "data_source_type": "csv",
            "subdirectories": [
                {
                    "name": "subdir1",
                    "schema_name": "schema1",
                    "columns": ["col1", "col2"]
                }
            ]
        },
        {
            "container_name": "system_container",
            "storage_account_name": "system_account",
            "storage_account_access_key": "fake_access_key",  # Placeholder replaced with secret
            "data_source_type": "pdf",
            "subdirectories": [
                {
                    "name": "subdir2",
                    "schema_name": "schema2",
                    "columns": ["col3", "col4"]
                }
            ]
        }
    ]

    print("Expected:", expected_mount_points)
    print("Actual:", config["mount_points"])

    assert config["delta_table"]["catalog_name"] == "test_catalog"
    assert config["delta_table"]["schema_name"] == "test_schema"
    assert config["delta_table"]["table_name"] == "test_table"
    assert config["checkpoint_path"] == "/test/checkpoint"
    assert config["mount_points"] == expected_mount_points


@patch("builtins.open", new_callable=mock_open, read_data=json.dumps(data_mount_points))
@patch("data.src.config.os.path.join", side_effect=lambda *args: "/".join(args))
def test_get_config_missing_var(mock_path_join, mock_file):
    # Mock the widgets.get method without "SCHEMA_NAME"
    def mock_widgets_get(key):
        return {
            "CATALOG_NAME": "test_catalog",
            # "SCHEMA_NAME" is missing
            "TABLE_NAME": "test_table",
            "CHECKPOINT_PATH": "/test/checkpoint",
            "DATA_CONFIG_FILE_PATH": "data_mount_points.json",
            "SYSTEM_CONFIG_FILE_PATH": "system_mount_points.json"
        }[key]
    mock_dbutils.widgets.get.side_effect = mock_widgets_get

    # Mock dbutils.secrets.get to return a fake access key
    mock_dbutils.secrets.get.return_value = "fake_access_key"

    with pytest.raises(KeyError):
        get_config(mock_dbutils)


def test_validate_json_config():
    valid_config = [
        {
            "container_name": "test_container",
            "storage_account_name": "test_account",
            "storage_account_access_key": "fake_access_key",
            "data_source_type": "csv",
            "subdirectories": [
                {
                    "name": "subdir1",
                    "schema_name": "schema1",
                    "columns": ["col1", "col2"]
                }
            ]
        }
    ]
    # This should pass without exception
    validate_json_config(valid_config, MOUNT_POINTS_SCHEMA)

    invalid_config = [
        {
            "container_name": "test_container",
            "storage_account_name": "test_account",
            "storage_account_access_key": "fake_access_key",
            "data_source_type": "csv",
            "subdirectories": [
                {
                    "name": "subdir1",
                    "schema_name": "schema1",
                    # "columns" is missing
                }
            ]
        }
    ]
    # This should raise a ValidationError
    with pytest.raises(jsonschema.exceptions.ValidationError):
        validate_json_config(invalid_config, MOUNT_POINTS_SCHEMA)
