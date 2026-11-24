# EREPS System API Documentation

**Base API Path:** `/api/v1`  
**Authentication Scheme:** Bearer JWT Token (`OAuth2PasswordBearer`)  
**Interactive Swagger UI:** Accessible at `http://localhost:8000/docs`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/login`
Authenticates administrator/operator credentials and issues JWT token.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "role": "admin",
    "username": "admin"
  }
  ```

### `GET /auth/me`
Retrieves authenticated user profile and permissions.

---

## 2. Member Registry Endpoints (`/api/v1/members`)

### `GET /members`
Search, filter, sort and paginate member records.
- **Query Parameters:**
  - `search` (string): Search query across full name, membership ID, city, or country.
  - `country` (string): Standardized country filter (e.g. `Germany`).
  - `city` (string): City filter.
  - `qualification` (string): Discipline/qualification filter (e.g. `Personal Trainer`).
  - `master_trainer_only` (boolean): `true` to restrict to Master Trainer accreditations.
  - `page` (int, default: 1): Page number.
  - `page_size` (int, default: 20, max: 100): Records per page.
  - `sort_by` (string, default: `created_at`): Column to sort by.
  - `sort_desc` (boolean, default: `true`): Descending sort.
- **Response (200 OK):** Returns `MemberListResponse` containing `items`, `total`, `page`, `page_size`, `total_pages`.

### `GET /members/{member_id}`
Returns full relational breakdown of a single member:
- Member base details & Master Trainer status
- Qualifications & EQF levels
- Full profile biography, specialties, and business contacts
- All verified external links and social media accounts
- Provenance and collection date

### `POST /members/{member_id}/correct`
Allows administrators to manually rectify attributes with audited provenance.
- **Request Body:**
  ```json
  {
    "field_name": "city",
    "new_value": "Berlin",
    "correction_reason": "Verified against state fitness certification registry"
  }
  ```

---

## 3. Social Media & Website Engine (`/api/v1/links`)

### `GET /links`
Retrieves classified and sanitized social media links and personal/business URLs.
- **Query Parameters:**
  - `platform` (string): `instagram`, `linkedin`, `facebook`, `youtube`, `twitter_x`, `tiktok`, `personal_website`, `business_website`.
  - `link_type` (string): `social` or `website`.
  - `verified_only` (boolean): Filter verified links.

### `POST /links/{link_id}/toggle-verify`
Toggles link verification status.

---

## 4. Extraction Engine (`/api/v1/extraction`)

### `POST /extraction/jobs`
Initializes and triggers an extraction pipeline run.
- **Job Types:**
  - `mock_50`: Seeds 50 multi-disciplinary mock records with profiles and link validations.
  - `scale_150k`: Executes high-throughput bulk benchmark for 150,000 synthetic records.
  - `live_directory`: Executes authorized live extraction (requires `authorized_token`).

### `GET /extraction/jobs`
Lists recent background jobs, progress percentages, and status.

### `POST /extraction/jobs/{job_id}/pause`
Gracefully pauses a running extraction job, writing current checkpoint state.

### `POST /extraction/jobs/{job_id}/resume`
Resumes a paused job from its last saved database checkpoint.

### `POST /extraction/jobs/{job_id}/retry`
Retries all unresolved failed records for a job.

### `GET /extraction/jobs/{job_id}/logs`
Fetches real-time log traces for execution auditing.

### `GET /extraction/failures`
Lists quarantined failed records with failure reasons and retry attempts.

---

## 5. Export Centre (`/api/v1/export`)

### `GET /export/excel`
Generates and downloads the official **5-Sheet OpenPyXL Master Workbook**:
- **Sheet 1:** ALL MEMBERS
- **Sheet 2:** MEMBER PROFILES
- **Sheet 3:** SOCIAL MEDIA LINKS
- **Sheet 4:** WEBSITES
- **Sheet 5:** EXTRACTION LOGS
- **Query Parameters:** `country`, `qualification` (optional filtering).

### `GET /export/csv`
Downloads targeted CSV files:
- `export_type=members`: Full members listing.
- `export_type=links`: Social and web links dump.
- `export_type=failed`: Quarantined failure records dump.

---

## 6. Analytics & Intelligence (`/api/v1/analytics`)

### `GET /analytics`
Computes real-time KPI aggregations:
- Total records, profiles processed, pending profiles
- Members with websites & social media
- Failure rate & deduplication statistics
- Top 10 country distributions
- Top qualification distributions
- Social media platform distribution
- Completeness & missing field audit numbers

---

## 7. Compliance & Governance (`/api/v1/governance`)

### `GET /governance/inspection-report`
Returns the automated source website inspection report and permissions matrix.

### `POST /governance/gdpr-erasure`
Executes GDPR Article 17 Right-to-Erasure deletion request.

### `POST /governance/import-csv`
Uploads and standardizes an approved administrative CSV dataset.

### `GET /governance/audit-logs`
Returns the system administrative audit event log.
