# Secure Campus Service Portal
## Product Requirements Document (PRD)

**Project Type:** College Software Engineering Project  
**System:** Secure Campus Service Portal  
**Status:** Initial Baseline  
**Version:** 1.0  
**Last Updated:** 2026-10-07

---

## 1. Product Overview

The Secure Campus Service Portal is an authentication-based campus service management system. It provides a centralized platform for students to submit complaints and service requests, access notices, track request progress, and receive updates. Authorized faculty, departmental staff, and administrators can process requests through role-based dashboards.

The system may also provide carefully controlled AI-assisted capabilities such as complaint classification, duplicate detection, summarization, and campus-information assistance. AI must assist users and staff; it must not silently override security, authorization, official decisions, or institutional policy.

---

## 2. Problem Statement

Campus services are often distributed across departments, forms, notices, emails, manual processes, and separate systems. This creates problems such as:

- difficulty discovering the correct service
- lack of centralized request tracking
- unclear responsibility for unresolved issues
- limited visibility into request status
- duplicated complaints
- inconsistent communication
- weak auditability of administrative actions

The proposed portal centralizes these workflows while maintaining authentication, authorization, traceability, and auditability.

---

## 3. Product Goals

1. Provide a single secure entry point for campus services.
2. Authenticate users and enforce role-based access control.
3. Allow students to submit and track complaints and requests.
4. Route requests to the appropriate department.
5. Allow authorized staff to update, resolve, and document requests.
6. Provide notices and notifications.
7. Provide administrative dashboards and reports.
8. Maintain an auditable history of important actions.
9. Use AI only where it creates measurable workflow value.
10. Maintain a clear requirements-to-test traceability chain.

---

## 4. Non-Goals

Unless explicitly approved later, the MVP will NOT attempt to:

- replace official university ERP systems
- process real financial transactions
- make legally binding institutional decisions
- automatically approve sensitive requests
- use AI as the final authority for access control
- scrape or reproduce protected university data without authorization
- guarantee that information on public university websites is complete or current
- build every possible campus service

---

## 5. Primary Actors

### Student
- authenticate
- view available services
- submit complaints
- submit service requests
- upload permitted attachments
- track status
- receive notifications
- view notices
- provide feedback after resolution

### Faculty / Staff
- access permitted departmental workflows
- view assigned cases
- update status
- add internal/public remarks
- resolve cases where authorized

### Department Administrator
- manage departmental cases
- assign/reassign cases
- monitor SLA/status
- review workload
- generate departmental reports

### Super Administrator
- manage system-wide configuration
- manage users/roles where authorized
- manage departments/services
- publish notices
- view system-wide analytics
- inspect audit logs

---

## 6. Core Modules

1. Authentication and session management
2. Role-Based Access Control (RBAC)
3. Student dashboard
4. Complaint management
5. Service request management
6. Service/status tracking
7. Department dashboard
8. Administrative dashboard
9. Notice management
10. Notification management
11. File/attachment management
12. Feedback
13. Audit logging
14. Reporting and analytics
15. AI assistance
16. Help/FAQ or knowledge base

---

## 7. Core Workflow

```text
User Login
   ↓
Authentication
   ↓
Authorization / Role Check
   ↓
Student submits complaint/request
   ↓
Validation
   ↓
Ticket created
   ↓
Category / Department assignment
   ↓
Department review
   ↓
Assigned / In Progress
   ↓
Resolution
   ↓
Student notification
   ↓
Student feedback
   ↓
Closed
```

Every state transition must be recorded in status history where applicable.

---

## 8. AI Scope

AI candidates:

- complaint/category suggestion
- department suggestion
- semantic duplicate detection
- complaint summarization
- notice summarization
- controlled campus FAQ assistant using approved knowledge sources

AI must not:

- determine whether a user is authorized
- bypass RBAC
- invent university rules
- fabricate service availability
- automatically make high-impact decisions without an approved human workflow
- expose private records to an LLM without authorization and data-minimization controls

AI output should be labeled as a suggestion when it is not authoritative.

---

## 9. Success Criteria

The MVP is successful when:

- users can securely authenticate
- unauthorized users cannot access restricted resources
- students can submit and track cases
- staff can process assigned cases
- administrators can monitor system activity
- notices can be published and viewed
- status history is preserved
- audit logs capture important administrative/security actions
- core workflows have tests
- requirements can be traced to implementation and test cases
- AI features, if implemented, are evaluated rather than claimed to be accurate without evidence

---

## 10. Constraints

- This is an academic project.
- University-specific facts must be verified before being treated as requirements.
- The team must distinguish between observed existing processes and proposed system behavior.
- The project must comply with applicable privacy, security, copyright, and institutional policies.
- Technical choices can change only through documented change control.

---

## 11. Project Phases

1. Problem Understanding and System Study
2. Stakeholder Analysis
3. Requirement Elicitation
4. Scope Analysis
5. Feasibility Analysis
6. Use Case Analysis
7. Process Modelling
8. Data Analysis
9. Behavioural and Interaction Modelling
10. System Design
11. Database Design
12. User Interface Design
13. Prototype Implementation
14. Testing
15. Requirements Traceability

---

## 12. Definition of Done

A feature is not considered complete merely because its UI exists.

A feature is complete only when applicable:

- requirement is documented
- acceptance criteria exist
- authorization is implemented
- validation exists
- database/API behavior works
- error handling exists
- auditability is considered
- tests exist
- security implications are reviewed
- traceability entry is updated
- memory/change history is updated

---

## 13. Change Control

No agent may silently change the product scope or a baseline requirement.

For every material change:

1. identify the reason
2. identify affected requirements
3. identify affected architecture/security/data/UI/tests
4. record the change in `memory.md`
5. update affected documents
6. preserve previous decisions when historical traceability is needed
