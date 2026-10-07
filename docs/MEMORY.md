# Secure Campus Service Portal
## Project Memory / Decision Log

**Purpose:** Persistent project state for humans and coding/agentic AI.  
**Rule:** This file is the source of project history and current decisions.  
**Last Updated:** 2026-10-07

---

# 1. Current Project State

## Current Phase

**Phase 1: Problem Understanding and System Study (Analytical Baseline)**  
*Active Workstream:* **Phase 12 (UI Design) & Phase 13 (Prototype Implementation)** initiated early per user instruction (DECISION-UI-001). Phases 1–11 are NOT marked completed; analytical work remains open.

## Current Baseline

The system is planned as a secure campus service portal for:

- complaints
- service requests
- notices
- service tracking
- role-based access
- departmental processing
- administrative dashboards
- notifications
- audit logging
- optional AI assistance

---

# 2. Approved Actors

Current proposed actors:

- Student
- Faculty/Staff
- Department Staff/Admin
- Super Admin

**Status:** Proposed. Validate through stakeholder analysis.

---

# 3. Approved Technology Baseline

Current proposed stack:

- React + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma
- Zod
- secure authentication/session architecture
- object storage
- REST/OpenAPI
- LLM API/RAG only where justified

**Status:** Proposed baseline, not immutable.

---

# 4. Decisions

Use this format for every decision:

```text
DECISION-ID:
Date:
Phase:
Decision:
Reason:
Alternatives:
Impact:
Approved by:
Evidence:
```

### DECISION-UI-001
- **Date:** 2026-10-07
- **Phase:** UI Design / Prototype Implementation
- **Decision:** The project is moving from the documented Phase 1 baseline into UI Design and Prototype Implementation before completing all analytical phases.
- **Reason:** The team explicitly decided to build and validate the UI/UX first using mock services, while keeping requirements, security, data contracts and architecture traceable.
- **Alternatives:** Defer UI until completion of Phases 1 through 11. Rejected by user/stakeholder instruction to accelerate tangible UI evaluation.
- **Impact:** Frontend prototype work can proceed using mock data and mock authentication. This does NOT mean that Phases 1-11 are considered complete.
- **Approved by:** Project team / user instruction.
- **Evidence:** User prompt and explicit directive dated 2026-10-07.

### DECISION-UI-002
- **Date:** 2026-10-07
- **Phase:** UI Design / Prototype Implementation
- **Decision:** Retain persistent left sidebar navigation (240–260px) as the primary navigation system. Expand application shell to edge-to-edge viewport layout, eliminating artificial `max-w-7xl` gutters. Redesign Student Dashboard to prioritize information hierarchy and dominant full-width tables over SaaS-style card nesting.
- **Reason:** Multiple campus services and role-based workflows require scalable vertical hierarchical navigation. Artificial center-constraining created excessive whitespace, looking like generic AI/SaaS templates rather than an institutional university portal.
- **Alternatives:** Grid/box card navigation (rejected - does not scale across roles/modules).
- **Impact:** Header and AppShell now span 100% viewport width. Sidebar is persistently anchored to the left on desktop. Main content expands dynamically. Dashboard gives visual dominance to recent complaints and requests.
- **Approved by:** Project team / user instruction.
- **Evidence:** User UX review prompt dated 2026-10-07.

---

# 5. Change Log

Use this format:

```text
CHANGE-ID:
Date:
Phase:
Changed:
Old:
New:
Reason:
Affected Documents:
Affected Requirements:
Affected Code:
Testing Required:
Approved by:
```

### CHANGE-UI-001
- **Date:** 2026-10-07
- **Phase:** Phase 12 (UI Design) & Phase 13 (Prototype Implementation)
- **Changed:** Frontend application scaffolding, domain contracts, mock service layer, and role-based portal views.
- **Old:** Zero code in repository (documentation baseline only in `docs/`).
- **New:** Fully functional React + TypeScript + Vite + Tailwind CSS frontend in `frontend/`.
- **Reason:** Implement UI/UX early with mock services per explicit user instruction (DECISION-UI-001).
- **Affected Documents:** `docs/MEMORY.md`, artifact `route_map_and_user_flows.md`.
- **Affected Requirements:** FR-AUTH-001 to 004, FR-USER-001/002, FR-CMP-001 to 007, FR-REQ-001 to 005, FR-NOTICE-001/002, FR-NOTIF-001/002, FR-AUDIT-001/002, FR-FB-001, NFR-USE-001.
- **Affected Code:** Entire `frontend/` directory.
- **Testing Required:** TypeScript compiler checks (`tsc -b`), production bundle build (`vite build`), and local server runtime probe.
- **Approved by:** Project team / user instruction.

### CHANGE-UI-002
- **Date:** 2026-10-07
- **Phase:** Phase 12 (UI Design) & Phase 13 (Prototype Implementation)
- **Changed:** Full-viewport layout overhaul, integrated sidebar hierarchy, and information-first Student Dashboard redesign.
- **Old:** Centered `max-w-7xl` container leaving artificial whitespace on left and right; card-nested Student Dashboard with oversized decorative metric cards and generic SaaS appearance.
- **New:** Edge-to-edge layout with full-width header (`h-14`), left-anchored persistent sidebar (`w-64`) with grouped navigation (`SERVICES`, `INFORMATION`, `ACCOUNT`), streamlined compact metric blocks, slim advisory strip, and full-width dominant complaints & requests tables.
- **Reason:** Remove excessive artificial gutters and generic AI-generated SaaS aesthetics in favor of serious institutional portal usability.
- **Affected Documents:** `docs/MEMORY.md`.
- **Affected Requirements:** NFR-USE-001, FR-CMP-004, FR-REQ-004.
- **Affected Code:** `AppShell.tsx`, `Header.tsx`, `Sidebar.tsx`, `StudentDashboardPage.tsx`, `ComplaintDetailPage.tsx`, `CreateComplaintPage.tsx`, `RequestDetailPage.tsx`, `CreateRequestPage.tsx`, `NotificationsPage.tsx`, `StudentProfilePage.tsx`, `AdminNoticesPage.tsx`, `StaffCaseDetailPage.tsx`.
- **Testing Required:** `tsc -b && vite build` (verified exit 0).
- **Approved by:** Project team / user instruction.

### CHANGE-DEPLOY-001
- **Date:** 2026-10-07
- **Phase:** Deployment & Git Release Preparation
- **Changed:** Configured root and subfolder Vercel deployment rules, root monorepo scripts, and comprehensive institutional README documentation.
- **Old:** Local-only development layout with no root build script or SPA deep-link rewrite fallback for Vercel.
- **New:** Root `vercel.json` and `frontend/vercel.json` SPA rewrites (`/(.*) -> /index.html`), root `package.json` with npm prefix runner (`npm --prefix frontend run build`), clean `.gitignore`, and detailed academic `README.md`.
- **Reason:** Enable zero-configuration, production-grade cloud deployment to Vercel and publish codebase to GitHub.
- **Affected Documents:** `README.md`, `vercel.json`, `package.json`, `frontend/vercel.json`, `.gitignore`, `docs/MEMORY.md`.
- **Affected Requirements:** NFR-REL-001, NFR-USE-001.
- **Testing Required:** `npm run build` executed cleanly from root (exit code 0).
- **Approved by:** Project team / user instruction.

---

# 6. Open Questions

Every unresolved issue goes here.

```text
QUESTION-ID:
Question:
Why it matters:
Owner:
Status:
Evidence needed:
Decision deadline:
```

Never silently answer an open question with an assumption.

---

# 7. Assumptions

Only record assumptions explicitly.

```text
ASSUMPTION-ID:
Assumption:
Why assumed:
Risk if wrong:
Validation method:
Status:
```

---

# 8. Verified Facts

Only put a fact here when there is evidence.

```text
FACT-ID:
Fact:
Source:
Date checked:
Evidence/reference:
Scope:
```

University-specific information must not be added as a verified fact without a source.

---

# 9. Requirement Changes

Record requirement additions, removals, replacements, and scope changes here.

Never delete historical requirements without recording what happened.

---

# 10. AI Decisions

Record:

- AI feature
- purpose
- data used
- model/provider
- prompt/version if relevant
- evaluation method
- known failure modes
- privacy impact
- approval status

---

# 11. Agent Activity Rules

Before changing the project:

1. Read `PRD.md`
2. Read `REQUIREMENT.md`
3. Read `SECURITY.md`
4. Read `TECHSTACK.md`
5. Read this `MEMORY.md`
6. Read `PROMPT.md`
7. Determine current phase
8. Check open questions and constraints
9. Make the smallest justified change
10. Update memory after material changes

---

# 12. Current Phase Checklist

### Phase 1
- [ ] Problem statement validated
- [ ] Existing process studied
- [ ] Existing campus services identified
- [ ] Pain points documented
- [ ] Evidence/source recorded

### Phase 2
- [ ] Stakeholders identified
- [ ] Stakeholder responsibilities documented
- [ ] Stakeholder priorities documented

### Phase 3
- [ ] Functional requirements elicited
- [ ] Non-functional requirements elicited
- [ ] Requirements validated

### Phase 4
- [ ] In-scope items listed
- [ ] Out-of-scope items listed
- [ ] Scope approved

### Phase 5
- [ ] Technical feasibility
- [ ] Economic feasibility
- [ ] Operational feasibility
- [ ] Schedule feasibility
- [ ] Security/privacy feasibility

### Phase 6
- [ ] Actors
- [ ] Use cases
- [ ] Use-case descriptions
- [ ] Relationships

### Phase 7
- [ ] Context diagram
- [ ] DFD
- [ ] Activity/process models

### Phase 8
- [ ] Entities
- [ ] Data dictionary
- [ ] Data relationships

### Phase 9
- [ ] Sequence diagrams
- [ ] State models
- [ ] Interaction models

### Phase 10
- [ ] Architecture
- [ ] Component design
- [ ] API design
- [ ] Security architecture

### Phase 11
- [ ] ER diagram
- [ ] Schema
- [ ] Keys/constraints
- [ ] Normalization

### Phase 12
- [ ] Wireframes
- [ ] UI system
- [ ] Responsive layouts

### Phase 13
- [ ] Prototype
- [ ] Core workflows
- [ ] Security controls

### Phase 14
- [ ] Unit tests
- [ ] Integration tests
- [ ] System tests
- [ ] Security tests
- [ ] AI evaluation

### Phase 15
- [ ] Requirements mapped to design
- [ ] Requirements mapped to implementation
- [ ] Requirements mapped to tests
- [ ] Final traceability matrix

---

# 13. Current Open Questions

- Which exact AMU services are inside the final project scope?
- Which authentication/identity source will be available for the prototype?
- Which roles and departments will be officially represented?
- Which real university workflows can legally and practically be modeled?
- Which notices/data can be used in the prototype?
- Which AI provider is permitted?
- What data may be sent to an external AI provider?
- What deployment environment will be used?

These questions must be resolved with evidence before being treated as facts.
