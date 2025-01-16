import tempfile
from unittest.mock import MagicMock, patch

from data.src.load import ingest


@patch("data.src.load.ensure_table_exists")
def test_ingest_batch_mode(mock_ensure_table_exists, spark_session):
    """
    Tests ingest in batch mode (initial_run=False).
    Verifies we call .trigger(availableNow=True) on the correct chained mock.
    """
    with tempfile.TemporaryDirectory() as checkpoint_dir:
        config = {
            "delta_table": {
                "catalog_name": "cat",
                "schema_name": "sch",
                "table_name": "tbl",
            },
            "checkpoint_path": checkpoint_dir,
            "mount_points": [
                {
                    "container_name": "my_container",
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

        # Instead of using a real DataFrame, create a chainable mock that pretends to be streaming
        mock_streaming_df = MagicMock(name="streaming_df")
        # Mark it as isStreaming
        type(mock_streaming_df).isStreaming = True

        # Mock transformations on the DataFrame to return itself so chaining works
        mock_streaming_df.withColumn.return_value = mock_streaming_df
        mock_streaming_df.select.return_value = mock_streaming_df
        mock_streaming_df.dropDuplicates.return_value = mock_streaming_df

        # Create a mock for the "first" DataStreamWriter
        write_stream_mock = MagicMock(name="write_stream")

        # Create a separate mock for the DataStreamWriter returned after .foreachBatch(...)
        foreach_batch_mock = MagicMock(name="foreach_batch_writer")

        # Chain: df.writeStream => write_stream_mock
        type(mock_streaming_df).writeStream = write_stream_mock

        # Chain: write_stream_mock.foreachBatch(...) => foreach_batch_mock
        write_stream_mock.foreachBatch.return_value = foreach_batch_mock

        # The rest of the methods chain on foreach_batch_mock
        foreach_batch_mock.option.return_value = foreach_batch_mock
        foreach_batch_mock.trigger.return_value = foreach_batch_mock
        foreach_batch_mock.start.return_value = MagicMock(name="streaming_query")

        # We also need to mock the DataStreamReader methods to return our mock_streaming_df
        from pyspark.sql.streaming import DataStreamReader
        with patch.object(DataStreamReader, 'format', return_value=MagicMock()) as mock_format, \
             patch.object(DataStreamReader, 'option', return_value=MagicMock()) as mock_option, \
             patch.object(DataStreamReader, 'schema', return_value=MagicMock()) as mock_schema, \
             patch.object(DataStreamReader, 'load', return_value=mock_streaming_df) as mock_load:

            # Setup the chain return values for DataStreamReader
            mock_format.return_value.format = mock_format
            mock_format.return_value.option = mock_option
            mock_option.return_value.option = mock_option
            mock_option.return_value.schema = mock_schema
            mock_schema.return_value.schema = mock_schema
            mock_schema.return_value.load = mock_load
            mock_option.return_value.load = mock_load
            mock_format.return_value.load = mock_load

            # Now run ingest, which will use our mock streaming df
            ingest(spark_session, config, initial_run=False)

            # Assertions to verify the streaming behavior
            mock_ensure_table_exists.assert_called_once_with(spark_session, config["delta_table"])
            # IMPORTANT: We check that .trigger(availableNow=True) was called on foreach_batch_mock,
            # because that's the object returned after .foreachBatch(...).
            foreach_batch_mock.trigger.assert_called_once_with(availableNow=True)
            foreach_batch_mock.start.assert_called_once()


@patch("data.src.load.ensure_table_exists")
def test_ingest_initial_run(mock_ensure_table_exists, spark_session):
    """
    Tests ingest in initial run mode (initial_run=True).
    Verifies we call .trigger(availableNow=True) on the correct chained mock.
    """
    with tempfile.TemporaryDirectory() as checkpoint_dir:
        config = {
            "delta_table": {
                "catalog_name": "cat",
                "schema_name": "sch",
                "table_name": "tbl",
            },
            "checkpoint_path": checkpoint_dir,
            "mount_points": [
                {
                    "container_name": "my_container",
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

        # Instead of using a real DataFrame, create a chainable mock that pretends to be streaming
        mock_streaming_df = MagicMock(name="streaming_df")
        # Mark it as isStreaming
        type(mock_streaming_df).isStreaming = True

        # Mock transformations on the DataFrame to return itself so chaining works
        mock_streaming_df.withColumn.return_value = mock_streaming_df
        mock_streaming_df.select.return_value = mock_streaming_df
        mock_streaming_df.dropDuplicates.return_value = mock_streaming_df

        # Create a mock for the "first" DataStreamWriter
        write_stream_mock = MagicMock(name="write_stream")

        # Create a separate mock for the DataStreamWriter returned after .foreachBatch(...)
        foreach_batch_mock = MagicMock(name="foreach_batch_writer")

        # Chain: df.writeStream => write_stream_mock
        type(mock_streaming_df).writeStream = write_stream_mock

        # Chain: write_stream_mock.foreachBatch(...) => foreach_batch_mock
        write_stream_mock.foreachBatch.return_value = foreach_batch_mock

        # The rest of the methods chain on foreach_batch_mock
        foreach_batch_mock.option.return_value = foreach_batch_mock
        foreach_batch_mock.trigger.return_value = foreach_batch_mock
        foreach_batch_mock.start.return_value = MagicMock(name="streaming_query")

        # We also need to mock the DataStreamReader methods to return our mock_streaming_df
        from pyspark.sql.streaming import DataStreamReader
        with patch.object(DataStreamReader, 'format', return_value=MagicMock()) as mock_format, \
            patch.object(DataStreamReader, 'option', return_value=MagicMock()) as mock_option, \
            patch.object(DataStreamReader, 'schema', return_value=MagicMock()) as mock_schema, \
            patch.object(DataStreamReader, 'load', return_value=mock_streaming_df) as mock_load: \

            # Setup the chain return values for DataStreamReader
            mock_format.return_value.format = mock_format
            mock_format.return_value.option = mock_option
            mock_option.return_value.option = mock_option
            mock_option.return_value.schema = mock_schema
            mock_schema.return_value.schema = mock_schema
            mock_schema.return_value.load = mock_load
            mock_option.return_value.load = mock_load
            mock_format.return_value.load = mock_load

            # Now run ingest, which will use our mock streaming df
            ingest(spark_session, config, initial_run=True)

            # Assertions to verify the streaming behavior
            mock_ensure_table_exists.assert_called_once_with(spark_session, config["delta_table"])
            # IMPORTANT: We check that .trigger(availableNow=True) was called on foreach_batch_mock,
            # not on write_stream_mock.
            foreach_batch_mock.trigger.assert_called_once_with(availableNow=True)
            foreach_batch_mock.start.assert_called_once()
