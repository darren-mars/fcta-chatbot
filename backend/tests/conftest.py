import pytest
from pyspark.sql import SparkSession


@pytest.fixture(scope="session")
def spark_session():
    """
    Creates a Spark session for testing. This session will be reused by all tests
    in the session, reducing overhead.

    The session is configured to run locally and may be tuned to your environment’s needs.
    """
    spark = (
        SparkSession.builder
        .master("local[*]")
        .appName("TestSession")
        .config("spark.ui.enabled", "false")  # Disable UI for faster tests
        .config("spark.sql.shuffle.partitions", "2")  # Fewer partitions for tests
        .getOrCreate()
    )
    yield spark
    spark.stop()
