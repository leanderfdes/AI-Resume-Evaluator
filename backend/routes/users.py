from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from bson import ObjectId

from db import users_col
from models import PublicUser
from security import decode_token

router = APIRouter(tags=["users"])
auth_scheme = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = creds.credentials
    payload = decode_token(token)
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = users_col.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.get("/me", response_model=PublicUser)
def me(user=Depends(get_current_user)):
    return PublicUser(id=str(user["_id"]), name=user["name"], email=user["email"])
