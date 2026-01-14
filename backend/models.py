from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List

class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class PublicUser(BaseModel):
    id: str
    name: str
    email: EmailStr

class RunListItem(BaseModel):
    id: str
    created_at: datetime
    resume_filename: str
    job_title_guess: Optional[str] = None
    ats_risk: Optional[str] = None  # "Low" / "Medium" / "High" (later)

class RunListResponse(BaseModel):
    items: List[RunListItem]

class RunDetailResponse(BaseModel):
    id: str
    created_at: datetime
    resume_filename: str
    job_title_guess: Optional[str] = None
    # These will be filled in Phase 3/4. Keep placeholders so API is future-proof.
    parsed_sections: Optional[dict] = None
    evaluation_report: Optional[dict] = None
    rewritten_resume: Optional[dict] = None