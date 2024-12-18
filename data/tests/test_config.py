import os
import pytest
from data.src.config import get_config

def test_get_config_all_vars_set(monkeypatch):
    monkeypatch.setenv("STORAGE_ACCOUNT_NAME", "test_account")
    monkeypatch.setenv("STORAGE_ACCOUNT_ACCESS_KEY", "test_key")
    monkeypatch.setenv("CONTAINER_NAME", "test_container")
    monkeypatch.setenv("CATALOG_NAME", "test_catalog")
    monkeypatch.setenv("SCHEMA_NAME", "test_schema")
    monkeypatch.setenv("TABLE_NAME", "test_table")
    monkeypatch.setenv("CHECKPOINT_PATH", "/test/checkpoint")

    config = get_config()
    assert config["storage_account_name"] == "test_account"
    assert config["table_name"] == "test_table"

def test_get_config_missing_var(monkeypatch):
    monkeypatch.delenv("STORAGE_ACCOUNT_NAME", raising=False)
    with pytest.raises(KeyError):
        get_config()
