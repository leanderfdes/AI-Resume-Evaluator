import os
from typing import Tuple

import pdfplumber
from docx import Document
import fitz  # PyMuPDF

from parsing.ocr import ocr_pdf_to_text


def _looks_spaced_out(text: str) -> bool:
    """
    Detect the "Applic at ion / F as t" style extraction.
    Heuristic: too many very short tokens => text is broken.
    """
    if not text:
        return True

    tokens = [t for t in text.replace("\n", " ").split(" ") if t.strip()]
    if len(tokens) < 40:
        return False

    short = sum(1 for t in tokens if len(t) <= 2)
    ratio_short = short / max(len(tokens), 1)

    # If 35%+ tokens are length <= 2, extraction is likely garbage
    return ratio_short >= 0.35


def extract_text_from_pdf_pymupdf(path: str) -> str:
    doc = fitz.open(path)
    parts = []
    for i in range(doc.page_count):
        page = doc.load_page(i)
        t = page.get_text("text")  # pretty good when PDF stores text normally
        if t and t.strip():
            parts.append(t.strip())
    doc.close()
    return "\n\n".join(parts).strip()


def extract_text_from_pdf_pdfplumber(path: str) -> str:
    parts = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            t = page.extract_text(layout=True) or ""
            if t.strip():
                parts.append(t.strip())
    return "\n\n".join(parts).strip()


def extract_text_from_pdf(path: str) -> Tuple[str, str]:
    """
    Extraction strategy:
    1) Try PyMuPDF (fast)
    2) Try pdfplumber layout (sometimes better)
    3) If still spaced-out/broken -> OCR fallback (slow but reliable)
    Returns (text, mode)
    """
    t1 = extract_text_from_pdf_pymupdf(path)
    if t1 and not _looks_spaced_out(t1):
        return t1, "pymupdf"

    t2 = extract_text_from_pdf_pdfplumber(path)
    if t2 and not _looks_spaced_out(t2):
        return t2, "pdfplumber"

    # OCR fallback for broken-font PDFs
    t3 = ocr_pdf_to_text(path, dpi=220)
    return t3, "ocr"


def extract_text_from_docx(path: str) -> str:
    doc = Document(path)
    lines = [p.text.strip() for p in doc.paragraphs if p.text and p.text.strip()]
    return "\n".join(lines).strip()


def extract_resume_text(path: str, filename: str) -> Tuple[str, str]:
    """
    Returns: (text, kind)
    kind examples: pdf:pymupdf, pdf:pdfplumber, pdf:ocr, docx
    """
    ext = os.path.splitext(filename.lower())[1]

    if ext == ".pdf":
        txt, mode = extract_text_from_pdf(path)
        return txt, f"pdf:{mode}"

    if ext in [".docx", ".doc"]:
        return extract_text_from_docx(path), "docx"

    raise ValueError("Unsupported file type. Upload PDF or DOCX.")
