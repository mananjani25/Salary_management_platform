import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if origin.strip()]

app = FastAPI(title="Salary Management Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/api/v1/health")
def api_v1_health_check():
    return {"status": "ok", "version": "1.0.0"}
