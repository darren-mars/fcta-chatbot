import pytest
from unittest.mock import patch, MagicMock
from data.src.chunk import extract_and_chunk_text

def mock_pdf_page(text):
    page_mock = MagicMock()
    page_mock.get_text.return_value = text
    return page_mock

@patch("data.src.chunk.fitz.open")
def test_extract_and_chunk_text(fitz_open_mock):
    # Setup mock PDF
    pdf_mock = MagicMock()
    pdf_mock.__len__.return_value = 2  # two pages total
    pdf_mock.load_page.side_effect = [
        mock_pdf_page("This is a long text " + "A"*500),  # long enough
        mock_pdf_page("Short page")  # too short, should be skipped
    ]
    fitz_open_mock.return_value = pdf_mock

    chunks = extract_and_chunk_text(b"pdf_content", chunk_size=400, overlap_size=100)
    # For the long page, we should have multiple chunks.
    # For the short page (<300 chars), it should be skipped entirely.
    assert len(chunks) >= 2
    # The short page does not add any chunks.

@patch("data.src.chunk.fitz.open")
def test_extract_and_chunk_text_contents_page(fitz_open_mock):
    # Setup a PDF with a page that has "C O N T E N T S" 
    # This page should be skipped according to the code's logic.
    pdf_mock = MagicMock()
    pdf_mock.__len__.return_value = 1
    pdf_mock.load_page.return_value = mock_pdf_page("C O N T E N T S\nSome index here...")

    fitz_open_mock.return_value = pdf_mock
    chunks = extract_and_chunk_text(b"pdf_content_with_contents_page", chunk_size=400, overlap_size=100)
    # Since the page contains "C O N T E N T S", we expect no chunks.
    assert len(chunks) == 0

@patch("data.src.chunk.fitz.open", side_effect=Exception("PDF error"))
def test_extract_and_chunk_text_exception(fitz_open_mock):
    chunks = extract_and_chunk_text(b"invalid_pdf")
    # On error, empty list
    assert chunks == []
