# Technical Debt and Manual Work Required
## elipsLife Absence Management Platform — As Built

---

### Overview

This document is the candid assessment of what technical work remains, what architectural debt exists, and what the internal engineering team must complete before the platform can serve real users with real data.

The work is organized into categories. Each category includes what the current state is, what the risk is, and what needs to be done.

---

## Section 1: Architectural Debt

### 1.1 Portal Workflow Service is a Monolith

**Current state:** All portal route logic for all three portals runs inside a single Node.js process (`portal-workflow-service`). All seven Phase 1 domain services are imported as TypeScript modules and executed in-process. All data lives in shared memory.

**Risk:** This is the single largest architectural gap in the system. It means:
- A crash in any domain service crashes the entire portal
- There is no independent deployability, scalability, or fault isolation
- The memory footprint grows with all services loaded simultaneously
- Real distributed tracing and per-service observability is impossible
- It cannot run in a cloud-native environment without complete re-architecture

**What must be done:**
- Start each domain service as an independent HTTP process with its own database
- Replace the in-process function calls in `service-context.ts` with real HTTP client calls
- Implement service discovery (or use fixed URL configuration per environment)
- Add service-to-service authentication (internal JWT or mTLS)
- Handle network failures and retries at the workflow layer

**Effort:** High. This is foundational re-architecture.

---

### 1.2 Two Required Services Do Not Exist

**Current state:** `task-deadline-service` and `integration-gateway` are specified in the Phase 1 architecture document and referenced throughout the design, but neither has any code in the repository.

**`task-deadline-service` is responsible for:**
- Karenzfrist threshold tracking (waiting period for KTG benefit eligibility)
- Certificate expiry tasks
- Deadline escalation rules
- KTG submission reminder workflows

Without this service, the KTG case management workflow is incomplete. There is no mechanism to automatically flag expired certificates, calculate waiting period eligibility, or trigger escalation.

**`integration-gateway` is responsible for:**
- HR/payroll system connectors (SAP, Abacus, and similar)
- PAS (Policy Administration System) sync
- Claims system integration
- Webhook ingestion for external events

Without this service, there is no way to get real employee data into the system. All master data must be manually entered, which is not operationally viable.

**What must be done:**
- Build `task-deadline-service` from scratch (domain model, SQL schema, OpenAPI, application service, HTTP server)
- Build `integration-gateway` from scratch (connector framework, webhook ingestion, error handling, reconciliation)

**Effort:** Very High. Two complete services from scratch.

---

### 1.3 `people-service` Is Isolated

**Current state:** Unlike other Phase 1 services, `people-service` is not referenced in the portal-workflow-service's demo wiring. It has no repository adapter in the portal-workflow adapter layer. Its `package.json` is missing `main`, `types`, and `exports` fields.

**Risk:** Employee master data (the most foundational input to the entire system) has no runtime path even in the demo layer. Any workflow that depends on employee profile data is working from hard-coded demo fixtures.

**What must be done:**
- Fix the `package.json` to properly declare exports
- Create a memory repository adapter for `people-service`
- Wire it into the portal-workflow-service demo context
- Eventually give it an independent HTTP runtime

**Effort:** Medium.

---

## Section 2: Authentication and Authorization Debt

### 2.1 No Authentication Enforcement

**Current state:** The identity-access-service issues session tokens. No other service validates them. Any HTTP request to any endpoint is accepted without authentication.

**Risk:** Critical. This means:
- Any unauthenticated user can read any employer's data
- Any user can submit UVG accident reports, salary mass data, or payment operations on behalf of any tenant
- There is no technical barrier to data access or manipulation

**What must be done:**
- Add JWT signing to session tokens in identity-access-service (replace plain UUID tokens)
- Add authentication middleware to portal-workflow-service that validates Bearer tokens
- Add tenant isolation enforcement: the tenantId in a request must match the tenantId in the session token
- Add similar middleware to payment-operations-service, uvg-case-service, and premium-reconciliation-service
- Enforce RBAC permissions at the route level (not just return permission hints in the response)

**Effort:** High.

---

### 2.2 Sign-in Does Not Verify Passwords

**Current state:** `POST /v1/session/sign-in` accepts any email and tenantId combination that matches a demo user. There is no password field, no credential verification, and no brute-force protection.

**Risk:** Critical for any non-demo environment.

**What must be done:**
- Implement real credential storage (hashed passwords with bcrypt or argon2)
- OR integrate with an external identity provider (Azure AD, Okta, etc.)
- Add MFA support (TOTP or push notification)
- Add rate limiting on the sign-in endpoint

**Effort:** High.

---

### 2.3 No JWT, No Token Signing

**Current state:** Session tokens are randomly generated UUIDs stored in the file-backed state. They cannot be validated without a round-trip to the identity service.

**Risk:** At production scale, every request requiring auth validation would need a database lookup, creating a bottleneck.

**What must be done:**
- Replace UUID session tokens with signed JWTs (using RS256 or ES256)
- Allow downstream services to validate tokens without calling identity-access-service
- Implement token refresh and expiry

**Effort:** Medium.

---

## Section 3: Persistence Debt

### 3.1 No PostgreSQL Connectivity

**Current state:** No service connects to a live PostgreSQL instance. All twelve SQL schemas exist but are never applied or used.

**Risk:** The entire persistence layer is non-functional for production. Data is either in JSON files or lost on restart.

**What must be done (per service):**
- Select a PostgreSQL client library (recommended: `postgres.js` or `pg` with `drizzle-orm`)
- Create a `getPool()` or `getDb()` infrastructure helper
- Implement `PostgresRepositoryAdapter` classes for each service
- Apply the SQL schemas against real databases
- Write integration tests that cover at least the CRUD operations

**Effort:** Very High. This is the core persistence engineering work for the entire platform.

---

### 3.2 No Migration Runner

**Current state:** The `tools/migrations.mjs` validates that SQL files exist and are well-formed. It does not execute migrations or track which have been applied.

**Risk:** Without a migration runner, there is no safe path to evolving the database schema over time.

**What must be done:**
- Choose a migration execution strategy (Flyway CLI, `node-pg-migrate`, `drizzle-kit`, or similar)
- Configure the runner to track applied migrations in a `schema_migrations` table
- Integrate migration execution into deployment pipelines
- Document the rollback strategy

**Effort:** Medium.

---

### 3.3 File-backed Adapters Are Not Production-Safe

**Current state:** Three services (identity-access, payment-operations, premium-reconciliation) persist state to local JSON files. These adapters have no:
- Concurrent write protection
- Atomic writes
- File locking
- Backup/recovery mechanism
- Schema versioning

**Risk:** Under concurrent requests, state files can be corrupted. Files are local to the process, so horizontal scaling is impossible.

**What must be done:**
- Replace all three file-backed adapters with PostgreSQL adapters (as above)
- The file-backed adapters can be kept as a developer-only fallback but should not run in any shared environment

**Effort:** Covered by 3.1.

---

## Section 4: Runtime and Operational Debt

### 4.1 No Containerization

**Current state:** There are no Dockerfiles, no Docker Compose files, and no Kubernetes manifests anywhere in the repository.

**Risk:** The system cannot be deployed to any server or cloud environment without this work. Even development environments require manual setup.

**What must be done:**
- Write a Dockerfile for each of the six running services
- Write Dockerfiles for the three portal apps
- Create a Docker Compose file for local development (all services + PostgreSQL)
- Create Kubernetes manifests or Helm charts for each environment (dev, staging, production)

**Effort:** Medium to High.

---

### 4.2 No CI/CD Pipeline

**Current state:** No CI/CD configuration exists (no `.github/workflows/`, no `.gitlab-ci.yml`, no Jenkinsfile).

**Risk:** Code is not automatically tested on every commit. There is no automated path from code to deployment.

**What must be done:**
- Set up CI pipeline that runs `npm run typecheck`, `npm run test:smoke`, `npm run test:integration`, and portal builds on every PR
- Set up CD pipeline for deployment to dev, staging, and production environments
- Configure secrets management (never commit database URLs or credentials)

**Effort:** Medium.

---

### 4.3 No Secrets Management

**Current state:** Service ports are configurable via environment variables (`PORTAL_WORKFLOW_SERVICE_PORT`, etc.). File paths for data files can be overridden. But there is no secrets management — no database passwords, no API keys, no signing keys are configured because none are needed yet.

**Risk:** When real credentials are introduced, there must be a secure mechanism to inject them. The current codebase has no framework for this.

**What must be done:**
- Choose a secrets management approach (AWS Secrets Manager, HashiCorp Vault, Kubernetes Secrets + SOPS, etc.)
- Ensure no credentials ever appear in source code, Docker images, or environment variable defaults

**Effort:** Medium.

---

### 4.4 No API Gateway or Reverse Proxy

**Current state:** Services expose ports directly. There is no API gateway, reverse proxy, or load balancer configuration.

**Risk:** In production, services should not be directly internet-accessible. An API gateway is needed for:
- TLS termination
- Rate limiting
- Authentication token validation (or delegation to identity service)
- Routing to backend services
- Request logging

**What must be done:**
- Configure a reverse proxy (nginx, Traefik, AWS API Gateway, etc.)
- Define public-facing endpoints and map them to internal service ports
- Configure TLS certificates
- Implement rate limiting rules

**Effort:** Medium.

---

### 4.5 No Linter Configured

**Current state:** `package.json` contains `"lint": "echo \"lint configuration pending\""`.

**Risk:** Code quality and style consistency cannot be enforced. Potential bugs from type coercions, unused variables, and inconsistent patterns go uncaught.

**What must be done:**
- Configure ESLint with TypeScript rules
- Add Prettier for formatting
- Integrate with CI pipeline

**Effort:** Low.

---

## Section 5: Security Debt

### 5.1 AHV Number Encryption Not Implemented

**Current state:** The Phase 1 architecture document requires AHV numbers (Swiss social security numbers) to be encrypted at rest. The `document-service` also requires medical data encryption. Neither is implemented in any domain type, validation, or service.

**Risk:** Critical compliance risk. Swiss data protection law (nDSG) and potentially GDPR apply to AHV numbers and medical data.

**What must be done:**
- Implement column-level encryption for AHV fields in people-service PostgreSQL schema
- Implement encrypted blob references for medical documents
- Define key management approach (envelope encryption with per-tenant keys is recommended)
- Review all services for PII data flows

**Effort:** High.

---

### 5.2 No CORS Policy

**Current state:** No CORS headers are set on any service.

**Risk:** Browser-based portals making cross-origin requests to backend services will be blocked by browsers, OR (if later added permissively) could expose APIs to any origin.

**What must be done:**
- Configure CORS on all services with explicit allowed origins
- Allow only the portal origins in production
- Add OPTIONS preflight handling

**Effort:** Low.

---

### 5.3 Swiss Data Residency Not Enforced

**Current state:** The architecture document requires Swiss-only data residency. There is no infrastructure to enforce this.

**What must be done:**
- Ensure all PostgreSQL instances, blob storage, and log aggregation are hosted in Switzerland
- Document and audit the data flow for compliance verification

**Effort:** Medium (primarily infrastructure, not code).

---

## Section 6: Testing Debt

### 6.1 No Database Integration Tests

No test exercises any service against a real database. This means the SQL schemas have never been validated against a running PostgreSQL instance in an automated way.

**What must be done:**
- Add integration test fixtures that start a PostgreSQL container (Docker or testcontainers)
- Run a representative subset of service operations against a real DB
- Include in CI pipeline

**Effort:** Medium.

---

### 6.2 No Browser Tests

All three portals have been built but never browser-tested.

**What must be done:**
- Add Playwright (recommended) or Cypress
- Cover the golden path for each portal: employer absence management, internal case handling, employee self-service
- Include accessibility checks in the browser test suite (axe-core integration)

**Effort:** Medium to High.

---

### 6.3 No Security Testing

No penetration testing, OWASP scan, or dependency vulnerability audit has been run.

**What must be done:**
- Run `npm audit` and fix critical/high vulnerabilities
- Add OWASP ZAP or similar to the CI pipeline
- Commission penetration testing before production launch

**Effort:** Medium.

---

## Section 7: Localization Debt

### 7.1 French and Italian Are Incomplete

French (`fr-CH`) and Italian (`it-CH`) locales have structural placeholders in `frontend-platform` but are not translated. Users in French-speaking or Italian-speaking Swiss cantons will see English fallback text.

**What must be done:**
- Commission professional translation for all UI strings in fr-CH and it-CH
- Implement translation completeness checks in CI

**Effort:** Medium (primarily translation work, not engineering).

---

## Section 8: What Must Be Finished by Human Engineers

The following is an ordered list of the most critical manual work required before the platform can run in production. This list is not exhaustive but covers the items that block any real usage.

### Priority 1 — Blockers (Platform Cannot Function Without These)

1. **Wire all services to PostgreSQL.** This is the foundational step. Every service needs a real database.

2. **Implement real authentication.** Add JWT token signing to identity-access-service, and add token validation middleware to all other services. Without this, all data is accessible without authentication.

3. **Decompose portal-workflow-service.** The monolithic in-process wiring must be replaced with real HTTP calls to independent service instances.

4. **Build task-deadline-service.** KTG deadline management is a core regulatory requirement and cannot be deferred.

5. **Build integration-gateway.** Without HR/payroll connectors, there is no way to import real employee data.

### Priority 2 — Required Before Real Users

6. **Implement credential verification and MFA** in identity-access-service.

7. **Containerize all services** and create deployment infrastructure.

8. **Configure CI/CD pipeline.**

9. **Implement AHV and medical data encryption.**

10. **Complete fr-CH and it-CH localization.**

### Priority 3 — Required for Operational Stability

11. **Add a real migration runner** (not just validator).

12. **Add CORS policy and API gateway configuration.**

13. **Add browser tests (Playwright).**

14. **Add database integration tests.**

15. **Configure linter and code quality enforcement.**

16. **Write operational runbooks** for: service startup, database backup, certificate renewal, incident response.

17. **Set up monitoring, alerting, and log aggregation.**

---

## Summary Assessment

The repository contains well-structured, thoughtfully designed domain code. The architecture direction is sound. The domain models for all thirteen services are implemented. Six services have working HTTP runtimes. The portal applications build and have complete page structures.

However, the system as a whole is in a **pre-production, demo-capable** state. The gap to production is not a matter of minor polish — it involves foundational work on persistence, authentication, deployment infrastructure, and two entire missing services.

Engineers taking over this codebase should not attempt to move directly to production deployment. They should plan a deliberate phase of infrastructure and hardening work, starting with the Priority 1 items above, before exposing the system to real users or real data.
