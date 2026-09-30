import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"

def test_national_summary():
    res = client.get("/api/v1/analytics/national-summary")
    assert res.status_code == 200
    data = res.json()
    assert data["total_facilities"] > 0
    assert "inventory_health" in data

def test_facilities_and_markers():
    res = client.get("/api/v1/facilities/")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] > 0

    m_res = client.get("/api/v1/facilities/map-markers")
    assert m_res.status_code == 200
    markers = m_res.json()["markers"]
    assert len(markers) > 0
    assert "lat" in markers[0] and "lng" in markers[0]

def test_inventory_and_update():
    res = client.get("/api/v1/inventory/?limit=5")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) > 0
    
    first_item = items[0]
    update_res = client.post("/api/v1/inventory/update", json={
        "facility_id": first_item["facility_id"],
        "medicine_id": first_item["medicine_id"],
        "quantity_delta": 50,
        "reason": "Test unit replenishment"
    })
    assert update_res.status_code == 200
    assert update_res.json()["success"] is True

def test_redistribution_recommendations():
    res = client.get("/api/v1/redistribution/recommendations")
    assert res.status_code == 200
    data = res.json()
    assert "recommendations" in data

def test_federated_learning():
    res = client.get("/api/v1/federated/status")
    assert res.status_code == 200
    data = res.json()
    assert len(data["state_nodes"]) >= 6
    assert data["differential_privacy_epsilon"] > 0

    round_res = client.post("/api/v1/federated/train-round")
    assert round_res.status_code == 200
    assert round_res.json()["current_round"] > data["current_round"]

def test_voice_indic():
    res = client.post("/api/v1/voice/process", json={
        "transcript": "हमारे पास पेरासिटामोल के सिर्फ 10 स्ट्रिप बचे हैं",
        "language_code": "hi",
        "facility_id": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "intent" in data["processed"]
