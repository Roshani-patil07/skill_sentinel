# SKILL-SENTINEL: Troubleshooting & Operational Runbook

---

## 1. Common Issues & Quick Resolutions

### A. Port 8000 or 8001 Already in Use
- **Symptom**: `[Errno 10048] error while attempting to bind on address ('127.0.0.1', 8001)`
- **Resolution**:
  ```powershell
  # Find PID using port 8001
  netstat -ano | findstr :8001
  # Kill the process
  taskkill /PID <PID> /F
  ```

### B. WebSocket Connection Fails (`Connection Refused`)
- **Symptom**: UI displays yellow `RECONNECTING...` banner.
- **Resolution**:
  1. Verify backend is running: `curl http://localhost:8001/ready`.
  2. Verify WebSocket proxy in `frontend/vite.config.ts` or set `VITE_WS_URL=ws://127.0.0.1:8001/api/v1/ws`.

### C. Database Locked or Corrupted (SQLite)
- **Symptom**: `sqlite3.OperationalError: database is locked`
- **Resolution**:
  ```bash
  rm skill_sentinel.db
  python scripts/seed.py
  ```

### D. CORS Rejection (`Credentials flag set to true`)
- **Symptom**: Browser console error: `Access to fetch at ... from origin ... has been blocked by CORS policy`.
- **Resolution**:
  - In `backend/app/main.py`, `CORSMiddleware` uses `allow_origin_regex` for localhost ports with `allow_credentials=True`.
  - Ensure explicit domains are added to `.env` `CORS_ORIGINS`.

---

## 2. Diagnostics Commands

```bash
# Test API Health
curl -s http://localhost:8001/health

# Test Database Connection & WebSockets
curl -s http://localhost:8001/ready

# Check API Performance & Metrics
curl -s http://localhost:8001/metrics

# Check Current SIH Demo Status
curl -s http://localhost:8001/api/v1/demo/status
```
