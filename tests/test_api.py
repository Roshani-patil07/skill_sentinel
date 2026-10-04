import os
import sys
sys.path.insert(0, os.path.abspath("."))

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app

@pytest.mark.anyio
async def test_health_check_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "HEALTHY"
        assert data["app"] == "SKILL-SENTINEL"

@pytest.mark.anyio
async def test_analytics_overview():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/analytics/overview")
        assert res.status_code == 200
        data = res.json()
        assert "national_compliance_index" in data
        assert "total_monitored_centres" in data

@pytest.mark.anyio
async def test_centres_listing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/centres")
        assert res.status_code == 200
        centres = res.json()
        assert isinstance(centres, list)
        assert len(centres) > 0

@pytest.mark.anyio
async def test_attendance_discrepancies():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/api/v1/attendance/discrepancies")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
