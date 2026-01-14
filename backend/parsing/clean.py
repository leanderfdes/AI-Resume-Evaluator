import re


def clean_extracted_text(text: str) -> str:
    """
    OCR output is already readable, so keep cleaning minimal + safe:
    - normalize whitespace
    - normalize bullets
    - fix hyphen line breaks
    """
    if not text:
        return ""

    text = text.replace("\r", "\n")
    text = text.replace("\t", " ")

    # Remove non-printable junk (keep newlines)
    text = "".join(ch for ch in text if ch.isprintable() or ch == "\n")

    # Normalize spaces
    text = re.sub(r"[ \u00A0]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Normalize separators
    text = re.sub(r"\s*\|\s*", " | ", text)

    # Normalize bullets onto new lines
    text = re.sub(r"\s*•\s*", "\n• ", text)

    # Join hyphenated wraps: "frame-\nworks" -> "frameworks"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)

    # Trim each line
    text = "\n".join(ln.strip() for ln in text.split("\n"))

    return text.strip()
