from unittest.mock import patch, MagicMock
from PIL import Image
import io
from data.src.chunk import extract_pdf_text, chunk_text_general


def mock_pdf_page(text, pixmap_data=None):
    if pixmap_data is None:
        # Create a small in-memory image
        img = Image.new("RGB", (100, 100), color="white")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        pixmap_data = buf.getvalue()

    page_mock = MagicMock()
    page_mock.get_text.return_value = text
    pixmap_mock = MagicMock()
    pixmap_mock.tobytes.return_value = pixmap_data
    page_mock.get_pixmap.return_value = pixmap_mock
    return page_mock


@patch("data.src.chunk.fitz.open")
def test_extract_pdf_text(fitz_open_mock):
    # Setup mock PDF
    pdf_mock = MagicMock()
    pdf_mock.__len__.return_value = 2  # two pages total
    pdf_mock.load_page.side_effect = [
        mock_pdf_page("This is a long text " + "A"*500),  # long enough
        mock_pdf_page("Short page")  # too short, should be skipped
    ]
    fitz_open_mock.return_value = pdf_mock

    chunks = extract_pdf_text(b"pdf_content", chunk_size=400, overlap_size=100)
    # For the long page, we should have multiple chunks.
    # For the short page (<300 chars), it should be skipped entirely.
    assert len(chunks) >= 2
    # The short page does not add any chunks.


@patch("data.src.chunk.fitz.open")
def test_extract_pdf_text_contents_page(fitz_open_mock):
    # Setup a PDF with a page that has "C O N T E N T S"
    # This page should be skipped according to the code's logic.
    pdf_mock = MagicMock()
    pdf_mock.__len__.return_value = 1
    pdf_mock.load_page.return_value = mock_pdf_page("C O N T E N T S\nSome index here...")

    fitz_open_mock.return_value = pdf_mock
    chunks = extract_pdf_text(b"pdf_content_with_contents_page", chunk_size=400, overlap_size=100)
    # Since the page contains "C O N T E N T S", we expect no chunks.
    assert len(chunks) == 0


@patch("data.src.chunk.fitz.open", side_effect=Exception("PDF error"))
def test_extract_pdf_text_exception(fitz_open_mock):
    chunks = extract_pdf_text(b"invalid_pdf")
    # On error, empty list
    assert chunks == []


def test_chunk_text_general():
    texts = [
        "This is a sentence.",
        "Here is another sentence.",
        "And another one."
    ]
    chunks = chunk_text_general(texts, chunk_size=30, overlap_size=10)
    # Verify the number of chunks and their content
    assert len(chunks) >= 1
    assert "This is a sentence." in chunks[0]
    assert "another one." in chunks[-1]
