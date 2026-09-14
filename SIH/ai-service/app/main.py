import os

# IMPORTANT:
# Disable PaddlePaddle MKLDNN/oneDNN before PaddleOCR is imported.
os.environ["PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT"] = "0"

from dotenv import load_dotenv
from fastapi import FastAPI

# Load .env
load_dotenv()

print(
    "GEMINI_API_KEY loaded:",
    bool(os.getenv("GEMINI_API_KEY"))
)

print(
    "Paddle MKLDNN disabled:",
    os.getenv("PADDLE_PDX_ENABLE_MKLDNN_BYDEFAULT")
)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="Packaged Commodity AI Service",
    description=(
        "AI service for extracting structured "
        "product information from packaged commodity images."
    ),
    version="1.0.0"
)

# Import AFTER environment configuration
from app.routes.analyze import router as analyze_router

app.include_router(analyze_router)


@app.get("/")
def root():
    return {
        "service": "Packaged Commodity AI Service",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }