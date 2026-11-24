# EREPS Data Management System - Deployment Guide

This document describes how to deploy, configure, and operate the EREPS Member Data Management System in development and production environments.

---

## 1. Quick Local Development Mode (Zero-Config)

The application includes an automatic SQLite fallback when PostgreSQL is not configured locally, allowing you to run, test, and develop immediately on any workstation.

### Prerequisites:
- Python 3.10+ (tested on Python 3.11 / 3.12 / 3.13)
- Node.js 18+ & npm

### Step 1: Start Backend
```bash
# In workspace root
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend initializes the database schema, seeds the administrator user (`admin` / `admin123`), and boots the API at `http://127.0.0.1:8000`.

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your web browser. Requests to `/api/*` are automatically proxied to the FastAPI server at port 8000.

---

## 2. Production Deployment via Docker Compose

In production, run the entire stack (PostgreSQL 16, Redis 7, FastAPI Backend, and React Nginx Frontend) through Docker Compose:

```bash
# Clone or copy workspace
cd "d:\Data Extraction"

# Copy environment variables
cp .env.example .env

# Build and start all services in detached mode
docker-compose up -d --build
```

### Services Started:
| Service | Container Name | Port | Description |
|---|---|---|---|
| **Database** | `ereps_postgres` | `5432` | PostgreSQL 16 relational store with persistent volume `pgdata` |
| **Cache/Queue** | `ereps_redis` | `6379` | Redis 7 broker for background tasks |
| **Backend** | `ereps_backend` | `8000` | FastAPI ASGI application server |
| **Frontend** | `ereps_frontend` | `3000` | Production React SPA served via Nginx reverse proxy |

---

## 3. Database Migration & 150k Scale Benchmark

To verify performance on 150,000 synthetic records:
```bash
# Run the benchmark script inside or outside container
python scripts/scale_benchmark.py 150000
```
This tests:
1. Bulk ingestion throughput using batch mapping.
2. Query performance on indexed fields (`member_id`, `full_name`, `country`, `city`, `professional_category`).
3. Sub-10ms pagination response times.

---

## 4. Backups and Disaster Recovery

### Automated PostgreSQL Backup:
```bash
docker exec -t ereps_postgres pg_dump -U postgres ereps_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore from Backup:
```bash
cat backup_file.sql | docker exec -i ereps_postgres psql -U postgres -d ereps_db
```

---

## 5. Security & GDPR Operations
- **Administrator Credentials:** Initial setup uses `admin` / `admin123`. Change this immediately in production via the settings or user table.
- **GDPR Deletion:** Process erasure requests via the `/api/v1/governance/gdpr-erasure` API or the Governance dashboard page.
- **Audit Logging:** Every manual correction and erasure request is logged to the `audit_logs` table with operator ID and timestamps.
