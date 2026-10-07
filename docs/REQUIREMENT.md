# Secure Campus Service Portal
## Requirements Specification

**Version:** 1.0  
**Status:** Baseline Draft  
**Last Updated:** 2026-10-07

---

## 1. Requirement Rules

Every requirement must have:

- unique ID
- type
- description
- priority
- source/evidence
- acceptance criteria
- dependencies if known
- status

Do not convert assumptions into requirements.

Use these source labels:

- `OBSERVED` = directly observed from an authoritative/real source
- `STAKEHOLDER` = provided by a stakeholder/team member
- `PROPOSED` = design proposal by the project team
- `INFERRED` = logically inferred; requires validation before baseline
- `UNKNOWN` = insufficient evidence

---

## 2. Functional Requirements

### Authentication

**FR-AUTH-001**  
The system shall authenticate registered users before granting protected portal access.

**FR-AUTH-002**  
The system shall enforce authorization after authentication.

**FR-AUTH-003**  
The system shall prevent users from accessing resources outside their permitted role and ownership scope.

**FR-AUTH-004**  
The system shall provide secure logout/session termination.

**FR-AUTH-005**  
The system shall apply rate limiting or equivalent abuse protection to authentication endpoints.

### User Management

**FR-USER-001**  
The system shall maintain user identity and role information required for authorization.

**FR-USER-002**  
Authorized administrators shall be able to manage user status where permitted.

### Complaints

**FR-CMP-001**  
A student shall be able to submit a complaint.

**FR-CMP-002**  
A complaint shall have a unique ticket identifier.

**FR-CMP-003**  
A complaint shall maintain status information.

**FR-CMP-004**  
A student shall be able to view their own complaint history.

**FR-CMP-005**  
Authorized staff shall be able to process complaints assigned to their department/scope.

**FR-CMP-006**  
The system shall maintain complaint status history.

**FR-CMP-007**  
Authorized users shall be able to resolve or close complaints according to workflow rules.

### Service Requests

**FR-REQ-001**  
A student shall be able to submit an available service request.

**FR-REQ-002**  
The system shall validate required request fields.

**FR-REQ-003**  
A request shall have a unique identifier.

**FR-REQ-004**  
A student shall be able to track the request status.

**FR-REQ-005**  
Authorized staff shall be able to process assigned requests.

### Notices

**FR-NOTICE-001**  
Authorized administrators shall be able to create and publish notices.

**FR-NOTICE-002**  
Authorized users shall be able to view notices applicable to them.

### Notifications

**FR-NOTIF-001**  
The system shall create notifications for defined workflow events.

**FR-NOTIF-002**  
Notifications shall not disclose information to unauthorized users.

### Audit

**FR-AUDIT-001**  
The system shall record important administrative and security-sensitive actions.

**FR-AUDIT-002**  
Audit records shall be protected from unauthorized modification.

### Feedback

**FR-FB-001**  
The system may allow users to submit feedback after a service is resolved.

---

## 3. Non-Functional Requirements

### Security

**NFR-SEC-001**  
Passwords shall never be stored in plaintext.

**NFR-SEC-002**  
Authorization shall be enforced server-side.

**NFR-SEC-003**  
Sensitive data shall be protected in transit.

**NFR-SEC-004**  
Input must be validated server-side.

**NFR-SEC-005**  
File uploads shall be restricted and validated.

### Privacy

**NFR-PRIV-001**  
The system shall minimize collection of personal data.

**NFR-PRIV-002**  
Personal data shall only be accessible to authorized users.

### Performance

**NFR-PERF-001**  
Core dashboard and CRUD operations should respond within an agreed target under the defined test load.

The actual target must be measured and baselined by the team. Do not invent a performance number.

### Availability

**NFR-AVL-001**  
The deployment environment shall provide the availability required by the project scope.

### Usability

**NFR-USE-001**  
Core student workflows shall be usable on desktop and mobile-sized screens.

### Maintainability

**NFR-MNT-001**  
The system shall use modular components and documented APIs.

### Auditability

**NFR-AUD-001**  
Material security and administrative actions shall be traceable.

---

## 4. AI Requirements

**FR-AI-001**  
The system may provide AI-assisted category/department suggestions for complaints.

**FR-AI-002**  
The system may identify potentially duplicate complaints using semantic similarity.

**FR-AI-003**  
The system may summarize long complaints or notices.

**FR-AI-004**  
The system may provide answers from an approved campus knowledge base.

**NFR-AI-001**  
AI responses shall not be treated as authoritative institutional policy unless explicitly sourced from an authoritative record.

**NFR-AI-002**  
AI access shall respect the same authorization and data-access boundaries as the requesting user.

**NFR-AI-003**  
AI features shall be evaluated using a documented test set before accuracy claims are made.

---

## 5. Requirement Status Values

- `DRAFT`
- `VALIDATED`
- `APPROVED`
- `IMPLEMENTED`
- `TESTED`
- `DEFERRED`
- `REJECTED`

---

## 6. Acceptance Criteria Format

Use:

```text
Given [precondition]
When [action]
Then [expected result]
```

Example:

```text
Given a valid authenticated student
When the student submits a complete complaint
Then the system creates a unique complaint ticket
and displays the initial status.
```

---

## 7. Requirements Traceability ID Convention

Use:

```text
FR-AUTH-001
FR-CMP-001
FR-REQ-001
FR-AI-001
NFR-SEC-001
NFR-PERF-001
```

Never reuse an ID for a different requirement.

If a requirement is replaced, preserve the old ID and record the change in `memory.md`.
