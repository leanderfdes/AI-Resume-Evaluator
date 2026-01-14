from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from db import runs_col
from routes.users import get_current_user

router = APIRouter(prefix="/dev", tags=["dev"])

@router.post("/seed-run")
def seed_run(user=Depends(get_current_user)):
    doc = {
        "user_id": str(user["_id"]),
        "created_at": datetime.now(timezone.utc),
        "resume_filename": "Leander_Resume.pdf",
        "job_title_guess": "Frontend Developer",
        "ats_risk": "Medium",
        "parsed_sections": None,
        "evaluation_report": None,
        "rewritten_resume": None,
    }
    res = runs_col.insert_one(doc)
    return {"ok": True, "run_id": str(res.inserted_id)}
