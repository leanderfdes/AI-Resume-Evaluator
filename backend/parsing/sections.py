import re
from typing import Dict

CANONICAL_ORDER = ["summary", "experience", "skills", "projects", "certifications", "education"]

# Canonical headings -> regex patterns for headings
HEADING_PATTERNS = {
    "summary": r"(summary|professional summary|profile|about|objective)",
    "experience": r"(experience|work experience|employment|professional experience|internships?|internship)",
    "skills": r"(skills|technical skills|technologies|tech stack|tools|tools\s*&\s*technologies)",
    "projects": r"(projects?|project experience|key projects|selected projects|personal projects|academic projects)",
    "certifications": r"(certifications?|certificates?|licenses?|license)",
    "education": r"(education|academics|academic background|qualifications?|qualification)",
}

# Build one combined regex that matches headings at line start (most important)
# Examples it catches:
#   "PROJECTS"
#   "PROJECTS:"
#   "PROJECTS -"
#   "PROJECT EXPERIENCE"
HEADING_RE = re.compile(
    r"(?im)^(?P<h>(" + "|".join(HEADING_PATTERNS.values()) + r"))\s*[:\-]?\s*$"
)

def split_into_sections(text: str) -> Dict[str, str]:
    if not text:
        return {k: "" for k in CANONICAL_ORDER}

    # Normalize line endings and remove trailing spaces
    lines = [ln.rstrip() for ln in text.replace("\r", "\n").split("\n")]
    text = "\n".join(lines).strip()

    # Find heading matches
    matches = list(HEADING_RE.finditer(text))

    # If no headings found, fallback to summary
    if not matches:
        return {k: (text if k == "summary" else "") for k in CANONICAL_ORDER}

    # Helper: map matched heading string to canonical key
    def canonical_key(heading: str) -> str:
        h = heading.strip().lower()
        for key, pat in HEADING_PATTERNS.items():
            if re.search(rf"^{pat}$", h, flags=re.I):
                return key
        # If weird match, default summary
        return "summary"

    sections = {k: "" for k in CANONICAL_ORDER}

    # Content before first heading → summary
    start0 = 0
    first = matches[0]
    pre = text[start0:first.start()].strip()
    if pre:
        sections["summary"] = pre

    # For each heading, take content until next heading
    for i, m in enumerate(matches):
        head = m.group("h")
        key = canonical_key(head)

        content_start = m.end()
        content_end = matches[i + 1].start() if i + 1 < len(matches) else len(text)

        block = text[content_start:content_end].strip()

        # If section repeats (e.g., multiple "PROJECTS"), append
        if block:
            if sections[key]:
                sections[key] += "\n" + block
            else:
                sections[key] = block

    # Force headings onto their own line if extractor merged them
    for h in ["SUMMARY", "TECHNICAL SKILLS", "SKILLS", "EXPERIENCE", "PROJECTS", "CERTIFICATION", "CERTIFICATIONS", "EDUCATION"]:
        text = re.sub(rf"\s+({h})\s+", rf"\n\1\n", text, flags=re.I)

    return sections
