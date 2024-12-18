import pytest
from unittest.mock import MagicMock
from data.src.load import ingest

def test_ingest_batch_mode(spark_session):
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl",
        "container_name": "my_container",
        "checkpoint_path": "/mnt/my_container/_checkpoint"
    }

    # Create an empty DataFrame to simulate input data
    empty_df = spark_session.createDataFrame([], "path STRING, modificationTime TIMESTAMP, length LONG, content BINARY")

    # Get the DataStreamReader instance from spark_session.readStream
    data_stream_reader = spark_session.readStream
    
    # Mock the chain of calls: format, option, schema, load
    from unittest.mock import MagicMock
    data_stream_reader.format = MagicMock(return_value=data_stream_reader)
    data_stream_reader.option = MagicMock(return_value=data_stream_reader)
    data_stream_reader.schema = MagicMock(return_value=data_stream_reader)
    data_stream_reader.load = MagicMock(return_value=empty_df)

    def mock_write_stream():
        write_mock = MagicMock()
        write_mock.format.return_value = write_mock
        write_mock.option.return_value = write_mock
        write_mock.trigger.return_value = write_mock
        write_mock.table.return_value = None
        return write_mock

    write_stream_mock = mock_write_stream()

    old_select = empty_df.select
    def select_mock(*args, **kwargs):
        df_write_mock = old_select(*args, **kwargs)
        df_write_mock.writeStream = write_stream_mock
        return df_write_mock
    empty_df.select = select_mock

    def dummy_udf(col):
        return col

    from data.src.load import ingest
    ingest(spark_session, config, dummy_udf)

    # Assertions
    write_stream_mock.trigger.assert_called_once_with(availableNow=True)
    write_stream_mock.table.assert_called_once_with("cat.sch.tbl")
