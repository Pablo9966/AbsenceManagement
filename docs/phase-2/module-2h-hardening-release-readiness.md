# Phase 2H: Hardening And Release Readiness

## Scope

Phase 2H settles the current Phase 1 plus Phase 2 baseline into a release-reviewable platform. It does not add a new product domain. It hardens build, runtime, migration, testing, observability, accessibility, localization, and generated-artifact behavior.

## What Was Hardened

### Monorepo build baseline

- root `tsc -b` is the canonical build graph entry
- `packages/runtime-baseline` now provides shared runtime helpers for:
  - `/health` responses
  - request and correlation ids
  - structured startup and error logging
  - standardized runtime error envelopes
- service project references were updated so the shared runtime baseline participates in the build graph cleanly

### Migration validation runner

- root `npm run migrations:validate` validates SQL migration directories for persistence-owning services
- root `npm run migrations:plan` emits the ordered migration manifest with checksums and statement counts
- the current migration posture is SQL-first validation rather than universal DB execution

Covered services:

- `people-service`
- `absence-service`
- `ktg-case-service`
- `document-service`
- `identity-access-service`
- `dashboard-projection-service`
- `claims-intake-workspace-service`
- `benefit-engine-service`
- `inbox-notification-service`
- `payment-operations-service`
- `uvg-case-service`
- `premium-reconciliation-service`

### Runtime health and startup posture

Runtime health endpoints now exist for:

- `identity-access-service`
- `portal-workflow-service`
- `payment-operations-service`
- `uvg-case-service`
- `premium-reconciliation-service`
- `dashboard-projection-service`

Each health response includes:

- service name
- status
- timestamp
- version
- persistence mode where relevant

Startup logging is emitted as structured JSON lines with service name and runtime posture.

### Standardized error handling

The shared runtime baseline standardizes the runtime error shape to:

```json
{
  "error": {
    "code": "validation_error",
    "message": "Human-readable explanation",
    "requestId": "uuid",
    "correlationId": "uuid-or-header-value",
    "details": {}
  }
}
```

This is now used as the baseline for not-found, forbidden, unauthorized, validation, conflict, and internal runtime failures on the hardened service runtimes.

### Integration coverage

`tests/phase-2h.integration.test.mjs` adds integration-level verification for:

- service health endpoints
- identity session sign-in and portal bootstrap
- employee self-service submission reflected in workflow reads
- payment run creation through statement generation and detail read
- UVG runtime command path
- premium reconciliation submission and calculation
- employer analytics refresh and read

### Accessibility and localization baseline

Shared shell and workflow components were hardened to provide:

- skip-to-content navigation
- better semantic headings and regions
- accessible empty, loading, error, and permission-denied states
- complete shared-shell copy for `de-CH` and `en-CH`
- structurally valid fallback copy for `fr-CH` and `it-CH`

### PDF generation hardening

- payment statements now use deterministic file naming and storage-reference structure derived from run, case, type, and period
- UVG accident report PDF generation was rebuilt onto a deterministic line-based renderer instead of embedding raw JSON into an ad hoc stream

## Runtime/API Notes

- `portal-workflow-service` remains the employer, internal, and employee browser aggregation/runtime path
- `dashboard-projection-service` remains the projection owner, while employer analytics browser reads continue to flow through `portal-workflow-service`
- `uvg-case-service` still uses in-memory runtime persistence in this phase; that is explicit in health responses and remains known debt

## Known Technical Debt

### Removed as release blockers

- inconsistent or missing service health posture
- ad hoc runtime error envelopes on the hardened runtimes
- no repo-level migration validation path
- no integration-level release verification beyond smoke tests
- missing shared-shell accessibility and locale baseline details
- fragile UVG accident report PDF rendering

### Still carried

- `portal-workflow-service` still composes seeded/demo wiring instead of distributed live service adapters
- several services still rely on file-backed or in-memory local persistence instead of a uniform PostgreSQL runtime
- `uvg-case-service` runtime persistence is still in-memory
- `dashboard-projection-service` runtime is intentionally minimal because the browser-facing analytics contract is still exposed through `portal-workflow-service`
- broader E2E browser automation is still limited; release confidence is integration-heavy rather than browser-suite-heavy
