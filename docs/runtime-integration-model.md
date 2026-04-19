# Runtime and Integration Model
## elipsLife Absence Management Platform — As Built

---

### 1. Service Runtime Map

The following table describes the actual runtime state of every service and application.

| Component | Can Start | Port | Data Endpoint | Auth Enforced | Notes |
|---|---|---|---|---|---|
| identity-access-service | Yes | 4010 | Yes | No | File-backed, demo sign-in |
| portal-workflow-service | Yes | 4020 | Yes (50+ routes) | No | In-memory demo wiring |
| payment-operations-service | Yes | 4030 | Yes | No | File-backed |
| uvg-case-service | Yes | 4040 | Yes | No | Pure in-memory |
| premium-reconciliation-service | Yes | 4050 | Yes | No | File-backed |
| dashboard-projection-service | Yes | 4060 | No (health only) | N/A | Stub server |
| people-service | No | — | No | N/A | Domain only |
| absence-service | No | — | No | N/A | Domain only |
| ktg-case-service | No | — | No | N/A | Domain only |
| document-service | No | — | No | N/A | Domain only |
| inbox-notification-service | No | — | No | N/A | Domain only |
| claims-intake-workspace-service | No | — | No | N/A | Domain only |
| benefit-engine-service | No | — | No | N/A | Domain only |
| employer-portal | Yes (Next.js) | 3000 (default) | N/A | No guard | Needs workflow service |
| internal-portal | Yes (Next.js) | 3001 (default) | N/A | No guard | Needs workflow service |
| employee-portal | Yes (Next.js) | 3002 (default) | N/A | No guard | Needs workflow service |

---

### 2. Health Endpoints

All six running services expose a standardized `GET /health` endpoint:

| Service | URL | Response includes |
|---|---|---|
| identity-access-service | `http://localhost:4010/health` | service, status, timestamp, version, persistenceMode |
| portal-workflow-service | `http://localhost:4020/health` | service, status, timestamp, version, persistenceMode |
| payment-operations-service | `http://localhost:4030/health` | service, status, timestamp, version, persistenceMode |
| uvg-case-service | `http://localhost:4040/health` | service, status, timestamp, version |
| premium-reconciliation-service | `http://localhost:4050/health` | service, status, timestamp, version, persistenceMode |
| dashboard-projection-service | `http://localhost:4060/health` | service, status, timestamp, version, details.analyticsExposure |

All health responses follow:
```json
{
  "service": "service-name",
  "status": "ok",
  "timestamp": "2026-04-19T...",
  "version": "0.1.0",
  "persistenceMode": "..."
}
```

---

### 3. How Portals Talk to the Backend

The data flow from a browser to the backend is:

```
Browser
  │
  ├── Employer Portal (Next.js, :3000)
  ├── Internal Portal (Next.js, :3001)  ──► portal-workflow-service (:4020)
  └── Employee Portal (Next.js, :3002)          │
                                                 │ (in-process, not HTTP)
                                          ┌──────┴──────────────────────┐
                                          │  All domain services:       │
                                          │  absence, ktg, document,    │
                                          │  inbox, claims, benefit,    │
                                          │  payment, uvg, premium,     │
                                          │  dashboard                  │
                                          └─────────────────────────────┘
```

The employee portal additionally uses Next.js server actions for mutations (report-absence, upload-certificate, return-to-work), which also route to the portal-workflow-service.

The portals also reference the identity-access-service via the `identity-access-client` package for sign-in and session bootstrap. However, the resulting session token is **not validated** by the portal-workflow-service when workflow requests arrive.

---

### 4. Portal Workflow Service as the Facade

The `portal-workflow-service` is architecturally the central router for all portal behavior. It serves approximately 50 HTTP endpoints organized into three namespaces:

#### `/v1/employer/*` (Employer Portal routes)

| Route | Method | Handler | Notes |
|---|---|---|---|
| `/v1/employer/dashboard` | GET | getEmployerDashboard | |
| `/v1/employer/absences` | GET | listEmployerAbsences | Pagination supported |
| `/v1/employer/absences/:id` | GET | getEmployerAbsenceDetail | |
| `/v1/employer/cases` | GET | listEmployerCases | |
| `/v1/employer/cases/:id` | GET | getEmployerCaseDetail | |
| `/v1/employer/documents` | GET | listEmployerDocuments | |
| `/v1/employer/payments` | GET | listEmployerPayments | |
| `/v1/employer/payment-run-summaries` | GET | listEmployerPaymentRunSummaries | |
| `/v1/employer/tasks` | GET | listEmployerTasks | |
| `/v1/employer/uvg-cases` | GET | listEmployerUvgCases | |
| `/v1/employer/uvg-cases/:id` | GET | getEmployerUvgCaseDetail | |
| `/v1/employer/uvg-cases/accident-report` | POST | createEmployerUvgAccidentReport | |
| `/v1/employer/uvg-cases/:id/artifact` | POST | generateEmployerUvgAccidentReportArtifact | |
| `/v1/employer/premium` | GET | getEmployerPremiumDashboard | |
| `/v1/employer/premium/salary-report` | POST | submitEmployerSalaryMassReport | |
| `/v1/employer/premium/adjustment` | POST | calculateEmployerPremiumAdjustment | |
| `/v1/employer/premium/settlement` | POST | generateEmployerPremiumSettlement | |
| `/v1/employer/premium/installment-plan` | POST | createEmployerPremiumInstallmentPlan | |
| `/v1/employer/analytics` | GET | getEmployerAnalyticsDashboard | |
| `/v1/employer/analytics/refresh` | POST | refreshEmployerAnalyticsDashboard | |

#### `/v1/internal/*` (Internal Portal routes)

| Route | Method | Handler | Notes |
|---|---|---|---|
| `/v1/internal/dashboard` | GET | getInternalDashboard | |
| `/v1/internal/cases` | GET | listInternalCases | |
| `/v1/internal/cases/:id` | GET | getInternalCaseDetail | |
| `/v1/internal/uvg-cases` | GET | listInternalUvgCases | |
| `/v1/internal/uvg-cases/:id` | GET | getInternalUvgCaseDetail | |
| `/v1/internal/uvg-cases/:id/status` | PUT | updateInternalUvgCaseStatus | |
| `/v1/internal/uvg-cases/:id/injury` | POST | recordInternalUvgInjury | |
| `/v1/internal/uvg-cases/:id/circumstance` | POST | recordInternalUvgCircumstance | |
| `/v1/internal/uvg-cases/:id/coordination` | PUT | upsertInternalUvgCoordination | |
| `/v1/internal/uvg-cases/:id/documents` | POST | linkInternalUvgDocument | |
| `/v1/internal/uvg-cases/:id/decision` | PUT | upsertInternalUvgDecision | |
| `/v1/internal/intake` | GET | listInternalIntake | |
| `/v1/internal/intake/:id` | GET | getInternalIntakeDetail | |
| `/v1/internal/benefits` | GET | listInternalBenefits | |
| `/v1/internal/benefits/:id` | GET | getInternalBenefitDetail | |
| `/v1/internal/payment-runs` | GET | listInternalPaymentRuns | |
| `/v1/internal/payment-runs/:id` | GET | getInternalPaymentRunDetail | |
| `/v1/internal/month-end` | GET | getInternalMonthEndReport | |
| `/v1/internal/reconciliation` | GET | listInternalReconciliationRecords | |
| `/v1/internal/settlement` | GET | getInternalSettlementSummary | |
| `/v1/internal/payment-audit` | GET | listInternalPaymentAuditEvents | |

#### `/v1/employee/*` (Employee Portal routes)

| Route | Method | Handler | Notes |
|---|---|---|---|
| `/v1/employee/dashboard` | GET | getEmployeeDashboard | |
| `/v1/employee/absences` | GET | listEmployeeAbsences | |
| `/v1/employee/absences/:id` | GET | getEmployeeAbsenceDetail | |
| `/v1/employee/documents` | GET | listEmployeeDocuments | |
| `/v1/employee/documents/:id` | GET | getEmployeeDocumentDetail | |
| `/v1/employee/status` | GET | getEmployeeStatusSummary | |
| `/v1/employee/return-to-work` | GET | getEmployeeReturnToWorkState | |
| `/v1/employee/report-absence` | POST | submitEmployeeAbsence | |
| `/v1/employee/documents/upload` | POST | uploadEmployeeCertificate | |
| `/v1/employee/return-to-work/confirm` | POST | confirmEmployeeReturnToWork | |

All routes accept `tenantId` and `locale` parameters. All responses follow the `WorkflowResponse<T>` envelope with `data`, `meta`, `permissions`, and `links`.

---

### 5. Identity and Session Flow

The current identity flow for demo purposes:

```
1. Browser POSTs to identity-access-service /v1/session/sign-in
   { email: "hr.admin@demo.elipslife.ch", tenantId: "tenant-employer-demo" }

2. identity-access-service returns { sessionToken: "uuid" }
   (no password verification in demo mode)

3. Browser POSTs to identity-access-service /v1/session/bootstrap
   { routeLocale: "de-CH", permissions: [...] }
   with Authorization: Bearer <sessionToken>

4. identity-access-service returns PortalBootstrapDto:
   { membership, locale, permissions, links }

5. Browser uses sessionToken for subsequent workflow requests
   BUT portal-workflow-service does NOT validate the token
```

The session token provides permission context from the identity service but is not enforced as an access gate anywhere in the system.

---

### 6. Analytics Flow

The employer analytics flow:

```
1. Employer portal loads /[locale]/analytics page

2. Page calls portal-workflow-service GET /v1/employer/analytics
   with { tenantId, locale }

3. portal-workflow-service calls getEmployerAnalyticsDashboard()
   from service-context.ts

4. service-context uses DashboardProjectionService (in-process)
   operating on in-memory analytics projections

5. Returns EmployerAnalyticsDashboard with:
   - trend data (absence rates by period)
   - cause breakdown
   - cost exposure
   - duration distributions
   - return-to-work outcomes
   - heatmaps

6. POST /v1/employer/analytics/refresh triggers a projection refresh
   (recomputes from in-memory data, no real event sourcing)
```

The analytics data is computed from in-memory demo data on every refresh. There is no real time-series data pipeline or event-driven projection mechanism.

---

### 7. Payment Operations Flow

```
1. Internal portal loads payment run pages

2. Page calls portal-workflow-service GET /v1/internal/payment-runs
   → lists payment runs from payment-operations-service (in-process)

3. Payment run creation:
   - portal-workflow-service POST /v1/internal/payment-runs (if exists)
   OR
   - Direct call to payment-operations-service :4030 POST /v1/payment-runs

4. payment-operations-service processes:
   - Creates PaymentRun record
   - Generates export package
   - Produces statement
   - Records settlement summary
   - All persisted to .data/payment-operations-state.json

5. Employer can view payment summaries via
   GET /v1/employer/payment-run-summaries (read model)
```

The payment service is the most production-like of the running services, with file-backed persistence and a reasonably complete lifecycle. However, it has no real banking integration.

---

### 8. UVG Case Flow

```
1. Employer submits accident report:
   POST /v1/employer/uvg-cases/accident-report
   → portal-workflow-service → UvgCaseService.createAccidentReport()

2. Case is created in uvg-case-service in-memory repository

3. Internal claims handler views and progresses case:
   GET /v1/internal/uvg-cases/:id
   PUT /v1/internal/uvg-cases/:id/status
   POST /v1/internal/uvg-cases/:id/injury
   etc.

4. All UVG state lives in memory — lost on service restart

5. Artifact generation (SUVA report):
   POST /v1/employer/uvg-cases/:id/artifact
   → generates structured report object (no real SUVA submission)
```

---

### 9. Premium Reconciliation Flow

```
1. Employer submits salary mass report:
   POST /v1/employer/premium/salary-report

2. Employer views premium dashboard:
   GET /v1/employer/premium
   → getEmployerPremiumDashboard from service-context

3. Premium adjustment calculation:
   POST /v1/employer/premium/adjustment
   → calculateEmployerPremiumAdjustment

4. Premium settlement generation:
   POST /v1/employer/premium/settlement

5. Installment plan creation:
   POST /v1/employer/premium/installment-plan

6. All state persisted to .data/premium-reconciliation-state.json
```

---

### 10. What Is Not Wired

The following integrations referenced in the design documentation are entirely absent from the runtime:

| Integration | Design Reference | Runtime Status |
|---|---|---|
| HR/payroll connector (SAP, Abacus, etc.) | Phase 1 architecture | Not built (integration-gateway missing) |
| PAS sync | Phase 1 architecture | Not built |
| SUVA notification submission | Phase 2E | Not built |
| Email/SMS notification delivery | Phase 2A, Module 05A | Not built |
| OCR document processing | Module 04 | Not built |
| Real blob/file storage | Module 04 | Not built |
| Swiss data residency enforcement | Phase 1 architecture | Not built |
| AHV number encryption at rest | Phase 1 architecture | Not implemented |
| Rate limiting / API gateway | Phase 2H | Not built |
| Service-to-service authentication | Phase 1 architecture | Not built |
