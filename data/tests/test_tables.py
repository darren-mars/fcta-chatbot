import pytest
from unittest.mock import MagicMock
from data.src.tables import ensure_table_exists

import pytest
from unittest.mock import MagicMock
from data.src.tables import ensure_table_exists

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
    mock_write.option.return_value = mock_write
    mock_write.mode.return_value = mock_write

    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl"
    }

    ensure_table_exists(spark_mock, config)

    # Check calls
    spark_mock.catalog.tableExists.assert_called_once_with("cat.sch.tbl")

    mock_write.format.assert_called_once_with("delta")
    # assert_any_call is useful if multiple .option calls are made
    mock_write.option.assert_any_call("delta.enableChangeDataFeed", "true")
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
