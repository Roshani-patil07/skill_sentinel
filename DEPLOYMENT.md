# SKILL-SENTINEL: Production Deployment Runbook

This guide covers deployment procedures for Docker, Render, Vercel, and Cloud VMs.

---

## 1. Cloud Architecture Options

### Recommended Production Blueprint
- **Frontend SPA**: Vercel / Cloudflare Pages (Edge CDN, SSL termination, global cache)
- **Backend API**: Render / Fly.io / AWS ECS (FastAPI Async ASGI with Uvicorn)
- **Database**: Managed PostgreSQL 16 (Render Managed Postgres, Supabase, or AWS RDS)
- **Redis Cache**: Managed Redis 7 (Upstash or Redis Cloud)
- **Edge Cameras**: Local mini-PC or Raspberry Pi 5 running edge client with CPU/NPU fallback

---

## 2. Docker Compose Deployment (Single Server / Cloud VM)

### Step 1: Provision Cloud VM
Ubuntu 22.04 LTS (2 vCPU, 4GB RAM minimum).

### Step 2: Clone & Configure
```bash
git clone <repository_url> /opt/skill-sentinel
cd /opt/skill-sentinel
cp .env.example .env
```
Edit `.env` and set:
```ini
APP_ENV=production
SECRET_KEY=generate_with_openssl_rand_hex_32
DATABASE_URL=postgresql://sentinel_user:sentinel_password@db:5432/skill_sentinel_db
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=https://sentinel.yourdomain.gov.in
```

### Step 3: Launch Containers
```bash
docker compose up -d --build
```

### Step 4: Verify Deployment Health
```bash
# Check running containers
docker compose ps

# Check API health
curl -f http://localhost:8000/health

# Check readiness & DB connection
curl -f http://localhost:8000/ready
```

---

## 3. Deployment on Render.com & Vercel

### A. Deploy Backend & Database on Render
1. Connect your GitHub repository to Render.
2. Render detects `render.yaml` automatically:
   - Provisions **Managed PostgreSQL 16** (`skill-sentinel-db`).
   - Provisions **FastAPI Web Service** (`skill-sentinel-api`).
3. Set environment variable `SECRET_KEY` in the Render dashboard.
4. Backend URL generated: `https://skill-sentinel-api.onrender.com`.

### B. Deploy Frontend on Vercel
1. Import repository on Vercel dashboard.
2. Root Directory: `frontend`.
3. Framework Preset: `Vite`.
4. Environment Variables:
   - `VITE_API_BASE_URL` = `https://skill-sentinel-api.onrender.com`
   - `VITE_WS_URL` = `wss://skill-sentinel-api.onrender.com/api/v1/ws`
5. Click **Deploy**. Vercel uses `vercel.json` to handle SPA rewrites and caching headers.

---

## 4. HTTPS & SSL / Reverse Proxy (Nginx)

For self-hosted deployments with Nginx and Let's Encrypt:
```nginx
server {
    server_name sentinel.yourdomain.gov.in;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/sentinel.yourdomain.gov.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sentinel.yourdomain.gov.in/privkey.pem;
}
```

---

## 5. Rollback & Disaster Recovery

- **Database Backups**:
  ```bash
  docker compose exec db pg_dump -U sentinel_user skill_sentinel_db > backup_$(date +%F).sql
  ```
- **Database Restore**:
  ```bash
  cat backup_2026-10-04.sql | docker compose exec -T db psql -U sentinel_user skill_sentinel_db
  ```
- **Quick Rollback**:
  ```bash
  git checkout <previous_stable_tag>
  docker compose up -d --build
  ```
