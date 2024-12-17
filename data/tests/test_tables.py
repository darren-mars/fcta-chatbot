import pytest
from unittest.mock import MagicMock
from data.src.tables import ensure_table_exists

def test_ensure_table_exists_creation():
    spark_mock = MagicMock()
    spark_mock.catalog.tableExists.return_value = False
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl"
    }

    ensure_table_exists(spark_mock, config)
    spark_mock.catalog.tableExists.assert_called_once_with("cat.sch.tbl")
    spark_mock.createDataFrame.assert_called()  # Table creation should occur
    spark_mock.createDataFrame.return_value.write.saveAsTable.assert_called_with("cat.sch.tbl")

def test_ensure_table_exists_already_exists():
    spark_mock = MagicMock()
    spark_mock.catalog.tableExists.return_value = True
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl"
    }

    ensure_table_exists(spark_mock, config)
    # No creation, just checking
    spark_mock.createDataFrame.assert_not_called()
