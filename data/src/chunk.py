import logging
import io
from typing import List

import fitz  # PyMuPDF
import pytesseract
from PIL import Image

from pyspark.sql.functions import udf
from pyspark.sql.types import StringType, ArrayType


def initialize_logger(name: str = __name__) -> logging.Logger:
    """
    Initializes and configures the logger for the chunking module.
    """
    logger = logging.getLogger(name)
    if not logger.hasHandlers():
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


logger = initialize_logger()


def chunk_text_general(
    texts: List[str],
    chunk_size: int = 2000,
    overlap_size: int = 200
) -> List[str]:
    """
    Aggregates smaller text blocks (~multiple rows or pages) until ~chunk_size
    is reached, then splits them into overlapping segments. Useful for both
    CSV and PDF ingestion.
    """
    aggregated_blocks = []
    current_block = ""

    # 1) Aggregate smaller blocks until ~chunk_size
    for text in texts:
        if not text:
            continue
        if len(current_block) + len(text) + 1 > chunk_size:
            if current_block.strip():
                aggregated_blocks.append(current_block)
            current_block = text
        else:
            current_block += (" " + text) if current_block else text

    if current_block.strip():
        aggregated_blocks.append(current_block)

    # 2) Overlap-based splitting of each aggregated block
    final_chunks = []
    for block in aggregated_blocks:
        i = 0
        while i < len(block):
            chunk = block[i:i + chunk_size]
            if chunk.strip():
                final_chunks.append(chunk)
            i += (chunk_size - overlap_size)

    return final_chunks


def extract_pdf_text(
    content: bytes,
    chunk_size: int = 2000,
    overlap_size: int = 200
) -> List[str]:
    text_chunks: List[str] = []
    if not content:
        logger.warning("No PDF content provided.")
        return text_chunks

    try:
        logger.info("Opening PDF document.")
        pdf = fitz.open(stream=content, filetype="pdf")

        # We'll gather all "kept" pages in one big string
        big_text = []

        for page_num in range(len(pdf)):
            page = pdf.load_page(page_num)
            raw_text = page.get_text()
            logger.info(f"Page {page_num} raw text length: {len(raw_text)}")

            # OCR fallback if < 300 chars
            if len(raw_text) < 300:
                pix = page.get_pixmap()
                img = Image.open(io.BytesIO(pix.tobytes()))
                ocr_text = pytesseract.image_to_string(img)
                logger.info(
                    f"OCR extracted text from page {page_num}: "
                    f"{len(ocr_text)} chars."
                )
                final_text = ocr_text
            else:
                final_text = raw_text

            # Filter after we've extracted final_text
            if (
                len(final_text) > 300
                and 'C O N T E N T S' not in final_text.upper()
            ):
                big_text.append(final_text)  # Store in a list for later
            else:
                logger.info(
                    f"""Skipping page {page_num}
                    (insufficient or 'C O N T E N T S')."""
                )

        # Now combine the pages we kept into one big string
        combined_text = " ".join(big_text)

        if combined_text.strip():
            # Only now do we chunk
            i = 0
            while i < len(combined_text):
                chunk = combined_text[i:i + chunk_size]
                if chunk.strip():
                    text_chunks.append(chunk)
                i += (chunk_size - overlap_size)
        else:
            logger.info(
                "No text after filtering, possibly blank or 'contents' pages "
                "only."
            )

    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}", exc_info=True)

    logger.info(
        f"Extracted {len(text_chunks)} text chunks total from this PDF."
    )
    return text_chunks


# This returns an array of chunks for each PDF row
extract_pdf_text_udf = udf(
    lambda c: extract_pdf_text(c, 4000, 400),
    ArrayType(StringType())
)


# Apply chunk_text_general to an array of strings in Spark:
def chunk_text_general_udf_func(text_list: List[str]) -> List[str]:
    return chunk_text_general(
        text_list, 2000, 200
    )


chunk_text_general_spark_udf = udf(
    chunk_text_general_udf_func, ArrayType(StringType())
)
