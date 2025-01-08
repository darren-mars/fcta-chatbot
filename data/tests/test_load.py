# test_load.py
from unittest.mock import MagicMock, patch
import pytest
from pyspark.sql.types import StructType, StructField, StringType, TimestampType, BinaryType, LongType
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType

from data.src.load import ingest

@patch("data.src.load.ensure_table_exists")
def test_ingest_batch_mode(mock_ensure_table_exists, spark_session):
    config = {
        "catalog_name": "cat",
        "schema_name": "sch",
        "table_name": "tbl",
        "checkpoint_path": "/mnt/my_container/_checkpoint",
        "mount_points": [
            {
                "container_name": "my_container",
                "storage_account_name": "acc",
                "storage_account_access_key": "key",
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
    }

    # Create a mock UDF that returns an array of strings to simulate the real UDF
    mock_extract_and_chunk_text_udf = udf(lambda c: ["chunk1", "chunk2"], ArrayType(StringType()))

    # Instead of using a real DataFrame, create a chainable mock that pretends to be streaming
    mock_streaming_df = MagicMock(name="streaming_df")
    # Set isStreaming to True to simulate a streaming DataFrame
    type(mock_streaming_df).isStreaming = True

    # Mock transformations to return the same mock so chaining works:
    mock_streaming_df.withColumn.return_value = mock_streaming_df
    mock_streaming_df.select.return_value = mock_streaming_df

    # Now mock writeStream (which should return another mock that can be triggered)
    write_stream_mock = MagicMock(name="write_stream")
    # Make sure write_stream methods return write_stream_mock for chaining
    write_stream_mock.format.return_value = write_stream_mock
    write_stream_mock.option.return_value = write_stream_mock
    write_stream_mock.trigger.return_value = write_stream_mock
    write_stream_mock.table.return_value = None

    # Attach writeStream to the mock streaming df
    type(mock_streaming_df).writeStream = write_stream_mock

    # We also need to mock the DataStreamReader methods to return our mock_streaming_df
    from pyspark.sql.streaming import DataStreamReader
    with patch.object(DataStreamReader, 'format', return_value=MagicMock()) as mock_format, \
         patch.object(DataStreamReader, 'option', return_value=MagicMock()) as mock_option, \
         patch.object(DataStreamReader, 'schema', return_value=MagicMock()) as mock_schema, \
         patch.object(DataStreamReader, 'load', return_value=mock_streaming_df) as mock_load:

        # Setup the chain return values for DataStreamReader methods
        mock_format.return_value.format = mock_format
        mock_format.return_value.option = mock_option
        mock_option.return_value.option = mock_option
        mock_option.return_value.schema = mock_schema
        mock_schema.return_value.schema = mock_schema
        mock_schema.return_value.load = mock_load
        mock_option.return_value.load = mock_load
        mock_format.return_value.load = mock_load

        # Now run ingest, which will use our mock streaming df
        ingest(spark_session, config, mock_extract_and_chunk_text_udf)

        # Assertions to verify the streaming behavior
        mock_ensure_table_exists.assert_called_once_with(spark_session, config)
        write_stream_mock.trigger.assert_called_once_with(availableNow=True)
        write_stream_mock.table.assert_called_once_with("cat.sch.tbl")
