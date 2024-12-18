import fitz  # PyMuPDF
import logging
from pyspark.sql.functions import udf
from pyspark.sql.types import ArrayType, StringType

logger = logging.getLogger(__name__)

def extract_and_chunk_text(content, chunk_size=4000, overlap_size=400):
    """
    Extracts text from a PDF file (bytes content) and chunks it into overlapping segments.
    
    Args:
        content (bytes): Binary content of a PDF file.
        chunk_size (int): The size of each text chunk.
        overlap_size (int): The overlapping number of characters between consecutive chunks.
    
    Returns:
        list: A list of text chunks extracted from the PDF.
    """
    text_chunks = []
    if content is None:
        logger.warning("No content provided to extract_and_chunk_text.")
        return text_chunks

    try:
        pdf = fitz.open(stream=content, filetype="pdf")
        for page_num in range(len(pdf)):
            page = pdf.load_page(page_num)
            text = page.get_text()
            # Only process pages with meaningful content, skip content pages
            if len(text) > 300 and 'C O N T E N T S' not in text:
                for i in range(0, len(text), chunk_size - overlap_size):
                    text_chunks.append(text[i:i+chunk_size])
        logger.info(f"Extracted {len(text_chunks)} chunks from PDF.")
    except Exception as e:
        logger.error(f"Error extracting and chunking text: {e}", exc_info=True)
    return text_chunks

extract_and_chunk_text_udf = udf(extract_and_chunk_text, ArrayType(StringType()))
