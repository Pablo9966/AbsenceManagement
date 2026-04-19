# Management Summary
## elipsLife Absence Management Platform — Current State as of April 2026

---

### What This Platform Is

The elipsLife Absence Management Platform is a multi-tenant, Swiss-hosted software system for managing employee absences and their associated insurance workflows (KTG — Krankentaggeld, and UVG — Unfallversicherung). It is designed to serve three user groups: employers (HR managers, payroll), internal elipsLife operations teams (claims handlers, actuaries), and employees (self-service).

The system is being built in a TypeScript monorepo containing three browser-facing portals (employer, internal, employee), thirteen backend services, and four shared library packages.

---

### What Has Been Built

The repository contains meaningful, working code across multiple capability areas. The following is an honest assessment of what exists.

#### Fully Operational at Repo Scope

| Capability | What Exists |
|---|---|
| Identity and access management | Running HTTP service with sign-in, session bootstrap, RBAC/ABAC permission evaluation, tenant membership, audit events |
| Employer portal browser application | Full Next.js application with routes for absences, cases, documents, analytics, payments, premium, tasks, and UVG cases |
| Internal portal browser application | Full Next.js application with routes for claims intake, KTG/UVG cases, benefits, payment runs, month-end, and compliance |
| Employee portal browser application | Full Next.js application with routes for self-service absence reporting, dashboard, documents, and return-to-work |
| Portal workflow orchestration | Central service that wires all portal routes together, handling employer, internal, and employee workflows |
| Payment operations | Running HTTP service for payment runs, exports, reconciliation, settlement summaries, payroll booking confirmation |
| UVG accident case management | Running HTTP service for UVG accident reports, case lifecycle, injury/circumstance capture, and audit trail |
| Premium reconciliation | Running HTTP service for salary mass reports, premium exposure, claims ratio, adjustment calculation, and installment plans |
| Client analytics dashboards | Employer-facing analytics projections covering trends, causes, costs, duration, and return-to-work outcomes |
| Shared runtime infrastructure | Standardized health endpoints, request/correlation IDs, structured logging, and error envelopes across all running services |

#### Implemented as Domain Foundations Only (Not Yet Running as Services)

Seven Phase 1 services exist as complete domain implementations — their data models, validation rules, business formulas, SQL database schemas, and OpenAPI contracts are all defined. However, these services do **not** have running HTTP servers, and their logic is currently only accessible through an in-memory demo wiring layer inside the portal workflow service.

These services are: **people-service** (employee master data), **absence-service** (absence recording), **ktg-case-service** (KTG case management), **document-service** (medical documents), **inbox-notification-service** (notifications), **dashboard-projection-service** (KPI snapshots), **claims-intake-workspace-service** (claims handler workspace), and **benefit-engine-service** (daily allowance calculations).

---

### What Can Be Demonstrated Today

The following can be demonstrated using the current codebase:

- All three portals can be built and their page structures browsed in a browser
- The portal workflow service can be started and will respond to route requests for employer, internal, and employee workflows using seeded demonstration data
- The identity service can be started and will perform sign-in, session bootstrap, and permission evaluation against demonstration users
- The payment, UVG, and premium services can be started and will process real commands (payment run creation, UVG accident report, salary mass submission) with persistence to local JSON files
- Analytics dashboards for the employer portal refresh and return structured projections
- All smoke and integration tests pass

---

### What Is Not Production-Ready

The following gaps prevent production deployment without additional engineering work:

1. **No live PostgreSQL integration.** Every service that should use a real database is either operating on in-memory data or local JSON files. No service connects to a PostgreSQL database in production mode.

2. **No real authentication.** The identity service provides session tokens and permission evaluation, but there is no enforcement of those tokens at the portal or workflow layer. Any user can call any endpoint. There is no middleware enforcing authentication in the portal workflow service or the other running services.

3. **Seven core domain services have no HTTP runtime.** The people, absence, KTG, document, inbox, dashboard, claims workspace, and benefit engine services cannot be deployed independently. Their business logic is only accessible through the portal workflow service's demo wiring.

4. **Portal workflow service uses in-memory demo data.** The workflow orchestration layer currently operates on hard-coded seed data, not live data from real service instances. In production, it must instead talk to real, deployed service instances over the network.

5. **No infrastructure configuration.** There are no Dockerfiles, Kubernetes manifests, CI/CD pipeline definitions, environment variable management, secret management, or deployment scripts.

6. **No linter, no formatting enforcement.** The linting step is explicitly marked as "configuration pending" in the root package.json.

7. **Two architecture-specified services are absent from the repository.** The `task-deadline-service` (Karenzfrist management, certificate expiry tasks) and `integration-gateway` (HR/payroll connectors, PAS sync) are referenced in the architecture documentation but do not exist in code.

8. **Localization is incomplete.** German (de-CH) and English (en-CH) have complete copy. French (fr-CH) and Italian (it-CH) have structural placeholders only.

9. **No operational tooling.** There are no runbooks, no alerting configuration, no log aggregation setup, and no deployment runbooks.

---

### Key Risks and Gaps for Planning

| Risk | Severity | Notes |
|---|---|---|
| No production database wiring | Critical | All seven Phase 1 services and the portal workflow layer must be re-wired to PostgreSQL |
| No authentication enforcement | Critical | Any request to any endpoint is currently accepted without a valid session |
| Portal workflow service is a monolith | High | Currently one process handles all portal logic by importing all service modules in-process; must be decomposed for production |
| Two services do not exist | High | task-deadline-service and integration-gateway must be built from scratch |
| No deployment infrastructure | High | Nothing can be deployed to any cloud or server without significant infrastructure work |
| Demo data as operational data | High | Smoke and integration tests validate behavior against seeded demo data, not real production data flows |
| Partial localization | Medium | FR and IT portal users will see English fallback text |
| No e2e browser testing | Medium | No Playwright or Cypress tests; UI has never been tested in an actual browser automatically |

---

### What Company Engineers Need to Finish

The following work must be completed by the internal engineering team before the platform can be used in production:

1. Wire all seven skeleton services to real PostgreSQL, implement repository adapters, and start them as independent HTTP services
2. Build proper authentication middleware that enforces session tokens and permissions at the network boundary
3. Replace the portal workflow service's demo wiring with live HTTP calls to deployed service instances
4. Build the task-deadline-service (Karenzfrist thresholds, certificate expiry, escalation)
5. Build the integration-gateway (HR/payroll connector, PAS sync, webhook ingestion)
6. Create Dockerfiles and deployment configuration for all services
7. Set up CI/CD pipelines, secret management, and environment configuration
8. Complete French and Italian localization
9. Perform real browser testing of all three portals
10. Implement MFA and proper SSO integration in the identity service
11. Add rate limiting, CORS policy, and API gateway configuration
12. Create operational runbooks, monitoring dashboards, and alerting

---

### Summary Assessment

The repository represents a solid, well-structured foundation with meaningful business logic and domain modeling. The portal applications are structurally complete and buildable. Six services have working HTTP runtimes. The domain logic across all thirteen services is implemented and tested at the unit/smoke level.

However, the system is not production-deployable in its current state. The gap between "implemented at repo scope" and "production-ready" is substantial, primarily because live persistence is absent, authentication is not enforced, and several critical services either do not exist or cannot run independently.

A realistic estimate for production readiness would require dedicated engineering effort focused on infrastructure, database wiring, authentication hardening, and the two missing services, before any of the existing capability can be trusted with real data.
