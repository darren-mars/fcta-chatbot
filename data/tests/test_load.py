import pytest
from unittest.mock import MagicMock, patch
from data.src.load import ingest

@patch("data.src.load.spark")
def test_ingest_batch_mode(spark_mock, monkeypatch):
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl",
        "container_name": "my_container",
        "checkpoint_path": "/mnt/my_container/_checkpoint"
    }

    # Mock the chain of DataFrame operations
    read_stream_mock = MagicMock()
    write_stream_mock = MagicMock()

    spark_mock.readStream.format.return_value = read_stream_mock
    read_stream_mock.option.return_value = read_stream_mock
    read_stream_mock.schema.return_value = read_stream_mock
    read_stream_mock.load.return_value = read_stream_mock
    read_stream_mock.withColumn.return_value = read_stream_mock
    read_stream_mock.select.return_value = write_stream_mock
    write_stream_mock.writeStream.format.return_value = write_stream_mock
    write_stream_mock.option.return_value = write_stream_mock
    write_stream_mock.trigger.return_value = write_stream_mock
    write_stream_mock.table.return_value = None

    def dummy_udf(col):
        # Mock UDF to ensure code runs
        return col

    ingest(spark_mock, config, dummy_udf)

    spark_mock.readStream.format.assert_called_with("cloudFiles")
    write_stream_mock.trigger.assert_called_with(availableNow=True)
    write_stream_mock.table.assert_called_with("cat.sch.tbl")
