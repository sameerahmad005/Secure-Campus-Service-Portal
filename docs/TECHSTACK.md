# Secure Campus Service Portal
## Technology Stack and Architecture

**Version:** 1.0  
**Status:** Proposed Baseline  
**Last Updated:** 2026-10-07

---

## 1. Recommended Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| API | REST + OpenAPI |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Authentication | Secure session or access/refresh-token architecture |
| Password Hashing | Argon2id or bcrypt |
| File Storage | S3-compatible object storage / Supabase Storage |
| Charts | Recharts or equivalent |
| Testing | Vitest/Jest + Supertest + Playwright |
| API Documentation | Swagger/OpenAPI |
| Version Control | Git + GitHub |
| AI | LLM API + embeddings/RAG where justified |
| Deployment | Select based on verified project constraints |

---

## 2. Architecture

```text
Browser
   │
   │ HTTPS
   ▼
Frontend
   │
   │ REST API
   ▼
Backend API
   ├── Auth
   ├── RBAC
   ├── Complaints
   ├── Requests
   ├── Notices
   ├── Notifications
   ├── Audit
   ├── Reporting
   └── AI Gateway
          │
          ├── LLM Provider
          └── Retrieval/Knowledge Base
   │
   ├── PostgreSQL
   └── Object Storage
```

---

## 3. Frontend Structure

Suggested:

```text
frontend/
  src/
    components/
    pages/
    layouts/
    hooks/
    services/
    types/
    utils/
    features/
      auth/
      complaints/
      requests/
      notices/
      notifications/
      dashboard/
```

Frontend must never be treated as the security boundary.

---

## 4. Backend Structure

```text
backend/
  src/
    controllers/
    routes/
    middleware/
    services/
    repositories/
    validators/
    config/
    utils/
    types/
    app.ts
    server.ts
```

Suggested separation:

```text
Route
  ↓
Authentication Middleware
  ↓
Authorization Middleware
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Repository / Database
```

---

## 5. Database Core Entities

Initial entities:

```text
users
roles
permissions
user_roles
departments
services
complaints
complaint_categories
requests
request_categories
attachments
status_history
notifications
notices
feedback
audit_logs
```

Actual schema must be derived during Phase 11. Do not invent columns simply because they appear in this conceptual list.

---

## 6. API Design Principles

Use:

```text
/api/v1/...
```

Examples:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/me

POST   /api/v1/complaints
GET    /api/v1/complaints
GET    /api/v1/complaints/:id
PATCH  /api/v1/complaints/:id/status

POST   /api/v1/requests
GET    /api/v1/requests/:id

GET    /api/v1/notices
POST   /api/v1/notices
```

Exact API design must be recorded when implemented.

---

## 7. AI Architecture

Use an AI gateway/service instead of scattering direct LLM calls throughout the application.

```text
Application
    ↓
AI Gateway
    ↓
Policy / Authorization Check
    ↓
Data Minimization
    ↓
Prompt / Retrieval
    ↓
LLM
    ↓
Output Validation
    ↓
Application
```

AI output must be treated as untrusted generated content until validated.

---

## 8. Environment Variables

Never commit secrets.

Example:

```text
DATABASE_URL=
AUTH_SECRET=
AI_API_KEY=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
EMAIL_API_KEY=
```

Provide `.env.example` with placeholders only.

---

## 9. Technology Change Rule

Changing a baseline technology requires:

1. reason
2. alternative considered
3. impact on code/architecture/security
4. migration impact
5. update to `memory.md`
6. update to this file
7. update to affected PRD/requirements if necessary

No agent should silently switch the stack.
