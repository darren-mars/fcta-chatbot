# tests/test_config.py

import pytest
import json
from unittest.mock import MagicMock, mock_open, patch
from data.src.config import get_config

@patch("builtins.open", new_callable=mock_open, read_data=json.dumps([
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
]))
@patch("data.src.config.dbutils")
def test_get_config_all_vars_set(mock_dbutils, mock_file):
    # Mock the widgets.get method
    def mock_widgets_get(key):
        return {
            "CATALOG_NAME": "test_catalog",
            "SCHEMA_NAME": "test_schema",
            "TABLE_NAME": "test_table",
            "CHECKPOINT_PATH": "/test/checkpoint",
            "CONFIG_FILE_PATH": "mount_points.json"
        }[key]
    
    mock_dbutils.widgets.get.side_effect = mock_widgets_get
    
    # Mock dbutils.secrets.get to return a fake access key
    mock_dbutils.secrets.get.return_value = "fake_access_key"
    
    config = get_config(mock_dbutils)
    
    assert config["catalog_name"] == "test_catalog"
    assert config["schema_name"] == "test_schema"
    assert config["table_name"] == "test_table"
    assert config["checkpoint_path"] == "/test/checkpoint"
    assert config["mount_points"] == [
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
        }
    ]

def test_get_config_missing_var():
    # Mock dbutils without "SCHEMA_NAME"
    mock_dbutils = MagicMock()
    def mock_widgets_get(key):
        return {
            "CATALOG_NAME": "test_catalog",
            # "SCHEMA_NAME" is missing
            "TABLE_NAME": "test_table",
            "CHECKPOINT_PATH": "/test/checkpoint",
            "CONFIG_FILE_PATH": "mount_points.json"
        }[key]
    mock_dbutils.widgets.get.side_effect = mock_widgets_get
    
    # Mock open to return valid JSON
    with patch("builtins.open", mock_open(read_data=json.dumps([
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
    ]))):
        # Mock dbutils.secrets.get to return a fake access key
        mock_dbutils.secrets.get.return_value = "fake_access_key"
        
        with pytest.raises(KeyError):
            get_config(mock_dbutils)
