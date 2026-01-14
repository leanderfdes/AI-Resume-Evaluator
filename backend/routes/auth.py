from fastapi import APIRouter, HTTPException
from pymongo.errors import DuplicateKeyError
from bson import ObjectId

from db import users_col
from models import SignupRequest, LoginRequest, TokenResponse
from security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/signup", response_model=TokenResponse)
def signup(payload: SignupRequest):
    doc = {
        "name": payload.name.strip(),
        "email": payload.email.lower().strip(),
        "password_hash": hash_password(payload.password),
    }
    try:
        result = users_col.insert_one(doc)
    except DuplicateKeyError:
        raise HTTPException(status_code=409, detail="Email already registered")

    token = create_access_token({"user_id": str(result.inserted_id), "email": doc["email"]})
    return TokenResponse(access_token=token)

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = users_col.find_one({"email": payload.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"user_id": str(user["_id"]), "email": user["email"]})
    return TokenResponse(access_token=token)
