# tests/test_tables.py
import pytest
from unittest.mock import MagicMock
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, ArrayType
from data.src.tables import ensure_table_exists, get_struct_type


def test_get_struct_type():
    schema_config = [
        {"name": "field1", "type": "string"},
        {"name": "field2", "type": "timestamp"},
        {"name": "field3", "type": "array<string>"}
    ]

    expected_schema = StructType([
        StructField("field1", StringType(), True),
        StructField("field2", TimestampType(), True),
        StructField("field3", ArrayType(StringType(), True), True)
    ])

    result_schema = get_struct_type(schema_config)

    assert result_schema == expected_schema


def test_ensure_table_exists_creation():
    spark_mock = MagicMock()
    # Table doesn't exist, so it will attempt to create it
    spark_mock.catalog.tableExists.return_value = False

    mock_df = MagicMock()
    spark_mock.createDataFrame.return_value = mock_df

    mock_write = MagicMock()
    mock_df.write = mock_write

    # Chain all calls to return the same mock to avoid breaking the chain
    mock_write.format.return_value = mock_write
    mock_write.options.return_value = mock_write
    mock_write.mode.return_value = mock_write

    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl",
        "schema": [
            {"name": "field1", "type": "string"},
            {"name": "field2", "type": "timestamp"},
            {"name": "field3", "type": "array<string>"}
        ],
        "delta_options": {"delta.enableChangeDataFeed": "true"}
    }

    ensure_table_exists(spark_mock, config)

    # Check calls
    spark_mock.catalog.tableExists.assert_called_once_with("cat.sch.tbl")

    mock_write.format.assert_called_once_with("delta")
    # Correctly use assert_any_call with keyword arguments
    mock_write.options.assert_called_once_with(**{"delta.enableChangeDataFeed": "true"})
    mock_write.mode.assert_called_once_with("overwrite")
    mock_write.saveAsTable.assert_called_once_with("cat.sch.tbl")


def test_ensure_table_exists_already_exists():
    spark_mock = MagicMock()
    spark_mock.catalog.tableExists.return_value = True
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl"
    }

    ensure_table_exists(spark_mock, config)

    # Since table exists, no creation should occur
    spark_mock.createDataFrame.assert_not_called()


def test_get_struct_type_invalid():
    schema_config = [
        {"name": "field1", "type": "unsupported_type"}
    ]

    with pytest.raises(ValueError):
        get_struct_type(schema_config)
