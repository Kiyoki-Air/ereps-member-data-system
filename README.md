# EREPS Complete Member Data Extraction and Management System

A production-ready data management, intelligence, and export system built to ingest, standardize, govern, and export ~150,000 European Register of Exercise Professionals (EREPS) member records through authorized access pathways.

---

## 🌟 Key Features & Module Overview

- **Module 1: Website Structure Analysis & Source Report:** Comprehensive technical inspection of `ereps.eu/member-directory`, Drupal CMS views, robots.txt directives, rate limit boundaries, and data access authorization matrix. Documented in [docs/SOURCE_INSPECTION_REPORT.md](docs/SOURCE_INSPECTION_REPORT.md).
- **Module 2: Member Listing Collection:** Ingests confirmed Member IDs, first & last names, city, standardized country, professional categories, Master Trainer status, expiry dates, and profile links.
- **Module 3: Individual Profile Extraction:** Separate stage extracting biographies, EQF levels, vocational certifications, business contact details, and source provenance.
- **Module 4: Social Media & Website Link Classifier:** Dedicated engine classifying exact published URLs for Instagram, LinkedIn, Facebook, YouTube, X / Twitter, TikTok, personal websites, and business portals with tracking parameter sanitization and verification badges.
- **Module 5: Database Architecture:** 9 relational tables (`members`, `qualifications`, `member_profiles`, `member_links`, `extraction_jobs`, `extraction_logs`, `failed_records`, `data_sources`, `audit_logs`) with B-tree indexes for fast querying.
- **Module 6: Background Extraction Engine:** Supports configurable batch sizes, rate limits, checkpointing, pause/resume, and an automated failed-record retry pipeline.
- **Module 7: Enterprise Admin Dashboard:** Built in React with TypeScript, Tailwind CSS, and Lucide icons featuring:
  - *Overview:* 8 KPI summary cards, extraction health, and platform adoption.
  - *Member Database:* Real-time search, filters by country, city, qualification, Master Trainer status, and pagination.
  - *Individual Member Profile:* Comprehensive modal with qualifications, bio, links, and audited manual correction form.
  - *Social Media Database:* Filter by platform, verified status, and clickable links.
  - *Analytics:* Interactive distribution charts and missing field audits.
  - *Extraction Manager:* Job controls, live progress bars, live log terminal, and failure retry center.
- **Module 8: Dedicated Export Centre:** Generates multi-sheet Excel workbooks using **OpenPyXL**:
  - *Sheet 1:* ALL MEMBERS
  - *Sheet 2:* MEMBER PROFILES
  - *Sheet 3:* SOCIAL MEDIA LINKS
  - *Sheet 4:* WEBSITES
  - *Sheet 5:* EXTRACTION LOGS  
  Plus instant CSV downloads for members, links, and failures.
- **Module 9: Data Quality & Governance:** Canonical country standardisation (ISO mappings), date parsing (ISO 8601), unicode preservation, duplicate detection, and missing field tracking.
- **Module 10: Security & GDPR Management:** JWT authentication, RBAC, Article 17 Right-to-Erasure workflows, and immutable audit logs.
- **Module 11: Enterprise UI Styling:** Clean white background (`#ffffff` / `#f8fafc`), dark typography (`#0f172a`), deep blue accents (`#1e40af` / `#2563eb`), responsive sidebar navigation, and clear status indicators.
- **Module 12: Testing & 150k Scalability Benchmark:** Fully verified with 10 automated test suites (`pytest`) and an automated synthetic 150,000 records benchmark script.

---

## 🚀 Quickstart Guide

### 1. Run Backend Server
```bash
# From workspace root
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API root: `http://127.0.0.1:8000`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`
- Default administrator: `admin` / `admin123`

### 2. Run React Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Vercel Deployment (Frontend)
This repository is pre-configured for instant zero-configuration deployment to **Vercel**:
1. Go to [vercel.com/new](https://vercel.com/new) and import this repository (`Kiyoki-Air/ereps-member-data-system`).
2. Vercel automatically detects the Vite framework and root `vercel.json`.
3. (Optional) In **Environment Variables**, set:
   - `VITE_API_URL`: Your live backend API URL (e.g. deployed on Render, Railway, or Fly.io). If omitted, the dashboard automatically runs with full interactive snapshot datasets!
4. Click **Deploy**.

### 4. Production Deployment with Docker Compose
```bash
docker-compose up -d --build
```
Starts PostgreSQL, Redis, FastAPI Backend, and React Frontend in Docker containers.

---

## 🧪 Automated Testing & Benchmarks

### Run PyTest Suite
```bash
python -m pytest backend/tests/ -v
```
All 10 test suites cover link extraction, data standardisation, database relational integrity, OpenPyXL 5-sheet generation, failed-record retries, and API route handlers.

### Run 150,000 Scale Benchmark
```bash
python scripts/scale_benchmark.py 150000
```

---

## 📁 Project Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (auth, members, links, extraction, export, analytics, governance)
│   │   ├── core/         # Config, database engine, JWT security
│   │   ├── models/       # SQLAlchemy relational models (all 9 required tables + users)
│   │   ├── schemas/      # Pydantic validation schemas
│   │   ├── services/     # Link extractor, Data quality, Export service, Extraction engine, Analytics
│   │   └── main.py       # FastAPI application, startup seeding, static mounting
│   ├── tests/            # Automated test suites
│   ├── requirements.txt  # Python package dependencies
│   └── Dockerfile        # Backend container specification
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, Header, StatCard, MemberDetailModal
│   │   ├── pages/        # Overview, Members, Social, Analytics, Extraction, Export, Governance
│   │   ├── services/     # API client functions
│   │   ├── types/        # TypeScript interfaces
│   │   ├── App.tsx       # Root view router
│   │   └── main.tsx      # React root mount
│   ├── package.json      # Dependencies (React 19, TypeScript, Lucide, Vite)
│   ├── vite.config.ts    # Proxy and build configuration
│   └── Dockerfile        # Production multi-stage Nginx container
├── docs/
│   ├── SOURCE_INSPECTION_REPORT.md # Module 1 inspection & compliance report
│   ├── API_DOCS.md                 # Complete API endpoints documentation
│   └── DEPLOYMENT.md               # Local, Docker, and disaster recovery guide
├── scripts/
│   └── scale_benchmark.py          # 150,000 records performance benchmark
├── docker-compose.yml              # Multi-container orchestration (DB, Redis, Backend, Frontend)
├── .env.example                    # Environment variables template
└── README.md                       # System overview & instructions
```

---

## ⚖️ Legal & Ethical Access Compliance

Before executing automated data extraction against third-party public directories:
1. Review the [docs/SOURCE_INSPECTION_REPORT.md](docs/SOURCE_INSPECTION_REPORT.md).
2. Automated extraction against `ereps.eu` requires authorization from EuropeActive.
3. The system enforces strict rate limits, exponential backoff, and provides official administrative CSV ingestion as an approved alternative.
