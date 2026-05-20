import os
from fastapi import FastAPI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Salary Management Platform API")

@app.get("/health")
def health_check():
    return {"status": "ok"}
