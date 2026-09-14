from typing import List, Optional

from pydantic import BaseModel, Field


class OcrResponse(BaseModel):
    success: bool = True
    message: str = "Text extracted successfully."
    ocr_text: List[str] = Field(default_factory=list)
    files: Optional[dict] = None


class StructureRequest(BaseModel):
    """
    Input for the /ai/structure endpoint.

    Either `ocr_text` (a list of lines, e.g. from PaddleOCR) or `text`
    (a single raw text blob, e.g. combined OCR text already stored on
    the backend) can be supplied. If both are given, `ocr_text` wins.
    """

    ocr_text: List[str] = Field(default_factory=list)
    text: Optional[str] = None


class StructureResponse(BaseModel):
    success: bool = True
    message: str = "Product information extracted successfully."
    product: dict
