# Secure Campus Service Portal
## Security Specification

**Version:** 1.0  
**Status:** Baseline  
**Last Updated:** 2026-10-07

---

## 1. Security Objective

The portal must protect:

- user accounts
- authentication credentials
- student personal data
- complaints and requests
- uploaded documents
- administrative information
- audit records
- AI-accessible information

The primary security goals are confidentiality, integrity, availability, authentication, authorization, accountability, and privacy.

---

## 2. Threat Model

The team shall consider at minimum:

- credential stuffing
- brute-force login attempts
- session theft
- broken access control / IDOR
- privilege escalation
- SQL injection
- XSS
- CSRF where applicable
- malicious file upload
- path traversal
- insecure direct object references
- mass assignment
- API abuse
- rate-limit bypass
- information leakage
- unauthorized data export
- prompt injection against AI features
- sensitive-data leakage to AI providers
- malicious or compromised admin accounts

Do not claim a threat is mitigated unless implementation and testing support the claim.

---

## 3. Authentication

Required principles:

- secure password hashing using a modern password hashing algorithm
- password policy appropriate to the threat model
- secure session/token handling
- logout/invalidation
- rate limiting
- generic authentication error messages where appropriate
- protection against credential enumeration
- secure password reset if implemented
- optional MFA as a future enhancement unless explicitly included in scope

Never store plaintext passwords.

Never place passwords or long-lived secrets in source code.

---

## 4. Authorization / RBAC

Authorization must be checked on the backend for every protected resource.

Example:

```text
Student:
    can read own complaints

Department Staff:
    can read/process complaints assigned to their authorized department

Admin:
    can perform system-level operations according to permission policy
```

A hidden button is NOT authorization.

The backend must independently verify:

1. authenticated identity
2. role/permission
3. resource ownership or permitted scope
4. requested action

---

## 5. API Security

- validate all request bodies, query parameters, and path parameters
- use parameterized queries/ORM safely
- reject unexpected fields where appropriate
- apply rate limiting to sensitive endpoints
- return safe error messages
- do not expose stack traces in production
- use secure HTTP headers
- configure CORS explicitly
- keep secrets in environment/secret management
- log security-relevant failures

---

## 6. File Upload Security

For every uploaded file:

- validate MIME type
- validate extension
- enforce size limits
- generate server-side storage names
- do not trust the original filename
- prevent executable file types
- store outside the executable web root where practical
- authorize download access
- scan files where feasible
- do not expose predictable private file URLs

---

## 7. Database Security

- use least-privilege database credentials
- parameterize database access
- do not expose database credentials to the frontend
- use migrations
- define foreign keys and constraints
- back up according to deployment requirements
- protect production database access

---

## 8. Audit Logging

Record important actions such as:

- login failures where appropriate
- successful administrative login
- role changes
- user status changes
- complaint assignment
- status changes
- resolution/closure
- notice publication
- security configuration changes

Audit logs should contain enough information to reconstruct an event without unnecessarily storing sensitive data.

---

## 9. AI Security

AI features create additional risks.

### Prompt Injection

Treat retrieved notices, uploaded documents, user text, and external content as untrusted data.

Never allow content from a document or user message to redefine system authorization rules.

### Data Leakage

Before sending data to an external AI provider:

- determine whether the data is allowed to leave the system
- minimize data
- remove unnecessary personal identifiers
- enforce authorization before retrieval
- avoid sending unrelated records

### RAG Security

Retrieval must be permission-aware.

A student must not retrieve private departmental records simply because the embedding search found them.

### Hallucination Control

For policy/FAQ answers:

- prefer authoritative sources
- provide source references where possible
- state uncertainty when evidence is missing
- do not invent rules, deadlines, fees, contacts, or procedures

---

## 10. Security Testing

Test at minimum:

- authentication
- authorization/RBAC
- IDOR
- SQL injection
- XSS
- CSRF where applicable
- file upload abuse
- rate limiting
- session handling
- API validation
- sensitive information exposure
- AI prompt injection
- RAG authorization
- audit logging

---

## 11. Security Rule

**No security claim without evidence.**

Do not write:

> "The system is secure."

Prefer:

> "The implemented RBAC controls were tested against the defined authorization test cases."

Security is a property demonstrated through design, implementation, configuration, and testing, not a label.
