# Phase 1 Architecture

## Product Goal

Build a multi-tenant Absence Management Platform for Swiss group insurance clients of elipsLife AG with direct support for KTG and UVG workflows, direct-claims ownership, and Swiss regulatory compliance.

## Phase 1 Service Map

### Frontend Apps

- `apps/employer-portal`
  - Next.js App Router
  - Roles: HR Manager, Payroll Manager, Line Manager, Read-only Viewer
- `apps/internal-portal`
  - Next.js App Router
  - Roles: Claims Handler, Account Manager, Actuary, Admin

### Backend Services

- `identity-access-service`
  - SSO, MFA, session management, RBAC, ABAC claims
- `people-service`
  - Tenants, legal entities, employees, employments, salary history, policy eligibility
- `absence-service`
  - Absence events, recurrence, calendars, Bradford Factor inputs
- `ktg-case-service`
  - KTG case lifecycle, case notes, submission readiness, relapse linking
- `document-service`
  - Encrypted medical documents, OCR jobs, metadata extraction, access logs
- `task-deadline-service`
  - Karenzfrist thresholds, certificate expiry tasks, escalation rules
- `inbox-notification-service`
  - Inbox obligations, preferences, templates, in-app and email delivery workflow
- `dashboard-projection-service`
  - Dashboard KPI snapshots, widget projections, freshness tracking
- `claims-intake-workspace-service`
  - Internal claims-ops workspace, intake blockers, missing-information loops, handler queue projection
- `benefit-engine-service`
  - Taggeld calculation, Lohnfortzahlung coordination, payment basis outputs
- `integration-gateway`
  - HR/payroll adapters, PAS sync, claims system sync, webhook ingestion

## Domain Boundaries

- `people-service` is product-neutral and provides the authoritative insured-person inputs.
- `absence-service` is product-neutral and records real-world absence facts before insurance classification.
- `ktg-case-service` and later `uvg-case-service` are product-bound services with explicit lifecycle rules.
- `benefit-engine-service` never owns master data. It creates versioned calculation snapshots from upstream effective-dated inputs.

## Tenant Isolation

- Every write model is tenant-scoped.
- Cross-tenant reads are forbidden in application code and reinforced in persistence.
- Integration credentials are isolated per tenant and connector.

## Data Residency And Sensitive Data

- Storage region must remain within Switzerland.
- AHV numbers and medical data are encrypted at rest.
- Sensitive access events are logged with actor, purpose, and correlation id.
- Case history is append-only from a business perspective even when operational corrections occur.

## Event Flow

1. HR/payroll connector ingests employee delta.
2. `people-service` validates, persists, and emits `employee.master-data.changed`.
3. Downstream services react:
   - `absence-service` updates display context.
   - `ktg-case-service` refreshes case prefill inputs.
   - `benefit-engine-service` invalidates calculation previews if salary basis changed.
4. Audit event and integration reconciliation status are stored for traceability.

## Phase 1 Delivery Principle

Each module is completed in this order:

1. Approved data model
2. PostgreSQL schema
3. OpenAPI contract
4. TypeScript business rules
5. UI wireframe specification
6. Integration mapping and test coverage definition
