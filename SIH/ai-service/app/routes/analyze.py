import os
import uuid
from typing import List, Tuple

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool

from app.services.image_processor import preprocess_image
from app.services.ocr_service import OCRService
from app.services.gemini_service import GeminiService
from app.schemas.ocr import (
    OcrResponse,
    StructureRequest,
    StructureResponse,
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Analysis"]
)


# Load services once when the application starts.
ocr_service = OCRService()
gemini_service = GeminiService()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def _validate_extension(filename: str) -> str:
    extension = os.path.splitext(filename or "")[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported image format. "
                "Use JPG, JPEG, PNG or WEBP."
            )
        )

    return extension


async def _save_upload(file: UploadFile, extension: str) -> Tuple[str, str, str]:
    """
    Saves the uploaded file to disk.

    Returns (unique_id, original_path, processed_path).
    """

    unique_id = uuid.uuid4().hex

    original_path = os.path.join(
        "uploads", f"{unique_id}_original{extension}"
    )

    processed_path = os.path.join(
        "uploads", f"{unique_id}_processed.jpg"
    )

    contents = await file.read()

    with open(original_path, "wb") as image_file:
        image_file.write(contents)

    return unique_id, original_path, processed_path


def _run_ocr_pipeline(original_path: str, processed_path: str) -> List[str]:
    """
    Runs OpenCV preprocessing + PaddleOCR on a saved image and returns
    the extracted text lines. Raises HTTPException on failure or when
    no text is found.
    """

    preprocess_image(original_path, processed_path)

    ocr_text = ocr_service.extract_text(processed_path)

    if not ocr_text:
        raise HTTPException(
            status_code=422,
            detail="No readable text detected in the image."
        )

    return ocr_text


@router.post("/analyze")
async def analyze_product(file: UploadFile = File(...)):
    """
    Analyze a packaged product image end to end.

    Pipeline:

    Image
      -> OpenCV
      -> PaddleOCR
      -> Gemini
      -> Structured Product Information
    """

    extension = _validate_extension(file.filename)

    try:
        unique_id, original_path, processed_path = await _save_upload(
            file, extension
        )

        ocr_text = _run_ocr_pipeline(original_path, processed_path)

        product = gemini_service.structure_product_data(ocr_text)

        return {
            "success": True,
            "message": "Product information extracted successfully.",
            "ocr_text": ocr_text,
            "product": product.model_dump(),
            "files": {
                "original_image": original_path,
                "processed_image": processed_path
            }
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI processing failed: {str(error)}"
        )


@router.post("/ocr", response_model=OcrResponse)
async def extract_text_only(file: UploadFile = File(...)):
    """
    Run OpenCV preprocessing + PaddleOCR on an image and return the
    raw extracted text lines, without calling Gemini.

    Used by the backend's per-evidence OCR step (one call per
    uploaded image), which stores the raw text on the Evidence
    record and later combines it across evidence before structuring.
    """

    extension = _validate_extension(file.filename)

    try:
        unique_id, original_path, processed_path = await _save_upload(
            file, extension
        )

        #ocr_text = _run_ocr_pipeline(original_path, processed_path)
        ocr_text = await run_in_threadpool(
            _run_ocr_pipeline, original_path, processed_path)

        return OcrResponse(
            ocr_text=ocr_text,
            files={
                "original_image": original_path,
                "processed_image": processed_path
            }
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(error)}"
        )


@router.post("/structure", response_model=StructureResponse)
async def structure_text(payload: StructureRequest):
    """
    Structure already-extracted OCR text into product fields via
    Gemini, without re-running OCR on an image.

    Used by the backend's extraction step, which combines OCR text
    across all evidence for an inspection and asks for one
    structured result.
    """

    lines = payload.ocr_text

    if not lines and payload.text:
        lines = [
            line.strip()
            for line in payload.text.splitlines()
            if line.strip()
        ]

    if not lines:
        raise HTTPException(
            status_code=400,
            detail="No OCR text was provided to structure."
        )

    try:
        product = gemini_service.structure_product_data(lines)

        return StructureResponse(product=product.model_dump())

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI structuring failed: {str(error)}"
        )
