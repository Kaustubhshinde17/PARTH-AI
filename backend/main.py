import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
from routers import auth, chat

app = FastAPI(title="PARTH AI Backend", version="1.0.0")

@app.on_event("startup")
def on_startup():
    init_db()

# CORS config — read allowed origins from env var (comma-separated)
# Example: CORS_ORIGINS=https://parth-ai.vercel.app,http://localhost:3000
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PARTH AI Backend is running"}
