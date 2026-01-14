import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from db import runs_col
from routes.users import get_current_user
from parsing.extract import extract_resume_text
from parsing.clean import clean_extracted_text
from parsing.sections import split_into_sections

router = APIRouter(prefix="/analyze", tags=["analyze"])

UPLOAD_DIR = "uploads"
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("")
async def analyze_resume(
    jd_text: str = Form(...),
    resume: UploadFile = File(...),
    user=Depends(get_current_user),
):
    jd_text = (jd_text or "").strip()
    if len(jd_text) < 30:
        raise HTTPException(status_code=400, detail="Job description is too short.")

    filename = (resume.filename or "resume").strip()
    ext = os.path.splitext(filename.lower())[1]
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Upload a PDF or DOCX resume.")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    temp_name = f"{uuid.uuid4().hex}{ext}"
    temp_path = os.path.join(UPLOAD_DIR, temp_name)

    content = await resume.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 5MB).")

    with open(temp_path, "wb") as f:
        f.write(content)

    try:
        resume_text, kind = extract_resume_text(temp_path, filename)
        resume_text = clean_extracted_text(resume_text)

        if not resume_text or len(resume_text) < 50:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from resume. Try a DOCX or a different PDF export.",
            )

        sections = split_into_sections(resume_text)

        doc = {
            "user_id": str(user["_id"]),
            "created_at": datetime.now(timezone.utc),
            "resume_filename": filename,
            "resume_kind": kind,  # e.g. pdf:ocr
            "job_title_guess": None,
            "ats_risk": None,
            "jd_text": jd_text,
            "parsed_sections": sections,
            "evaluation_report": None,
            "rewritten_resume": None,
        }
        res = runs_col.insert_one(doc)

        return {
            "run_id": str(res.inserted_id),
            "status": "parsed",
            "parsed_sections": sections,
            "resume_kind": kind,
        }

    finally:
        try:
            os.remove(temp_path)
        except Exception:
            pass
