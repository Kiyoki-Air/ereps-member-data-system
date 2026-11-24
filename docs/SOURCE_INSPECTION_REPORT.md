# EREPS Directory Source Inspection & Technical Access Report

**Target URL:** https://www.ereps.eu/member-directory  
**Platform Owner:** EuropeActive (European Register of Exercise Professionals)  
**Inspection Date:** November 2026  
**System Scope:** ~150,000 European & International Exercise Professionals  

---

## 1. Executive Summary & Compliance Mandate

The European Register of Exercise Professionals (EREPS) maintains a directory of certified personal trainers, group fitness instructors, pilates teachers, and exercise-for-health specialists across Europe and internationally.

In accordance with strict ethical guidelines, system security best practices, and EU Data Protection requirements (GDPR Regulation EU 2016/679), **this data management system implements a dual-mode operational architecture**:
1. **Fully Operational Independent Core:** Robust PostgreSQL relational data store, full-featured React enterprise dashboard, search/filter engine, multi-sheet OpenPyXL Excel export, CSV import centre, data quality pipelines, and link extraction algorithms.
2. **Configurable Authorized Connectors:** Connectors capable of ingesting through:
   - Official Partner API / EuropeActive Data Feeds
   - Approved Administrative CSV/JSON Data Drops
   - Ethically throttled HTTP/Playwright connectors requiring confirmed authorization keys and adhering to published robots.txt and rate limits.

---

## 2. Directory Architecture & Technical Structure

### 2.1 Technology Stack Analysis
* **CMS Platform:** Drupal CMS (evidenced by structure paths `/sites/ereps.eu/files/`, Drupal views, and node/user path mappings).
* **Search & View Framework:** Drupal Views with exposed filter form handlers.
* **Directory Divisions:**
  - *Pan-European Public Directory:* `/member-directory`
  - *International Member Directory:* `/member-directory/international`
  - *Master Trainer Directory:* Specialized accreditation filter and tier
  - *Regional / National Sub-Directories:* Country-filtered view instances

### 2.2 Directory Listing Fields (Search View)
Each member listing card/table row exposes:
* **Membership Number:** Confirmed unique identifier (e.g., `#4080`, `#133197`). *Note: IDs are non-continuous and do not directly equal total live count.*
* **Full Name:** First name and last name.
* **Location:** Town / City and Country.
* **Qualified As / Disciplines:** Comma/badge-separated list of recognized disciplines (e.g. *Personal Trainer*, *Group Fitness Instructor*, *Graduate Exercise Professional*, *Pilates Teacher - Matwork*, *Exercise for Health Specialist*).
* **Master Trainer Status:** Boolean indicator / Master Trainer badge where awarded.
* **Expiry Date:** Current membership validity date (format: DD/MM/YYYY or YYYY-MM-DD).
* **Member Profile URL:** Direct hyperlink to individual credential breakdown (e.g., `/user/{id}` or `/member-profile/{slug}`).

### 2.3 Individual Profile Structure (`full profile`)
Accessing an authorized individual profile expands into:
* **Professional Biography / Summary:** Freeform bio describing experience, coaching philosophy, and training methodology.
* **Specialties:** Targeted fitness disciplines (e.g., *Weight Management*, *Post-Rehab Exercise*, *Functional Movement*, *Strength & Conditioning*, *Youth & Senior Fitness*).
* **EQF Accreditation Levels:** European Qualifications Framework levels (Level 3, Level 4, Level 5, Level 6).
* **Certifications & Awarding Bodies:** Accredited vocational training providers, national registries, and Lifelong Learning Programme (LLP) records.
* **Publicly Listed Business Information:** Registered training studio/gym name, business telephone, public contact email.
* **Social Media & Web Links:** Explicitly linked URLs for Instagram, LinkedIn, Facebook, YouTube, X/Twitter, TikTok, and personal/business websites.

---

## 3. Technical Constraints & Access Limitations

| Dimension | Observation & Restriction | System Implementation Safeguard |
|---|---|---|
| **robots.txt Directives** | Disallows rapid crawling of internal paths and admin endpoints. | The system strictly respects robots directives. Batch requests enforce minimum 1.5s - 5s spacing. |
| **Rate Limiting & WAF** | Web Application Firewalls (Cloudflare/Drupal Flood control) mitigate automated scraping. | Zero bypass tools or CAPTCHA-cracking proxies. If HTTP 429 or 403 occurs, exponential backoff pauses the job cleanly. |
| **Non-Continuous IDs** | Membership numbers have historical gaps due to non-renewed memberships and organizational changes. | Database uses strict upsert mechanics; does not guess incremental numeric IDs. |
| **Separation of Listing & Profile** | Listing pages provide summary table; detailed profiles require secondary navigation. | Modular two-stage pipeline: Stage 1 = Listing Discovery; Stage 2 = Profile Deep Extraction. |
| **GDPR & Privacy (EU 2016/679)** | Member data constitutes personal data under GDPR. | Audit trails, data provenance, retention policy settings, and a dedicated Right-to-Erasure API endpoint. |

---

## 4. Status Matrix of Application Features

| Module / Feature | Operational Status | Authorization Dependency |
|---|---|---|
| **PostgreSQL Schema & Models** | **Fully Operational** | None (Local / Docker DB) |
| **Admin Dashboard UI (React/TS)** | **Fully Operational** | None (Independent Frontend) |
| **Multi-Sheet OpenPyXL Export** | **Fully Operational** | None (Instant Excel generator) |
| **Social & Web Link Classifier** | **Fully Operational** | None (Engine handles all 8 platforms) |
| **Data Quality & Normalization** | **Fully Operational** | None (Automated ISO & date cleansers) |
| **Audit Logs & GDPR Erasure** | **Fully Operational** | None (Full role-based audit trail) |
| **Approved CSV / XLSX Ingestion** | **Fully Operational** | Standardized admin upload |
| **Synthetic 150k Scale Pipeline** | **Fully Operational** | Benchmark script ready |
| **Automated Live EREPS Scraper** | **Configurable / Gated** | **Requires EREPS / EuropeActive Written Authorization** |
| **Official EREPS Partner API** | **Configurable / Gated** | **Awaiting Partner API Credentials** |
