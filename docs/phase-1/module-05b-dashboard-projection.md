# Module 05B: Dashboard Projection And KPI Snapshots

## Scope

This module owns precomputed dashboard read models for HR, payroll, claims, and management views. It stores KPI snapshots, widget payloads, projection job history, dependency freshness watermarks, and configurable dashboard layout metadata. It does not own notification delivery or inbox workflow.

## Approved Data Model

### Core Entities

- `DashboardKpiSnapshot`
- `DashboardWidgetSnapshot`
- `ProjectionJob`
- `ProjectionDependencyWatermark`
- `DashboardViewConfig`
- `BenchmarkSnapshot`

## Relationship Summary

- One tenant and dashboard role can have many KPI and widget snapshots over different windows.
- `ProjectionJob` records refresh execution for KPI or widget rebuilds.
- `ProjectionDependencyWatermark` tracks source-stream freshness independently from specific widgets.
- `DashboardViewConfig` customizes widget order and defaults without mutating snapshot payloads.
- `BenchmarkSnapshot` is a shared read model for later tenant comparison and does not own operational workflows.

## PostgreSQL Design Notes

- This service is read-optimized and recomputable by design.
- Tenant isolation is reinforced in persistence with `(tenant_id, id)` composite foreign keys on all local child tables.
- Upstream entities like departments, cost centres, and absence episodes are represented in snapshot payloads rather than cross-service foreign keys.
- Snapshot replacement is append-safe: in Phase 1, the newest `refreshed_at` record per `tenant + role + key + window` is the active projection.
- The service layer resolves the active snapshot by selecting the newest `refreshed_at` record for a requested `tenant + role + key`.

## API Design

### Main Endpoints

- `GET /v1/tenants/{tenantId}/dashboard-kpis`
- `POST /v1/tenants/{tenantId}/dashboard-kpis`
- `GET /v1/tenants/{tenantId}/dashboard-widgets`
- `POST /v1/tenants/{tenantId}/dashboard-widgets`
- `GET /v1/tenants/{tenantId}/projection-jobs`
- `POST /v1/tenants/{tenantId}/projection-jobs`
- `PATCH /v1/tenants/{tenantId}/projection-jobs/{jobId}`
- `GET /v1/tenants/{tenantId}/projection-dependency-watermarks`
- `POST /v1/tenants/{tenantId}/projection-dependency-watermarks`
- `PATCH /v1/tenants/{tenantId}/projection-dependency-watermarks/{watermarkId}`
- `GET /v1/tenants/{tenantId}/dashboard-view-configs`
- `POST /v1/tenants/{tenantId}/dashboard-view-configs`
- `PATCH /v1/tenants/{tenantId}/dashboard-view-configs/{configId}`
- `GET /v1/benchmarks`
- `POST /v1/benchmarks`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived outputs are:

- `projection_fresh`
- `snapshot_stale`

## Business Logic

### Core Rules

- KPI and widget snapshots are read models, not business truth.
- Projection refresh failures affect freshness only; they do not alter upstream facts.
- `ProjectionJob` lifecycle is append-only from a business perspective even if jobs are retried.
- The newest successful snapshot for a given `tenant + role + key + window` is the active one in Phase 1.
- `DashboardViewConfig` changes presentation defaults only and must not mutate snapshot content.
- Completing a projection job can atomically advance the related dependency watermark in the same orchestration step.

### Derived Formula: Projection Fresh

`projection_fresh = last_processed_at >= freshness_threshold_anchor`

Inputs returned:

- `last_processed_at`
- `freshness_threshold_anchor`
- `source_service`
- `source_stream`

### Derived Formula: Snapshot Stale

`snapshot_stale = refreshed_at < stale_after_anchor`

Inputs returned:

- `refreshed_at`
- `stale_after_anchor`
- `dashboard_role`
- `projection_type`

### Projection Job State Machine

- `pending -> running`
- `pending -> cancelled`
- `running -> completed`
- `running -> failed`
- `failed -> pending`

`completed` and `cancelled` are terminal in Phase 1.

## UI Wireframe Description

### Screen: HR Dashboard

- Header:
  - KPI cards for `offene Absenzen`, `ueberfaellige Zertifikate`, `laufende KTG-Faelle`, `Absenzquote`
  - Freshness badge showing last refresh by source
- Main body:
  - Widget grid with trend chart, department heatmap, and open-items summary
  - Filter bar for date range, legal entity, department, manager
- Footer:
  - “Daten aktualisiert” timestamps and projection-health tooltip

### Screen: Claims Dashboard

- KPI strip:
  - `neue Einreichungen`, `blockierte Einreichungen`, `aktive Leistungen`, `offene Fristen`
- Widgets:
  - submission funnel
  - blocked-case reasons
  - upcoming certificate renewals

### Screen: Projection Ops View

- Table of projection jobs with status, duration, scope, and error
- Watermark panel by source service and stream
- Config panel for dashboard-role widget ordering

## Integration Spec

Phase 1 priorities for this module:

1. `absence-service`
2. `ktg-case-service`
3. `document-service`
4. `inbox-notification-service`
5. tenant org context from `people-service`

### absence-service

- Direction:
  - Inbound event and read-model source
- Projection examples:
  - active absence counts
  - absence-duration trend widgets

### ktg-case-service

- Direction:
  - Inbound event and read-model source
- Projection examples:
  - blocked submission KPI
  - active-case pipeline widgets

### document-service

- Direction:
  - Inbound event and read-model source
- Projection examples:
  - expiring certificate KPI
  - review queue widgets

### inbox-notification-service

- Direction:
  - Inbound read-model source only
- Projection examples:
  - overdue inbox item KPI
  - unresolved task widgets

### people-service

- Direction:
  - Inbound org-context enrichment
- Use:
  - aggregate by department, cost centre, legal entity

## Critical Test Cases

### Happy Path

1. Build a dashboard KPI snapshot for HR open absences over a 30-day window.
2. Build a widget snapshot for KTG submission blockers by reason.
3. Mark a projection job `completed` and advance the related dependency watermark.

### Validation And Edge Cases

1. Reject invalid projection-job status transitions from `completed`.
2. Allow a failed job to move back to `pending`.
3. Preserve prior snapshots when a new refresh writes a later `refreshed_at`.
4. Reject empty widget payloads for active widgets.

### Freshness And Traceability

1. Mark a watermark as fresh when source lag is within threshold.
2. Mark a KPI snapshot as stale when `refreshed_at` is too old.
3. Keep projection error details queryable without mutating the last good snapshot.

## Exit Criteria For Module 5B

- KPI and widget snapshots are queryable by tenant and dashboard role, and active snapshots are resolvable by newest refresh.
- Projection refresh jobs and dependency freshness are auditable, with orchestration support to complete a job and advance its watermark together.
- Dashboard configuration is separated cleanly from projection payloads.
- Projection failures do not affect business truth or inbox workflow.
