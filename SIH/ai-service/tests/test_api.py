import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Packaged Commodity AI Service"
    assert data["status"] == "running"

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_structure_text_endpoint():
    payload = {
        "ocr_text": [
            "TATA SALT IODIZED",
            "NET QTY 1 kg",
            "MRP Rs 28.00",
            "MFD 05/2026",
            "EXP 05/2028"
        ]
    }
    response = client.post("/ai/structure", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "product" in data
    product = data["product"]
    assert product["mrp"] is not None or product["net_quantity"] is not None

def test_invalid_image_upload():
    response = client.post("/ai/ocr", files={"file": ("test.txt", b"invalid text", "text/plain")})
    assert response.status_code == 400
