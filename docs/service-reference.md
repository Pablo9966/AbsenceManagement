# Service and Application Reference
## elipsLife Absence Management Platform — As Built

---

## Services

---

### `people-service`

**Purpose:** Employee master data — the authoritative source for insured persons, employment contracts, salary history, and policy eligibility.

**Current Responsibility:** Domain model and business logic only. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — Employee, EmploymentContract, SalaryRecord, CoverageEligibility, MasterDataChangeEvent
- `src/domain/validations.ts` — validateEmployee, validateEmployeePatch, validateEmploymentContract, validateSalaryRecord, validateNoOverlappingRanges
- `src/domain/formulas.ts` — buildEmploymentWarnings, calculateAggregateEmploymentPercentage, calculateInsuredSalaryPreview
- `src/application/employee-master-data.service.ts` — EmployeeMasterDataService class
- `db/001_init_people_service.sql` — full PostgreSQL schema (290 lines, largest schema in the repo)
- `openapi.yaml` — full API contract

**Runtime/API Presence:** None. No server.ts. Cannot be deployed.

**Persistence Mode:** SQL schema defined. No runtime persistence. Not wired to PostgreSQL.

**Dependencies:** None (standalone domain service).

**Major Workflows Supported (at domain level):**
- Create and update employee profiles
- Record salary history with effective dating
- Evaluate coverage eligibility
- Calculate aggregate employment percentage across multiple contracts
- Preview insured salary basis for benefit calculation

**Note on `package.json`:** This service's package.json does not define `main`, `types`, or `exports` fields, unlike all other services. It is structurally the least complete package configuration in the repository.

**Limitations / Debt:**
- No HTTP server
- No repository adapter (no in-memory or file-backed implementation)
- Not imported by the portal-workflow-service demo wiring (only PeopleService type shapes are referenced indirectly)
- Cannot be run, tested over HTTP, or observed at runtime

---

### `absence-service`

**Purpose:** Absence recording and tracking — the product-neutral source of truth for absence episodes, daily records, and recurrence groups.

**Current Responsibility:** Domain model, validation rules, and business logic. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — AbsenceEpisode, AbsenceDailyRecord, AbsenceStatusEvent, AbsenceComment, AbsenceContractImpact, AbsenceRecurrenceGroup
- `src/domain/validations.ts` — validateAbsenceEpisode, validateStatusTransition, validateNoConflictingDailyRecord, etc.
- `src/domain/formulas.ts` — buildAbsenceTimeline, calculateAbsenceDayEquivalent, calculateBradfordFactor
- `src/application/absence-recording.service.ts` — AbsenceRecordingService class
- `db/001_init_absence_service.sql` — PostgreSQL schema
- `openapi.yaml` — full API contract

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Dependencies:** None (product-neutral).

**Major Workflows Supported (at domain level):**
- Record and update absence episodes with status transitions
- Attach daily records, contract impacts, and status events
- Build absence timelines for display
- Calculate Bradford Factor for HR reporting
- Group absence episodes into recurrence groups

**Limitations / Debt:**
- No HTTP server — must run through portal-workflow-service in-process
- AbsenceRepository implementation exists only in portal-workflow-service/adapters/memory-repositories.ts (in-memory, resets on restart)
- Bradford Factor calculation is domain-complete but cannot be called independently

---

### `ktg-case-service`

**Purpose:** KTG (Krankentaggeld) case lifecycle management — registration, deadline tracking, submission readiness, and relapse linking.

**Current Responsibility:** Domain model, validation rules, and business logic. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — KtgCase, KtgDeadline, KtgTask, KtgCaseSuggestion, KtgCaseDecision, KtgCaseSubmission, KtgCaseStatus
- `src/domain/validations.ts` — validateKtgCase, validateKtgCaseDecision, validateKtgCaseAbsenceLink, etc.
- `src/domain/formulas.ts` — calculateDeadlineDueAt, calculateFirstPayableDay, calculateSubmissionReadiness, evaluateKtgCaseSuggestion
- `src/application/ktg-case.service.ts` — KtgCaseService class
- `db/001_init_ktg_case_service.sql` — PostgreSQL schema
- `openapi.yaml` — full API contract

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Major Workflows Supported (at domain level):**
- Create and progress KTG case lifecycle (open → in_review → submitted → closed)
- Calculate Karenzfrist deadline (note: task-deadline-service for escalation is not built)
- Evaluate submission readiness
- Link KTG cases to absence episodes
- Record coverage snapshots

**Limitations / Debt:**
- No HTTP server
- Deadline escalation and reminder workflows depend on task-deadline-service, which does not exist
- No relapse linking implementation is visible in the in-memory demo wiring
- KTG case portal routes are currently composed from in-memory demo data

---

### `document-service`

**Purpose:** Medical document management — encrypted storage references, OCR extraction jobs, certificate coverage windows, and access logging.

**Current Responsibility:** Domain model, validation rules, and business logic. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — DocumentRecord, DocumentVersion, MedicalCertificateFact, DocumentExtractionJob, DocumentAccessEvent, DocumentConsentReference
- `src/domain/validations.ts` — validateDocumentRecord, validateDocumentExtractionJob, validateDocumentAccessEvent, etc.
- `src/domain/formulas.ts` — calculateCertificateCoverageWindow, calculateReviewRequired
- `src/application/document.service.ts` — DocumentService class
- `db/001_init_document_service.sql` — PostgreSQL schema
- `openapi.yaml` — full API contract

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Major Workflows Supported (at domain level):**
- Register document records with metadata
- Track OCR extraction job status
- Calculate certificate coverage windows
- Log access events with actor and purpose
- Manage consent references for data access

**Limitations / Debt:**
- No HTTP server
- Actual file/blob storage (S3, Azure Blob, etc.) is not modeled — only metadata references
- OCR extraction is modeled but no actual OCR integration exists
- AHV number and sensitive field encryption is documented as a requirement but not implemented in domain code
- Employee certificate uploads in the demo flow create document references without real file persistence

---

### `inbox-notification-service`

**Purpose:** In-app inbox, notification preferences, delivery suppression, and notification templates.

**Current Responsibility:** Domain model, validation rules, and business logic. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — InboxItem, NotificationDelivery, NotificationTemplate, NotificationPreference, DeliverySuppression
- `src/domain/validations.ts` — validateInboxItem, validateNotificationDelivery, validateNotificationPreference, etc.
- `src/domain/formulas.ts` — calculateInboxItemOverdue, calculateNotificationSuppressed
- `src/application/inbox-notification.service.ts` — InboxNotificationService class
- `db/001_init_inbox_notification_service.sql` — PostgreSQL schema

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Major Workflows Supported (at domain level):**
- Create and assign inbox items
- Track notification delivery status
- Apply delivery suppression rules
- Manage per-user notification preferences
- Resolve notification templates

**Limitations / Debt:**
- No HTTP server
- Email delivery and push notification integrations are not implemented
- No evidence that the inbox items from the in-memory demo wiring are populated with realistic data
- "Pending tasks" shown in portal routes draw from in-memory demo data, not from a real inbox

---

### `dashboard-projection-service`

**Purpose:** Phase 1 role: KPI snapshots and widget projections for the employer and internal dashboards. Phase 2G extension: employer-facing analytics projections.

**Current Responsibility:** Phase 1 — domain only (no runtime data endpoints). Phase 2G analytics are exposed through portal-workflow-service, not through this service's own HTTP server.

**Key Files:**
- `src/domain/types.ts` — DashboardKpiSnapshot, DashboardWidgetSnapshot, analytics projection types (Phase 2G)
- `src/application/dashboard-projection.service.ts` — DashboardProjectionService class
- `src/server.ts` — HTTP server exists but only exposes `GET /health`; no data endpoints
- `db/001_init_dashboard_projection_service.sql` — PostgreSQL schema

**Runtime/API Presence:** HTTP server on port 4060. Only endpoint: `GET /health`. No data endpoints are implemented directly on this service.

**Persistence Mode:** Health response states `"persistenceMode": "embedded-projection-repository"` but this is informational only. Actual analytics projections are handled inside portal-workflow-service.

**Major Workflows Supported:**
- Employer analytics dashboard refresh and read (Phase 2G) — via portal-workflow-service, not this service
- Dashboard KPI snapshots — domain only

**Limitations / Debt:**
- The service has a running HTTP server but serves no data
- All analytics functionality lives inside the portal-workflow-service's in-process wiring
- The server.ts file is essentially a health-check stub with a documented note that "analyticsExposure: portal-workflow-service"
- Must be given real endpoints and real projection storage before it can serve as an independent analytics backend

---

### `claims-intake-workspace-service`

**Purpose:** Internal claims handler workspace — checklist management, missing-information request tracking, handler queue projection, evidence references, and decision recommendations.

**Current Responsibility:** Domain model, validation rules, and business logic. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — IntakeCaseWorkspace, IntakeChecklistItem, MissingInformationRequest, HandlerWorkQueueEntry, WorkspaceNote, WorkspaceEvidenceReference, IntakeDecisionRecommendation
- `src/domain/validations.ts` — validateIntakeCaseWorkspace, validateChecklistItem, validateEvidenceReference, etc.
- `src/domain/formulas.ts` — calculateQueueEntryOverdue, calculateWorkspaceBlocked, calculateWorkspaceReadyForReview
- `src/application/claims-intake-workspace.service.ts` — ClaimsIntakeWorkspaceService class
- `db/001_init_claims_intake_workspace_service.sql` — PostgreSQL schema

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Major Workflows Supported (at domain level):**
- Create and manage intake case workspaces
- Track checklist items and mark them complete
- Manage missing-information requests
- Queue handler work entries and track overdue items
- Record workspace notes and evidence references
- Generate decision recommendations

**Limitations / Debt:**
- No HTTP server
- Handler queue projection is an in-memory construct — no event-driven refresh mechanism exists
- Decision recommendation logic is domain-defined but not integrated with real case outcomes

---

### `benefit-engine-service`

**Purpose:** Taggeld (daily allowance) calculation engine — insured salary snapshots, entitlement periods, day breakdowns, coordination windows (KTG/UVG/AHV), and payment instruction generation.

**Current Responsibility:** Domain model, validation rules, and calculation formulas. No HTTP runtime.

**Key Files:**
- `src/domain/types.ts` — BenefitCaseCalculation, InsuredSalarySnapshot, BenefitEntitlementPeriod, BenefitDayBreakdown, CoordinationWindow, PaymentInstruction, TaggelddispositivSnapshot
- `src/domain/validations.ts` — validateBenefitCaseCalculation, validateBenefitDayBreakdown, etc.
- `src/domain/formulas.ts` — calculateDailyAllowanceRate, calculateInsuredSalary, calculatePaymentRouting, calculatePeriodPayableAmount, calculateCalculationMutable
- `src/application/benefit-engine.service.ts` — BenefitEngineService class
- `db/001_init_benefit_engine_service.sql` — PostgreSQL schema (249 lines, second largest)

**Runtime/API Presence:** None.

**Persistence Mode:** SQL schema defined. In-memory repository adapter exists inside portal-workflow-service only.

**Major Workflows Supported (at domain level):**
- Create versioned calculation snapshots from salary and absence inputs
- Compute daily allowance rates for KTG
- Coordinate with UVG/AHV windows to avoid double payment
- Break down entitlement periods by day
- Generate payment instruction outputs (Taggeld disposition)

**Limitations / Debt:**
- No HTTP server — the most complex domain logic in the system runs only in-process via demo wiring
- `calculateDailyAllowanceRate` and related formulas have never been exercised against real Swiss regulatory cases in an automated test
- No actuarial review of formula correctness is documented
- Taggelddispositiv (SUVA form) generation is modeled but artifact generation details are partial

---

### `identity-access-service`

**Purpose:** Platform identity — user authentication, session management, tenant membership, RBAC/ABAC permission evaluation, provisioning invites, onboarding workspace, SSO configuration, and audit event logging.

**Current Responsibility:** Full working HTTP service with sign-in, session management, and permission APIs.

**Key Files:**
- `src/server.ts` — HTTP server on port 4010
- `src/application/identity-access.service.ts` — IdentityAccessService class
- `src/domain/types.ts` — PlatformUser, TenantMembership, RoleAssignment, AccessPurposeRecord, SessionBootstrap, AuditAccessPolicy
- `src/adapters/persistence/file-backed.repository.js` — FileBackedIdentityAccessRepositoryAdapter (JSON file persistence)
- `src/bootstrap/reference-data.ts` — Demo permission sets for employer and internal portals
- `src/testing/demo-context.ts` — Demo users and tenant fixtures
- `db/001_init_identity_access_service.sql` — PostgreSQL schema
- `openapi.yaml` — full API contract

**Runtime/API Presence:** HTTP server on port 4010. Endpoints:
- `POST /v1/session/sign-in`
- `POST /v1/session/bootstrap`
- `GET /v1/tenants/:tenantId/memberships`
- `GET /v1/tenants/:tenantId/users/:userId/roles`
- `GET /v1/tenants/:tenantId/invites`
- `GET /v1/tenants/:tenantId/onboarding`
- `GET /v1/tenants/:tenantId/onboarding/readiness`
- `GET /v1/tenants/:tenantId/audit/policies`
- `GET /v1/tenants/:tenantId/audit/events`
- `GET /v1/tenants/:tenantId/access/purposes`
- `POST /v1/tenants/:tenantId/access/evaluate`
- `GET /health`

**Persistence Mode:** File-backed JSON via `.data/identity-access-state.json`. Session state persists across service restarts within a local run. SQL schema is defined but not used.

**Major Workflows Supported:**
- Sign-in with email and tenantId (demo mode, no real password check)
- Session bootstrap with permission evaluation for portal routes
- Tenant membership and role assignment queries
- Onboarding workspace state and readiness evaluation
- Audit access policy and event queries
- ABAC purpose record queries

**Limitations / Debt:**
- Sign-in does not verify passwords — any email submits successfully for demo tenants
- No MFA implementation
- No real SSO/SAML/OIDC integration
- Session tokens are UUIDs without cryptographic signing (no JWT)
- Session enforcement is not propagated to portal-workflow-service (no middleware)
- File-backed persistence is not appropriate for production scale
- Bootstrap permission sets are hardcoded reference data, not dynamically configured

---

### `payment-operations-service`

**Purpose:** Payment operations — payment run creation, export packages (ISO 20022 / CSV), reconciliation, settlement summaries, statement generation, payroll booking confirmation, and audit trail.

**Current Responsibility:** Full working HTTP service with complete payment lifecycle operations.

**Key Files:**
- `src/server.ts` — HTTP server on port 4030
- `src/application/payment-operations.service.ts` — PaymentOperationsService class
- `src/domain/types.ts` — PaymentRun, PaymentInstruction, PaymentExportPackage, PaymentReconciliationRecord, CaseSettlementSummary, TaggelddispositivData
- `src/adapters/persistence/file-backed.repository.js` — FileBackedPaymentOperationsRepositoryAdapter
- `src/bootstrap/reference-data.ts` — INTERNAL_TENANT_ID fixture
- `db/001_init_payment_operations_service.sql` — PostgreSQL schema

**Runtime/API Presence:** HTTP server on port 4030. Full REST API for payment run lifecycle and reporting.

**Persistence Mode:** File-backed JSON via `.data/payment-operations-state.json`. Persists across restarts locally. SQL schema defined but not used.

**Major Workflows Supported:**
- Create and manage payment runs
- Generate payment export packages
- Submit and retrieve payment statements
- Record reconciliation status
- Generate settlement summaries
- Record payroll booking confirmations
- Query audit events

**Limitations / Debt:**
- File-backed persistence is not production-appropriate
- No real bank/ISO 20022 integration — exports generate structured data but no actual financial file transmission
- Payment run status transitions are not connected to real KTG/UVG case status updates
- No real-time reconciliation against external payment systems
- tenantId is largely fixed to INTERNAL_TENANT_ID in demo mode

---

### `uvg-case-service`

**Purpose:** UVG (Unfallversicherungsgesetz) accident case lifecycle — accident reports (BU/NBU), case progression, injury and circumstance capture, coordination with KTG, decisions, document linking, and audit trail.

**Current Responsibility:** Full working HTTP service with complete UVG case lifecycle management.

**Key Files:**
- `src/server.ts` — HTTP server on port 4040
- `src/application/uvg-case.service.ts` — UvgCaseService class
- `src/adapters/memory-repository.ts` — UvgCaseMemoryRepository (in-memory)
- `src/domain/types.ts` — UvgCase, UvgInjury, UvgCircumstance, UvgCoordination, UvgDecision, UvgDocument
- `db/001_init_uvg_case_service.sql` — PostgreSQL schema

**Runtime/API Presence:** HTTP server on port 4040. Full REST API for UVG case operations.

**Persistence Mode:** Pure in-memory. All data is lost on service restart. SQL schema is defined but not used.

**Major Workflows Supported:**
- Submit UVG accident report (BU — Berufsunfall, NBU — Nichtberufsunfall)
- Progress UVG case lifecycle
- Record injuries and accident circumstances
- Manage KTG/UVG coordination status
- Link documents to cases
- Record UVG decisions
- Generate accident report artifacts
- Query audit events

**Limitations / Debt:**
- Pure in-memory persistence — all data is lost on restart; entirely unsuitable for production
- No file-backed fallback unlike payment and premium services
- Actor context is read from HTTP headers (`x-actor-id`, `x-actor-role`) without any authentication enforcement
- SUVA notification generation is modeled but actual SUVA interface is not integrated

---

### `premium-reconciliation-service`

**Purpose:** Employer finance reconciliation — salary mass submission, premium exposure snapshots, claims ratio calculation, premium adjustment recommendations (refund/additional invoice/carry-forward), installment plan management, and employer dashboard read models.

**Current Responsibility:** Full working HTTP service with complete premium reconciliation lifecycle.

**Key Files:**
- `src/server.ts` — HTTP server on port 4050
- `src/index.ts` — exports PremiumReconciliationService, PremiumReconciliationFileRepository, PremiumReconciliationMemoryRepository
- `src/application/premium-reconciliation.service.ts` — PremiumReconciliationService class
- `src/domain/types.ts` — PremiumReportingPeriod, SalaryMassSubmission, PremiumExposureSnapshot, ClaimsRatioView, PremiumAdjustmentRecommendation
- `db/001_init_premium_reconciliation_service.sql` — PostgreSQL schema

**Runtime/API Presence:** HTTP server on port 4050. Full REST API for premium reconciliation operations.

**Persistence Mode:** File-backed JSON via `.data/premium-reconciliation-state.json`. A `PremiumReconciliationMemoryRepository` also exists for testing and demo wiring.

**Major Workflows Supported:**
- Submit salary mass reports for premium periods
- Calculate premium exposure snapshots
- View claims ratios
- Calculate premium adjustments
- Generate settlement documents
- Create installment plans
- Employer dashboard read model for premium visibility

**Limitations / Debt:**
- File-backed persistence not appropriate for production
- Premium calculations use business formulas but have not been validated against actual Swiss insurance actuarial rules
- No real-time integration with insurer's premium billing system

---

### `portal-workflow-service`

**Purpose:** Central portal workflow orchestration facade. Handles all browser-facing route logic by composing multiple domain service operations and returning workflow-shaped responses including permission hints and navigation links.

**Current Responsibility:** The most operationally active service in the repository. Routes requests from all three portals through a single HTTP endpoint, composing domain service calls and returning structured responses with permissions and links.

**Key Files:**
- `src/server.ts` — HTTP server on port 4020, routes 50+ endpoints
- `src/service-context.ts` — exports all route handler functions (employer, internal, employee, analytics, payment, UVG, premium)
- `src/bootstrap/demo-wiring.ts` — wires all domain services to in-memory repositories
- `src/adapters/memory-repositories.ts` — in-memory repository implementations for all Phase 1 services
- `src/demo-data.ts` — seeded demonstration data
- `src/errors.ts` — WorkflowForbiddenError, WorkflowNotFoundError
- `src/testing/` — test helpers

**Runtime/API Presence:** HTTP server on port 4020. Major route groups:

*Employer routes:*
- `GET /v1/employer/dashboard`
- `GET /v1/employer/absences`, `GET /v1/employer/absences/:id`
- `GET /v1/employer/cases`, `GET /v1/employer/cases/:id`
- `GET /v1/employer/documents`
- `GET /v1/employer/payments`, `GET /v1/employer/payment-run-summaries`
- `GET /v1/employer/tasks`
- `GET /v1/employer/uvg-cases`, `GET /v1/employer/uvg-cases/:id`
- `POST /v1/employer/uvg-cases/accident-report`
- `POST /v1/employer/uvg-cases/:id/artifact`
- `GET /v1/employer/premium`, `POST /v1/employer/premium/salary-report`
- `POST /v1/employer/premium/adjustment`, `POST /v1/employer/premium/settlement`
- `POST /v1/employer/premium/installment-plan`
- `GET /v1/employer/analytics`, `POST /v1/employer/analytics/refresh`

*Internal routes:*
- `GET /v1/internal/dashboard`
- `GET /v1/internal/cases`, `GET /v1/internal/cases/:id`
- `GET /v1/internal/uvg-cases`, `GET /v1/internal/uvg-cases/:id`
- `PUT /v1/internal/uvg-cases/:id/status`, `POST /v1/internal/uvg-cases/:id/injury`
- `POST /v1/internal/uvg-cases/:id/circumstance`, `PUT /v1/internal/uvg-cases/:id/coordination`
- `POST /v1/internal/uvg-cases/:id/documents`, `PUT /v1/internal/uvg-cases/:id/decision`
- `GET /v1/internal/intake`, `GET /v1/internal/intake/:id`
- `GET /v1/internal/benefits`, `GET /v1/internal/benefits/:id`
- `GET /v1/internal/payment-runs`, `GET /v1/internal/payment-runs/:id`
- `GET /v1/internal/month-end`
- `GET /v1/internal/reconciliation`, `GET /v1/internal/settlement`
- `GET /v1/internal/payment-audit`

*Employee routes:*
- `GET /v1/employee/dashboard`
- `GET /v1/employee/absences`, `GET /v1/employee/absences/:id`
- `GET /v1/employee/documents`, `GET /v1/employee/documents/:id`
- `GET /v1/employee/status`
- `POST /v1/employee/report-absence`
- `POST /v1/employee/documents/upload`
- `GET /v1/employee/return-to-work`, `POST /v1/employee/return-to-work/confirm`

**Persistence Mode:** In-memory via demo-wiring. All data resets on restart.

**Limitations / Debt:**
- Monolithic in-process wiring; all services run in the same Node.js process
- No authentication enforcement on any route
- Demo data is fixed seed; not dynamically provisioned
- Locale parameter is accepted but copy is not fully translated
- Not suitable for production operation in current form

---

## Applications

---

### `apps/employer-portal`

**Purpose:** Browser application for employer users (HR managers, payroll, line managers).

**Stack:** Next.js 15.3.0, React 19.0.0, App Router.

**Routes (page files that exist):**
- `app/[locale]/` — root redirect
- `app/[locale]/absences/` — absence list and detail pages
- `app/[locale]/cases/` — KTG case list and detail pages
- `app/[locale]/documents/` — document list
- `app/[locale]/analytics/` — employer analytics dashboard
- `app/[locale]/payments/` — payment visibility
- `app/[locale]/premium/` — premium reconciliation dashboard
- `app/[locale]/tasks/` — pending task list
- `app/[locale]/uvg-cases/` — UVG case list and detail, accident report
- `app/[locale]/admin/` — onboarding and user management

**Dependencies:** `@elipslife/frontend-platform`, `@elipslife/identity-access-client`, `@elipslife/portal-workflow-client`

**Build Status:** Builds without errors (`next build`).

**Limitations / Debt:**
- No real data fetching — portal pages call portal-workflow-service endpoints but with demo session context
- No authentication guard on pages — any user can navigate to any route
- No browser-level testing (no Playwright or Cypress)
- Admin pages (onboarding, user management) rely on identity-access-service but session enforcement is not wired

---

### `apps/internal-portal`

**Purpose:** Browser application for internal elipsLife operations (claims handlers, actuaries, account managers, admins).

**Stack:** Next.js 15.3.0, React 19.0.0, App Router.

**Routes (page files that exist):**
- `app/[locale]/intake/` — claims intake workspace
- `app/[locale]/ktg-cases/` — KTG case management
- `app/[locale]/uvg-cases/` — UVG case management with detail and actions
- `app/[locale]/benefits/` — benefit calculation views
- `app/[locale]/payment-runs/` — payment run list and detail
- `app/[locale]/month-end/` — month-end reconciliation
- `app/[locale]/compliance/` — compliance views
- `app/[locale]/admin/` — admin management

**Dependencies:** `@elipslife/frontend-platform`, `@elipslife/identity-access-client`, `@elipslife/portal-workflow-client`

**Build Status:** Builds without errors (`next build`).

**Limitations / Debt:** Same as employer-portal — no real auth enforcement, no browser testing, data comes from demo wiring.

---

### `apps/employee-portal`

**Purpose:** Browser application for employee self-service.

**Stack:** Next.js 15.3.0, React 19.0.0, App Router.

**Routes (page files that exist):**
- `app/[locale]/dashboard/` — employee dashboard
- `app/[locale]/absences/` — absence list and detail
- `app/[locale]/documents/` — document list and detail
- `app/[locale]/report-absence/` — absence submission form
- `app/[locale]/upload-certificate/` — certificate upload
- `app/[locale]/return-to-work/` — RTW confirmation
- `app/[locale]/status/` — current status summary

**Dependencies:** `@elipslife/frontend-platform`, `@elipslife/identity-access-client`

**Note:** The employee portal does **not** import `@elipslife/portal-workflow-client`. It uses server actions (`actions.ts`, `actions.js`) for mutations. This is the only portal that uses Next.js server actions.

**Build Status:** Builds without errors (`next build`).

**Limitations / Debt:** Same as other portals, plus server actions are not covered by any test.

---

## Packages

---

### `packages/runtime-baseline`

**Purpose:** Shared HTTP runtime utilities for all running services.

**Exports:** `RuntimeRequestContext`, `RuntimeHealthPayload`, `RuntimeErrorPayload`, `HttpRuntimeError`, `createRuntimeRequestContext`, `writeHealth`, `writeJson`, `writeRuntimeError`, `handleRuntimeError`, `logRuntimeEvent`.

**Status:** Complete and stable. Used by all six running services.

---

### `packages/portal-workflow-client`

**Purpose:** TypeScript type contract for the portal-workflow-service API surface.

**Exports:** All DTO types (~60 interfaces), `PortalLocale`, `WorkflowResponse<T>`, `WorkflowMeta`, `WorkflowPermission`, `WorkflowLink`.

**Status:** Complete. Shared between portals and the workflow service.

---

### `packages/identity-access-client`

**Purpose:** HTTP client SDK for the identity-access-service.

**Exports:** `IdentityAccessClient` interface and concrete HTTP implementation.

**Status:** Complete. Used by all three portals.

---

### `packages/frontend-platform`

**Purpose:** Shared portal shell, locale helpers, navigation structure, and UI primitives.

**Status:** Source-only TypeScript library. Used by all three portals. Provides shared copy for `de-CH` and `en-CH`; structural fallbacks for `fr-CH` and `it-CH`.
