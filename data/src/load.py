import logging
import sys
from typing import Any, Dict, List, Optional

from pyspark.sql import DataFrame, SparkSession
from pyspark.sql.functions import col, input_file_name, concat_ws
from pyspark.sql.types import (
    StructType,
    StructField,
    StringType,
    TimestampType,
    BinaryType,
    LongType,
)
from data.src.tables import ensure_table_exists
from data.src.chunk import extract_pdf_text


def initialize_logger(name: str = __name__) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.hasHandlers():
        logger.setLevel(logging.INFO)
        stream_handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            "%(asctime)s %(levelname)s %(name)s: %(message)s"
        )
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)
    return logger


logger = initialize_logger()


def get_binary_schema() -> StructType:
    return StructType(
        [
            StructField("path", StringType(), True),
            StructField("modificationTime", TimestampType(), False),
            StructField("length", LongType(), False),
            StructField("content", BinaryType(), True),
        ]
    )


def process_pdf_mount_point(
    spark: SparkSession,
    mount: Dict[str, Any],
    config: Dict[str, Any],
    include_existing_files: str = "false",
) -> DataFrame:
    container_name = mount["container_name"]
    mount_point = f"/mnt/{container_name}/pdf"
    binary_schema = get_binary_schema()

    pdf_schema_location = f"{config['checkpoint_path']}/pdf/schema"
    pdf_checkpoint_path = f"{config['checkpoint_path']}/pdf/checkpoint"

    logger.info(f"Starting ingestion of PDFs from {mount_point}.")

    pdf_stream_df = (
        spark.readStream.format("cloudFiles")
        .option("cloudFiles.format", "binaryFile")
        .option("cloudFiles.includeExistingFiles", include_existing_files)
        .option("cloudFiles.schemaLocation", pdf_schema_location)
        .option("recursiveFileLookup", "true")
        .schema(binary_schema)
        .load(mount_point)
        .select("path", "content")
    )

    def foreach_batch_pdf(df: DataFrame, batch_id: int):
        logger.info(f"[PDF] Micro-batch {batch_id} with {df.count()} records.")

        # Rows for final DataFrame
        rows_for_df = []

        # Suppose we defined a schema to match the final Delta table
        from pyspark.sql.types import (
            StructType,
            StructField,
            StringType,
            TimestampType,
        )

        pdf_schema = StructType(
            [
                StructField("filename", StringType(), True),
                StructField("content_chunk", StringType(), True),
                StructField("load_timestamp", TimestampType(), True),
            ]
        )

        for row in df.collect():
            path_val = row["path"]
            pdf_chunks = extract_pdf_text(row["content"])
            filename_val = path_val.split("/")[-1] if path_val else None

            for chunk in pdf_chunks:
                # We'll fill array columns as None => null arrays
                # load_timestamp we'll fill after DataFrame creation.
                rows_for_df.append(
                    (
                        filename_val,
                        chunk,
                        None,  # load_timestamp
                    )
                )

        if not rows_for_df:
            logger.info(
                "No PDF chunks in this micro-batch, skipping creation."
            )
            return

        spark_local = df.sparkSession
        pdf_df = spark_local.createDataFrame(rows_for_df, pdf_schema)
        from pyspark.sql.functions import current_timestamp

        pdf_df = pdf_df.withColumn("load_timestamp", current_timestamp())

        pdf_df.write.format("delta").mode("append").option(
            "checkpointLocation", f"{pdf_checkpoint_path}/batch_{batch_id}"
        ).saveAsTable(
            f"{config['delta_table']['catalog_name']}."
            f"{config['delta_table']['schema_name']}."
            f"{config['delta_table']['table_name']}"
        )

    pdf_query = (
        pdf_stream_df.writeStream.foreachBatch(foreach_batch_pdf)
        .option("checkpointLocation", pdf_checkpoint_path)
        .trigger(availableNow=True)
        .start()
    )

    pdf_query.awaitTermination()
    logger.info(f"Completed PDF ingestion from {mount_point}.")
    return pdf_stream_df


def process_csv_mount_point(
    spark: SparkSession,
    mount: Dict[str, Any],
    config: Dict[str, Any],
    include_existing_files: str = "false",
) -> List[DataFrame]:
    """
    Processes CSV files from different subdirectories in /mnt/<container>/csv.

    - If subdir_name == "packages-website", we:
    1) Strip HTML from 'product_description'.
    2) If length > 2,000, chunk only 'product_description' while
    repeating other columns as metadata.
    - Otherwise, treat each row as a single chunk (row-per-chunk approach).
    """
    import re

    container_name = mount["container_name"]
    mount_point = f"/mnt/{container_name}/csv"
    df_list: List[DataFrame] = []

    for subdir in mount.get("subdirectories", []):
        subdir_name = subdir["name"]
        schema_name = subdir["schema_name"]

        all_columns = subdir["columns"]
        needed_columns = subdir.get("needed_columns", all_columns)

        logger.info(
            f"Processing CSV subdir '{subdir_name}' with schema '{schema_name}'."
        )

        csv_schema_location = f"{config['checkpoint_path']}/csv/{subdir_name}/schema"
        csv_checkpoint_path = (
            f"{config['checkpoint_path']}/csv/{subdir_name}/checkpoint"
        )

        # Read CSV with multiLine and proper quote options
        csv_stream_df = (
            spark.readStream.format("cloudFiles")
            .option("cloudFiles.format", "csv")
            .option("cloudFiles.includeExistingFiles", include_existing_files)
            .option("cloudFiles.schemaLocation", csv_schema_location)
            .option("recursiveFileLookup", "true")
            .option("header", "true")
            .option("inferSchema", "false")
            .option("sep", ",")
            .option("multiLine", "true")  # Handle multi-line fields
            .option("quote", "|")
            .option(
                "mode", "PERMISSIVE"
            )  # Continue parsing even if some rows are malformed
            .load(f"{mount_point}/{subdir_name}/")
            .withColumn("full_path", input_file_name())
            .select(*needed_columns, "full_path")
            .dropDuplicates(needed_columns)
        )

        if subdir_name == "packages-website":
            # Handle 'packages-website' subdirectory specifically
            package_df = csv_stream_df.select(*needed_columns, "full_path")

            def foreach_batch_csv_packages(df: DataFrame, batch_id: int):
                logger.info(
                    f"[CSV - packages-website] Micro-batch {batch_id}, {df.count()} records."
                )
                collected_rows = df.collect()

                from pyspark.sql.types import (
                    StructType,
                    StructField,
                    StringType,
                    TimestampType,
                )

                final_schema = StructType(
                    [
                        StructField("filename", StringType(), True),
                        StructField("content_chunk", StringType(), True),
                        StructField("load_timestamp", TimestampType(), True),
                    ]
                )

                def cleanse_html(text: str) -> str:
                    """Removes HTML tags using regex."""
                    if not text:
                        return ""
                    no_tags = re.sub(r"<[^>]*>", "", text)
                    return no_tags.strip()

                def split_text_if_needed(desc: str, threshold: int = 2000) -> List[str]:
                    """Splits text into sub-chunks of up to `threshold` characters."""
                    return [
                        desc[i:i + threshold] for i in range(0, len(desc), threshold)
                    ]

                final_rows = []

                for row in collected_rows:
                    # Direct column access to prevent misalignment
                    product_desc_raw = row["product_description"]
                    product_desc_clean = cleanse_html(product_desc_raw)

                    # Build metadata from all columns except 'product_description' and 'full_path'
                    metadata_parts = []
                    for c in needed_columns:
                        if c not in ["product_description", "full_path"]:
                            val = row[c]
                            val_str = cleanse_html(str(val)) if val else ""
                            metadata_parts.append(f"{c}={val_str}")

                    metadata_str = " | ".join(metadata_parts)

                    # Get filename from 'full_path'
                    path_val = row["full_path"]
                    filename_val = path_val.split("/")[-1] if path_val else None

                    if len(product_desc_clean) <= 2000:
                        combined_chunk = (
                            f"{product_desc_clean}\nMetadata:\n{metadata_str}"
                        )
                        final_rows.append(
                            (
                                filename_val,
                                combined_chunk,
                                None,  # load_timestamp
                            )
                        )
                    else:
                        # Split only 'product_description' into multiple chunks
                        subchunks = split_text_if_needed(product_desc_clean, 2000)
                        for subc in subchunks:
                            combined_chunk = f"{subc}\nMetadata:\n{metadata_str}"
                            final_rows.append(
                                (
                                    filename_val,
                                    combined_chunk,
                                    None,  # load_timestamp
                                )
                            )

                if not final_rows:
                    logger.info(
                        "No CSV rows found in this micro-batch after processing."
                    )
                    return

                spark_local = df.sparkSession
                chunk_df = spark_local.createDataFrame(final_rows, final_schema)

                from pyspark.sql.functions import current_timestamp

                chunk_df = chunk_df.withColumn("load_timestamp", current_timestamp())

                chunk_df.write.format("delta").mode("append").option(
                    "checkpointLocation", f"{csv_checkpoint_path}/batch_{batch_id}"
                ).saveAsTable(
                    f"""
                        {config['delta_table']['catalog_name']}
                        .{config['delta_table']['schema_name']}
                        .{config['delta_table']['table_name']}
                    """
                )

            csv_query = (
                package_df.writeStream.foreachBatch(foreach_batch_csv_packages)
                .option("checkpointLocation", csv_checkpoint_path)
                .trigger(availableNow=True)
                .start()
            )
            csv_query.awaitTermination()
            logger.info(
                f"Completed CSV ingestion for '{subdir_name}' with schema '{schema_name}'."
            )
            df_list.append(package_df)

        else:
            # For other subdirectories, keep 'contents' as concatenation of all needed_columns
            contents_df = csv_stream_df.withColumn(
                "contents", concat_ws(" ", *[col(c) for c in needed_columns])
            ).select(*needed_columns, "contents", "full_path")

            def foreach_batch_csv_other(df: DataFrame, batch_id: int):
                logger.info(
                    f"[CSV - {subdir_name}] Micro-batch {batch_id}, {df.count()} records."
                )
                collected_rows = df.collect()

                from pyspark.sql.types import (
                    StructType,
                    StructField,
                    StringType,
                    TimestampType,
                )

                final_schema = StructType(
                    [
                        StructField("filename", StringType(), True),
                        StructField("content_chunk", StringType(), True),
                        StructField("load_timestamp", TimestampType(), True),
                    ]
                )

                final_rows = []

                for row in collected_rows:
                    row_text = row["contents"]
                    path_val = row["full_path"]
                    filename_val = path_val.split("/")[-1] if path_val else None

                    if row_text and row_text.strip():
                        final_rows.append(
                            (
                                filename_val,
                                row_text,
                                None,  # load_timestamp
                            )
                        )

                if not final_rows:
                    logger.info(
                        "No CSV rows found in this micro-batch after processing."
                    )
                    return

                spark_local = df.sparkSession
                chunk_df = spark_local.createDataFrame(final_rows, final_schema)

                from pyspark.sql.functions import current_timestamp

                chunk_df = chunk_df.withColumn("load_timestamp", current_timestamp())

                chunk_df.write.format("delta").mode("append").option(
                    "checkpointLocation", f"{csv_checkpoint_path}/batch_{batch_id}"
                ).saveAsTable(
                    f"""
                        {config['delta_table']['catalog_name']}
                        .{config['delta_table']['schema_name']}
                        .{config['delta_table']['table_name']}
                    """
                )

            csv_query = (
                contents_df.writeStream.foreachBatch(foreach_batch_csv_other)
                .option("checkpointLocation", csv_checkpoint_path)
                .trigger(availableNow=True)
                .start()
            )
            csv_query.awaitTermination()
            logger.info(
                f"Completed CSV ingestion for '{subdir_name}' with schema '{schema_name}'."
            )
            df_list.append(contents_df)

    return df_list


def union_dataframes(df_list: List[DataFrame]) -> Optional[DataFrame]:
    if not df_list:
        logger.warning("No DataFrames to union. Exiting.")
        return None

    unified_df = df_list[0]
    for df in df_list[1:]:
        unified_df = unified_df.unionByName(df, allowMissingColumns=True)

    logger.info("Successfully unified all DataFrames.")
    return unified_df


def write_to_delta_table(
    unified_df: DataFrame, table_config: Dict[str, Any], checkpoint_path: str
):
    full_table_name = f"{table_config['catalog_name']}.{table_config['schema_name']}.{table_config['table_name']}"
    logger.info(f"About to write final data to Delta table '{full_table_name}'.")

    try:
        query = (
            unified_df.writeStream.format("delta")
            .outputMode("append")
            .option("checkpointLocation", checkpoint_path)
            .trigger(availableNow=True)
            .table(full_table_name)
        )
        query.awaitTermination()
        logger.info(f"Successfully wrote data to Delta table '{full_table_name}'.")
    except Exception as e:
        logger.error(
            f"Error writing to Delta table '{full_table_name}': {e}", exc_info=True
        )
        raise


def ingest(
    spark: SparkSession, config: Dict[str, Any], initial_run: bool = False
) -> None:
    logger.info("Starting batch ingestion...")

    try:
        # Ensure table exists
        ensure_table_exists(spark, config["delta_table"])

        df_list: List[DataFrame] = []

        for mount in config.get("mount_points", []):
            data_source_type = mount["data_source_type"].lower()
            container_name = mount["container_name"]
            mount_point = f"/mnt/{container_name}"

            logger.info(f"Processing mount '{mount_point}' as '{data_source_type}'.")

            if data_source_type == "pdf":
                pdf_df = process_pdf_mount_point(
                    spark,
                    mount,
                    config,
                    include_existing_files="true" if initial_run else "false",
                )
                df_list.append(pdf_df)
            elif data_source_type == "csv":
                csv_dfs = process_csv_mount_point(
                    spark,
                    mount,
                    config,
                    include_existing_files="true" if initial_run else "false",
                )
                df_list.extend(csv_dfs)
            else:
                logger.warning(
                    f"Unknown data_source_type '{data_source_type}' at '{mount_point}'. Skipping."
                )

        unified_df = union_dataframes(df_list)
        if unified_df is not None:
            logger.info(
                "Note: PDF/CSV data was written in 'foreachBatch'. The 'unified_df' is optional."
            )
            # Optionally do a final single write if needed:
            # write_to_delta_table(unified_df, config["delta_table"], config["checkpoint_path"])

        logger.info("Batch ingestion completed successfully.")

    except Exception as e:
        logger.error(f"Error during ingestion: {e}", exc_info=True)
        raise
