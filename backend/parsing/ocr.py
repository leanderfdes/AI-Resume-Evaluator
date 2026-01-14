import os
from typing import List

import fitz  # PyMuPDF
import pytesseract
from PIL import Image


def _configure_tesseract_from_env() -> None:
    cmd = os.getenv("TESSERACT_CMD")
    if cmd and os.path.exists(cmd):
        pytesseract.pytesseract.tesseract_cmd = cmd


def ocr_pdf_to_text(path: str, dpi: int = 220, max_pages: int | None = None) -> str:
    """
    Heavy but reliable extraction:
    - Render PDF pages to images using PyMuPDF
    - Run Tesseract OCR on each page
    """
    _configure_tesseract_from_env()

    doc = fitz.open(path)
    texts: List[str] = []

    page_count = doc.page_count
    if max_pages is not None:
        page_count = min(page_count, max_pages)

    zoom = dpi / 72.0
    mat = fitz.Matrix(zoom, zoom)

    for i in range(page_count):
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=mat, alpha=False)

        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        txt = pytesseract.image_to_string(img)
        txt = (txt or "").strip()
        if txt:
            texts.append(txt)

    doc.close()
    return "\n\n".join(texts).strip()
