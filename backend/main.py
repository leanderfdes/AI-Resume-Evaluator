from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import CORS_ORIGINS
from db import ensure_indexes
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.runs import router as runs_router
from routes.dev import router as dev_router
from routes.analyze import router as analyze_router

app = FastAPI(title="AI Resume Evaluator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    ensure_indexes()

app.include_router(auth_router)
app.include_router(users_router)

app.include_router(runs_router)
app.include_router(dev_router)

app.include_router(analyze_router)

@app.get("/health")
def health():
    return {"status": "ok"}
