# Phase 2C: Payment Operations

Phase 2C operationalizes benefit outputs into payment runs, export packages, statement generation, reconciliation tracking, and month-end visibility.

## Delivered Service Package

`services/payment-operations-service` now contains:

- payment operations domain types and validations
- `PaymentOperationsService` application logic
- file-backed runtime wiring for normal execution
- HTTP endpoints for payment-run, export, statement, reconciliation, settlement, and audit reads

## Runtime/API Surface

The payment operations runtime exposes:

- `GET /v1/internal/payment-runs`
- `POST /v1/internal/payment-runs/create`
- `GET /v1/internal/payment-runs/{runId}`
- `POST /v1/internal/payment-runs/{runId}/items`
- `POST /v1/internal/payment-runs/{runId}/ready`
- `POST /v1/internal/payment-runs/{runId}/cancel`
- `POST /v1/internal/payment-runs/{runId}/export`
- `POST /v1/internal/payment-runs/{runId}/statement`
- `POST /v1/internal/payment-runs/{runId}/reconcile`
- `POST /v1/internal/payment-runs/{runId}/booking-confirmation`
- `GET /v1/internal/month-end`
- `GET /v1/internal/reconciliation`
- `GET /v1/internal/settlement/{ktgCaseId}`
- `GET /v1/internal/payment-audit-events`
- `GET /v1/employer/payment-runs`

The default runtime uses a file-backed repository adapter so payment-run state survives process restarts in local development instead of being recreated in memory on each start.

## Portal Surfaces

Employer portal:

- `/[locale]/payments`

Internal portal:

- `/[locale]/payment-runs`
- `/[locale]/payment-runs/[runId]`
- `/[locale]/month-end`

These screens remain read-oriented and consume route-family payment DTOs through `packages/portal-workflow-client` and `services/portal-workflow-service`.

## Verification

The current repository verifies:

- root `npm run typecheck`
- `npm run test:smoke`
- employer portal `npm run build`
- internal portal `npm run build`

Phase 2C smoke coverage exercises:

- payment run creation
- instruction inclusion
- ready-for-export transition
- export generation
- statement generation
- reconciliation update
- payroll booking confirmation
- payment run detail reads
- month-end reporting
- employer/internal payment workflow route reads
