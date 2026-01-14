from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from db import runs_col
from routes.users import get_current_user
from models import RunListResponse, RunListItem, RunDetailResponse

router = APIRouter(prefix="/runs", tags=["runs"])

@router.get("", response_model=RunListResponse)
def list_runs(user=Depends(get_current_user)):
    cursor = runs_col.find({"user_id": str(user["_id"])}).sort("created_at", -1).limit(20)
    items = []
    for r in cursor:
        items.append(
            RunListItem(
                id=str(r["_id"]),
                created_at=r.get("created_at", datetime.now(timezone.utc)),
                resume_filename=r.get("resume_filename", "resume.pdf"),
                job_title_guess=r.get("job_title_guess"),
                ats_risk=r.get("ats_risk"),
            )
        )
    return RunListResponse(items=items)

@router.get("/{run_id}", response_model=RunDetailResponse)
def get_run(run_id: str, user=Depends(get_current_user)):
    try:
        oid = ObjectId(run_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid run id")

    r = runs_col.find_one({"_id": oid, "user_id": str(user["_id"])})
    if not r:
        raise HTTPException(status_code=404, detail="Run not found")

    return RunDetailResponse(
        id=str(r["_id"]),
        created_at=r.get("created_at"),
        resume_filename=r.get("resume_filename"),
        job_title_guess=r.get("job_title_guess"),
        parsed_sections=r.get("parsed_sections"),
        evaluation_report=r.get("evaluation_report"),
        rewritten_resume=r.get("rewritten_resume"),
    )
