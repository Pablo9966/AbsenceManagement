# Phase and Module Status
## elipsLife Absence Management Platform — As Built

This document maps what was built across each phase and module, distinguishing between implemented code, runnable code, and hardened/production-ready code.

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ Complete at repo scope | Code exists, logic is implemented, tests pass |
| ⚠️ Partial | Core logic exists, notable gaps remain |
| 🔧 Scaffolding only | Structure and types defined, minimal or no logic |
| ❌ Not built | Referenced in design docs, absent from code |
| 🚫 Not production-ready | Complete at repo scope but not deployable |

---

## Phase 1 — Core Domain Foundation

Phase 1 established the domain model, data schemas, API contracts, and business logic for the foundational services.

### Module 01 — Employee Master Data (`people-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-01-employee-master-data.md` |
| PostgreSQL schema | ✅ | 290-line schema, largest in repo |
| OpenAPI contract | ✅ | `services/people-service/openapi.yaml` |
| Domain types | ✅ | Employee, EmploymentContract, SalaryRecord, CoverageEligibility |
| Validation rules | ✅ | Full validation suite including overlap detection |
| Business formulas | ✅ | Employment percentage, insured salary preview |
| Application service | ✅ | EmployeeMasterDataService class |
| HTTP server | ❌ | Not built |
| Repository adapter | ❌ | No in-memory or DB adapter in this service |
| Tests | ❌ | No tests in this service |
| **Overall** | **⚠️ Domain complete, not runnable** | |

**Gap:** `people-service` is the least integrated service — it is not referenced in the portal-workflow-service demo wiring either. It has no practical runtime presence.

---

### Module 02 — Absence Recording (`absence-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-02-absence-recording.md` |
| PostgreSQL schema | ✅ | Full multi-table schema |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | AbsenceEpisode, DailyRecord, StatusEvent, Comment, RecurrenceGroup |
| Validation rules | ✅ | Status transitions, conflict detection, comment validation |
| Business formulas | ✅ | Timeline builder, Bradford Factor, day equivalent |
| Application service | ✅ | AbsenceRecordingService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | Used by demo wiring |
| Tests | ⚠️ | Covered indirectly through 2B, 2D, 2H smoke/integration tests |
| **Overall** | **⚠️ Domain complete, runs only in-process** | |

---

### Module 03 — KTG Case Management (`ktg-case-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-03-ktg-case-management.md` |
| PostgreSQL schema | ✅ | |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | KtgCase, Deadline, Task, Submission, Decision |
| Validation rules | ✅ | |
| Business formulas | ✅ | Deadline calculation, submission readiness, suggestion evaluation |
| Application service | ✅ | KtgCaseService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| task-deadline-service integration | ❌ | task-deadline-service does not exist |
| Tests | ⚠️ | Covered indirectly through portal workflow tests |
| **Overall** | **⚠️ Domain complete, deadline escalation blocked** | |

---

### Module 04 — Document Management (`document-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-04-document-management.md` |
| PostgreSQL schema | ✅ | |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | DocumentRecord, MedicalCertificateFact, ExtractionJob, AccessEvent |
| Validation rules | ✅ | |
| Business formulas | ✅ | Coverage window, review required |
| Application service | ✅ | DocumentService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| Blob storage integration | ❌ | Only metadata modeled; no actual file storage |
| OCR integration | ❌ | Job model exists; no actual OCR backend |
| Encryption at rest | ❌ | Required by design; not implemented |
| Tests | ⚠️ | Covered indirectly through portal workflow tests |
| **Overall** | **⚠️ Domain complete, critical production features missing** | |

---

### Module 05A — Inbox and Notifications (`inbox-notification-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-05a-inbox-notification.md` |
| PostgreSQL schema | ✅ | |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | InboxItem, NotificationDelivery, Template, Preference, Suppression |
| Validation rules | ✅ | |
| Business formulas | ✅ | Overdue detection, suppression |
| Application service | ✅ | InboxNotificationService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| Email delivery | ❌ | Not implemented |
| Push notifications | ❌ | Not implemented |
| Tests | 🔧 | Minimal coverage |
| **Overall** | **🔧 Scaffolding-plus, delivery mechanism absent** | |

---

### Module 05B — Dashboard Projections (`dashboard-projection-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-05b-dashboard-projection.md` |
| PostgreSQL schema | ✅ | |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | KPI snapshots, widget projections, analytics extensions (Phase 2G) |
| Application service | ✅ | DashboardProjectionService class |
| HTTP server | ⚠️ | Exists but only serves `GET /health` — no data endpoints |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| Real projection pipeline | ❌ | No event-driven projection refresh |
| Tests | ⚠️ | Health check covered in 2H integration test |
| **Overall** | **⚠️ Server is a stub; analytics live in portal-workflow** | |

---

### Module 06 — Claims Intake Workspace (`claims-intake-workspace-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-06-claims-intake-workspace.md` |
| PostgreSQL schema | ✅ | |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | IntakeCaseWorkspace, Checklist, MissingInfoRequest, QueueEntry, Decision |
| Validation rules | ✅ | |
| Business formulas | ✅ | Blocked/ready calculations, overdue detection |
| Application service | ✅ | ClaimsIntakeWorkspaceService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| Tests | ⚠️ | Covered through internal portal route tests |
| **Overall** | **⚠️ Domain complete, not runnable** | |

---

### Module 07 — Benefit Engine (`benefit-engine-service`)

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-1/module-07-benefit-engine.md` |
| PostgreSQL schema | ✅ | 249-line schema |
| OpenAPI contract | ✅ | |
| Domain types | ✅ | BenefitCaseCalculation, InsuredSalary, EntitlementPeriod, DayBreakdown, PaymentInstruction, Taggelddispositiv |
| Validation rules | ✅ | |
| Business formulas | ✅ | Daily allowance rate, insured salary, coordination window, payment routing |
| Application service | ✅ | BenefitEngineService class |
| HTTP server | ❌ | Not built |
| In-memory adapter | ✅ (in portal-workflow-service only) | |
| Actuarial formula validation | ❌ | Formulas not independently validated against Swiss KTG regulation |
| Tests | ⚠️ | Covered through 2H integration test (benefit detail read) |
| **Overall** | **⚠️ Domain complete, formulas unvalidated, not runnable** | |

---

## Phase 2A — Identity and Access Foundation

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2a-identity-access.md` |
| identity-access-service HTTP runtime | ✅ | Port 4010, file-backed persistence |
| Sign-in and session bootstrap | ✅ | |
| RBAC/ABAC permission evaluation | ✅ | |
| Tenant membership and role assignment | ✅ | |
| Onboarding workspace | ✅ | |
| Audit event logging | ✅ | |
| Access purpose records | ✅ | |
| identity-access-client package | ✅ | HTTP SDK published |
| Real password authentication | ❌ | Demo mode only |
| MFA | ❌ | Not implemented |
| SSO/SAML/OIDC | ❌ | Not implemented |
| JWT session tokens | ❌ | Tokens are plain UUIDs |
| Session enforcement in workflow layer | ❌ | Not wired |
| **Overall** | **⚠️ Core structure present, auth security absent** | |

---

## Phase 2A — Portal Shells

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2a-portal-shells.md` |
| employer-portal Next.js app | ✅ | Builds successfully |
| internal-portal Next.js app | ✅ | Builds successfully |
| employee-portal Next.js app | ✅ | Builds successfully |
| Shared frontend-platform package | ✅ | Shell, locale, navigation |
| de-CH localization | ✅ | Complete |
| en-CH localization | ✅ | Complete |
| fr-CH localization | ⚠️ | Structural placeholders only |
| it-CH localization | ⚠️ | Structural placeholders only |
| Accessibility (skip-to-content, ARIA regions) | ✅ | Hardened in Phase 2H |
| Real auth guard on portal pages | ❌ | Not implemented |
| Browser testing | ❌ | No Playwright or Cypress |
| **Overall** | **⚠️ Portals build and have routes; not browser-tested** | |

---

## Phase 2B — Core Product Workflow

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2b-core-product.md` |
| portal-workflow-service HTTP runtime | ✅ | Port 4020 |
| Employer absence, case, document, task routes | ✅ | Implemented in service-context |
| Internal case, intake, benefit routes | ✅ | Implemented in service-context |
| Employee dashboard, absence, document routes | ✅ | Implemented in service-context |
| Employee self-service (report absence, upload cert, RTW) | ✅ | |
| portal-workflow-client package | ✅ | Type contracts published |
| Smoke tests | ✅ | `tests/phase-2b.smoke.test.mjs` (77 lines) |
| Live service-to-service HTTP calls | ❌ | All in-process demo wiring |
| Real tenant isolation enforcement | ❌ | tenantId accepted as parameter, not validated from session |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2C — Payment Operations

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2c-payment-operations.md` |
| payment-operations-service HTTP runtime | ✅ | Port 4030, file-backed |
| Payment run lifecycle | ✅ | |
| Export packages | ✅ | |
| Statements and reconciliation | ✅ | |
| Settlement summaries | ✅ | |
| Payroll booking confirmation | ✅ | |
| Audit trail | ✅ | |
| Portal visibility via portal-workflow-service | ✅ | |
| Smoke tests | ✅ | `tests/phase-2c.smoke.test.mjs` (180 lines) |
| Real bank/ISO 20022 integration | ❌ | Data model only |
| PostgreSQL persistence | ❌ | File-backed only |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2D — Employee Self-Service

| Deliverable | Status | Notes |
|---|---|---|
| Employee portal routes | ✅ | report-absence, upload-certificate, return-to-work |
| Employee workflow routes in portal-workflow-service | ✅ | |
| Smoke tests | ✅ | `tests/phase-2d.smoke.test.mjs` (133 lines) |
| Real auth guard for employee routes | ❌ | |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2E — UVG Native Flow

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2e-uvg-native-flow.md` |
| uvg-case-service HTTP runtime | ✅ | Port 4040, in-memory |
| BU/NBU accident reports | ✅ | |
| Case lifecycle, injury, circumstance | ✅ | |
| KTG/UVG coordination | ✅ | |
| Decisions and document linking | ✅ | |
| Accident report artifact generation | ✅ | |
| Portal UVG routes via portal-workflow-service | ✅ | |
| Smoke tests | ✅ | `tests/phase-2e.smoke.test.mjs` (319 lines) |
| Persistent storage | ❌ | Pure in-memory |
| SUVA interface integration | ❌ | |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2F — Premium Reconciliation

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2f-premium-reconciliation.md` |
| premium-reconciliation-service HTTP runtime | ✅ | Port 4050, file-backed |
| Salary mass submission | ✅ | |
| Premium exposure snapshots | ✅ | |
| Claims ratio calculation | ✅ | |
| Adjustment recommendations (refund/invoice/carry-forward) | ✅ | |
| Installment plans | ✅ | |
| Employer dashboard read model | ✅ | |
| Portal premium routes via portal-workflow-service | ✅ | |
| Smoke tests | ✅ | `tests/phase-2f.smoke.test.mjs` (240 lines) |
| Actuarial validation of premium formulas | ❌ | Not documented |
| PostgreSQL persistence | ❌ | File-backed only |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2G — Client Analytics

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2g-client-analytics.md` |
| Employer analytics dashboard types and projections | ✅ | In dashboard-projection-service domain |
| Refreshable analytics (trends, causes, costs, duration, RTW, heatmaps) | ✅ | |
| Analytics routes in portal-workflow-service | ✅ | `GET /v1/employer/analytics`, `POST /v1/employer/analytics/refresh` |
| analytics page in employer-portal | ✅ | `/[locale]/analytics` |
| Smoke tests | ✅ | `tests/phase-2g.smoke.test.mjs` (84 lines) |
| Real data pipeline from source services | ❌ | Projections computed from in-memory demo data |
| dashboard-projection-service data endpoints | ❌ | Service only serves `/health` |
| **Overall** | **✅ at repo scope, 🚫 not production-ready** | |

---

## Phase 2H — Hardening and Release Readiness

| Deliverable | Status | Notes |
|---|---|---|
| Design documentation | ✅ | `docs/phase-2/module-2h-hardening-release-readiness.md` |
| runtime-baseline package | ✅ | Health, request IDs, logging, error envelopes |
| Health endpoints on all running services | ✅ | |
| Structured JSON logging | ✅ | |
| Standardized error envelopes | ✅ | |
| Migration validation tool | ✅ | `tools/migrations.mjs` validate + plan commands |
| Integration test suite | ✅ | `tests/phase-2h.integration.test.mjs` (279 lines) |
| Accessibility hardening | ✅ | Skip-to-content, ARIA, semantic structure |
| de-CH and en-CH localization completeness | ✅ | |
| fr-CH and it-CH localization | ⚠️ | Structural fallback only |
| Linter configuration | ❌ | Explicitly "pending" in package.json |
| CI/CD pipeline | ❌ | Not built |
| Production infrastructure | ❌ | No Dockerfiles, no manifests |
| Real database connectivity | ❌ | Not implemented |
| **Overall** | **⚠️ Repo-level hardening done; production gap remains large** | |

---

## Missing Phases / Services

The following were specified in the architecture but do not exist in the repository:

| Component | Status | Notes |
|---|---|---|
| `task-deadline-service` | ❌ Not built | Required for Karenzfrist, certificate expiry, escalation |
| `integration-gateway` | ❌ Not built | Required for HR/payroll connectors, PAS sync, webhook ingestion |
| Database migration runner | ❌ Not built | Only a validator exists; no execution framework |
| Deployment configuration | ❌ Not built | No Docker, no Kubernetes, no CI/CD |
| MFA implementation | ❌ Not built | Referenced in Phase 2A design |
| SSO/SAML/OIDC integration | ❌ Not built | Referenced in Phase 2A design |
