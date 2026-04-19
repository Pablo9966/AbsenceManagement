# Architecture Overview
## elipsLife Absence Management Platform — As Built

---

### 1. Monorepo Structure

The repository is a npm workspaces monorepo with three top-level workspace groups:

```
/
├── apps/               # Three Next.js portal applications
│   ├── employee-portal
│   ├── employer-portal
│   └── internal-portal
├── services/           # Thirteen TypeScript microservices
│   ├── absence-service
│   ├── benefit-engine-service
│   ├── claims-intake-workspace-service
│   ├── dashboard-projection-service
│   ├── document-service
│   ├── identity-access-service
│   ├── inbox-notification-service
│   ├── ktg-case-service
│   ├── payment-operations-service
│   ├── people-service
│   ├── portal-workflow-service
│   ├── premium-reconciliation-service
│   └── uvg-case-service
├── packages/           # Four shared library packages
│   ├── frontend-platform
│   ├── identity-access-client
│   ├── portal-workflow-client
│   └── runtime-baseline
├── docs/               # Design documentation (phase-1, phase-2)
├── tests/              # Smoke and integration test files
├── tools/              # Migration validation tooling
├── types/              # Shared TypeScript ambient declarations
└── tsconfig.base.json  # Root TypeScript project configuration
```

The build system is TypeScript's native project references (`tsc -b`). There is no bundler for the services; they run directly as ESM TypeScript via Node.js with `--experimental-transform-types`. The three portal apps use Next.js 15.3.0 for their own build.

TypeScript version: 6.0.3 (very recent, at the edge of current ecosystem compatibility).

---

### 2. Service Taxonomy

Services fall into two distinct tiers based on their current runtime state.

#### Tier 1: Running Services (6)

These services have `server.ts` files, expose HTTP endpoints, and can be started as independent processes.

| Service | Port | Persistence Mode | Role |
|---|---|---|---|
| identity-access-service | 4010 | File-backed JSON (+ SQL schema defined) | Authentication, sessions, RBAC/ABAC, audit |
| portal-workflow-service | 4020 | In-memory (demo wiring) | Central portal route orchestration facade |
| payment-operations-service | 4030 | File-backed JSON (+ SQL schema defined) | Payment runs, exports, reconciliation |
| uvg-case-service | 4040 | Pure in-memory | UVG accident case lifecycle |
| premium-reconciliation-service | 4050 | File-backed JSON | Premium reporting, salary mass, adjustments |
| dashboard-projection-service | 4060 | Health-only (no data endpoints) | Placeholder; analytics exposed via portal-workflow |

#### Tier 2: Domain Foundation Services (7)

These services have domain types, validation rules, business formulas, SQL schemas, and OpenAPI contracts. They do **not** have HTTP servers and cannot be run independently.

| Service | Domain Covered | HTTP Runtime |
|---|---|---|
| people-service | Employee master data, contracts, salary | None |
| absence-service | Absence episodes, daily records, Bradford Factor | None |
| ktg-case-service | KTG case lifecycle, deadlines, submissions | None |
| document-service | Medical certificates, OCR, access logging | None |
| inbox-notification-service | Notifications, preferences, templates | None |
| claims-intake-workspace-service | Claims handler workspace, checklists, queue | None |
| benefit-engine-service | Taggeld calculation, entitlement, payment routing | None |

The business logic from all seven Tier 2 services is currently **imported in-process** by the `portal-workflow-service` and executed against in-memory seeded repositories. This makes the portal routes functionally testable but does not constitute distributed service operation.

---

### 3. Frontend Applications

All three portals are built with Next.js 15.3.0 using the App Router pattern. They are structurally complete at the page level and buildable without errors.

#### Route Coverage

**employer-portal** (`apps/employer-portal`) provides:
- `/[locale]/` — redirect
- `/[locale]/absences` — absence list and detail
- `/[locale]/cases` — KTG case list and detail
- `/[locale]/documents` — document list
- `/[locale]/analytics` — employer analytics dashboard (Phase 2G)
- `/[locale]/payments` — payment visibility
- `/[locale]/premium` — premium reconciliation dashboard
- `/[locale]/tasks` — pending task list
- `/[locale]/uvg-cases` — UVG case list and detail
- `/[locale]/admin` — onboarding and user management

**internal-portal** (`apps/internal-portal`) provides:
- `/[locale]/intake` — claims intake workspace
- `/[locale]/ktg-cases` — KTG case management
- `/[locale]/uvg-cases` — UVG case management
- `/[locale]/benefits` — benefit calculation
- `/[locale]/payment-runs` — payment run management and detail
- `/[locale]/month-end` — month-end reconciliation
- `/[locale]/compliance` — compliance views
- `/[locale]/admin` — admin management

**employee-portal** (`apps/employee-portal`) provides:
- `/[locale]/dashboard` — employee dashboard
- `/[locale]/absences` — absence list and detail
- `/[locale]/documents` — document list and detail
- `/[locale]/report-absence` — absence submission form
- `/[locale]/upload-certificate` — certificate upload
- `/[locale]/return-to-work` — RTW confirmation
- `/[locale]/status` — current status summary

All portals support four locales in the route structure: `de-CH`, `en-CH`, `fr-CH`, `it-CH`. German and English have complete copy; French and Italian have structural fallback placeholders.

#### Frontend–Backend Connection

The portals connect to the backend exclusively through the `portal-workflow-service`. There are no direct service calls from portal code. The `portal-workflow-client` package provides the TypeScript contract types used by both the portals and the workflow service.

No portal has API route handlers (Next.js route handlers). All data flows through the workflow service HTTP endpoints.

**Critical limitation:** There is no authentication middleware in the portals or the workflow service. Session management from `identity-access-service` is not currently enforced at the API boundary during workflow requests.

---

### 4. Shared Packages

#### `packages/runtime-baseline`

The foundational HTTP runtime utility library used by all six running services. Provides:
- `RuntimeRequestContext` — per-request context with requestId, correlationId, method, path
- `createRuntimeRequestContext()` — constructs context from incoming request headers
- `writeHealth()` — standardized `GET /health` response format
- `writeJson()` — writes JSON responses with correct headers and request context
- `writeRuntimeError()` — writes standardized error envelopes
- `handleRuntimeError()` — catches `HttpRuntimeError` and falls back to 500 for unexpected errors
- `logRuntimeEvent()` — structured JSON log lines to stdout/stderr
- `HttpRuntimeError` — typed error class for HTTP-level errors (statusCode, code, message, details)

This package is the only shared runtime infrastructure in the system. It does not include any routing framework, connection pooling, or middleware chain.

#### `packages/portal-workflow-client`

Type contract library for the portal-workflow-service. Provides:
- `PortalLocale` — `"de-CH" | "en-CH" | "fr-CH" | "it-CH"`
- `WorkflowResponse<T>` — standard envelope: `{ data, meta, permissions, links }`
- `WorkflowMeta` — tenantId, locale, pagination metadata
- `WorkflowPermission` and `WorkflowLink` — per-response access and navigation hints
- All portal-facing DTO types: `EmployerAbsenceListItem`, `EmployerDashboardSummary`, `InternalCaseDetail`, `EmployeeAbsenceDetail`, and approximately 60 other response types covering every portal route

This package is imported by all three portal apps and by the `portal-workflow-service` itself. It forms the type contract boundary.

#### `packages/identity-access-client`

HTTP client SDK for the `identity-access-service`. Provides the `IdentityAccessClient` interface with methods for:
- `signIn()`, `getPortalBootstrap()`, `listMemberships()`
- `listRoleAssignments()`, `listProvisioningInvites()`
- `getOnboardingWorkspace()`, `getOnboardingReadiness()`
- `listAuditAccessPolicies()`, `listAuditEvents()`
- `listAccessPurposeRecords()`, `evaluateAccess()`

The client uses native `fetch` and maps to the identity service HTTP endpoints.

#### `packages/frontend-platform`

Shared UI/navigation package used by all three portals. Provides locale helpers, navigation structure, shell component models, and portal layout primitives. The package is a TypeScript source-only library (no compilation step); portals import directly from source.

---

### 5. Workflow Layer Architecture

The `portal-workflow-service` is the most architecturally significant piece of the current system. It acts as a **workflow aggregation facade** — a single HTTP service that handles all portal-facing route logic by composing results from multiple domain services.

#### How It Works Today

```
Browser (employer/internal/employee portal)
    │
    ▼
portal-workflow-service (port 4020)
    │
    ├── service-context.ts  (exports all route handler functions)
    │
    ├── bootstrap/demo-wiring.ts  (creates service instances with in-memory repos)
    │       │
    │       ├── AbsenceRecordingService (absence-service)
    │       ├── BenefitEngineService (benefit-engine-service)
    │       ├── ClaimsIntakeWorkspaceService (claims-intake-workspace-service)
    │       ├── DashboardProjectionService (dashboard-projection-service)
    │       ├── DocumentService (document-service)
    │       ├── InboxNotificationService (inbox-notification-service)
    │       ├── KtgCaseService (ktg-case-service)
    │       ├── PaymentOperationsService (payment-operations-service)
    │       ├── UvgCaseService (uvg-case-service)
    │       └── PremiumReconciliationService (premium-reconciliation-service)
    │
    └── adapters/memory-repositories.ts  (in-memory repository implementations for all services)
```

All route handlers are exported from `service-context.ts` and invoked by `server.ts`. The service context uses the real domain service classes but wires them to in-memory repository implementations instead of database-backed ones.

This architecture works for demonstration and testing but is a fundamental gap for production: **there is one process handling all portal logic, all data lives in memory, and nothing persists across restarts.**

#### Intended Production Architecture

The intended architecture (documented in design docs, not yet built) is:
- `portal-workflow-service` makes real HTTP calls to each independent service
- Each service runs as an independent process with its own database connection pool
- The workflow service is a thin orchestration layer, not a fat-in-process monolith

The code for distributed operation does not exist yet.

---

### 6. Persistence Model

| Service | Current Persistence | SQL Schema Defined | Production-Ready |
|---|---|---|---|
| identity-access-service | File-backed JSON (`.data/`) | Yes | No |
| portal-workflow-service | In-memory (resets on restart) | No | No |
| payment-operations-service | File-backed JSON (`.data/`) | Yes | No |
| uvg-case-service | Pure in-memory | Yes | No |
| premium-reconciliation-service | File-backed JSON (`.data/`) | Yes | No |
| dashboard-projection-service | None (health-only) | Yes | No |
| people-service | None (domain only) | Yes | No |
| absence-service | None (domain only) | Yes | No |
| ktg-case-service | None (domain only) | Yes | No |
| document-service | None (domain only) | Yes | No |
| inbox-notification-service | None (domain only) | Yes | No |
| claims-intake-workspace-service | None (domain only) | Yes | No |
| benefit-engine-service | None (domain only) | Yes | No |

No service connects to a live PostgreSQL instance. All twelve SQL migration files exist and pass validation, but there is no database initialization, migration runner, or connection infrastructure.

---

### 7. Runtime Posture

#### Health Endpoints

All six running services expose `GET /health` returning:

```json
{
  "service": "service-name",
  "status": "ok",
  "timestamp": "ISO-8601",
  "version": "0.1.0",
  "persistenceMode": "...",
  "details": { }
}
```

#### Request/Correlation IDs

All six services extract or generate `x-request-id` and `x-correlation-id` headers per request and attach them to all log lines and error responses.

#### Structured Logging

JSON-structured log lines are written to stdout (info/warn) and stderr (error). No log aggregation or shipping is configured.

#### Error Envelopes

All running services return:

```json
{
  "error": {
    "code": "validation_error | unauthorized | forbidden | not_found | conflict | internal_error",
    "message": "...",
    "requestId": "uuid",
    "correlationId": "uuid",
    "details": { }
  }
}
```

---

### 8. Missing Architecture Components

Two services specified in the Phase 1 architecture document do not exist in the repository:

- **`task-deadline-service`** — responsible for Karenzfrist thresholds, certificate expiry tasks, and escalation rules. Referenced throughout the design docs. Not built.
- **`integration-gateway`** — responsible for HR/payroll connector adapters, PAS sync, claims system sync, and webhook ingestion. Not built.

Additionally, the following infrastructure is absent:
- API gateway / reverse proxy configuration
- Service-to-service authentication (no mTLS, no internal JWT validation)
- Rate limiting
- Database connection pooling
- Database migration runner (only a validator exists)
- Containerization (no Dockerfiles)
- Deployment manifests (no Kubernetes YAML, no Compose files)
- CI/CD pipeline configuration
- Secret management

---

### 9. Testing Architecture

The test suite lives entirely in `/tests/` and uses Node.js's built-in test runner. Tests execute TypeScript directly using `--experimental-transform-types` with a custom ESM loader.

There are seven smoke test files (phases 2B through 2G) and one integration test file (phase 2H). Tests call service functions directly (not over the network), importing from TypeScript source files at test time.

This approach tests business logic correctly but does **not** test:
- HTTP routing (requests go through helper functions, not a real HTTP stack)
- Database interactions (no DB is involved)
- Service-to-service communication
- Browser rendering or UI behavior
- Authentication enforcement

See the Testing and Release Readiness section for full detail.
