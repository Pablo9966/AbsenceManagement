# Phase 2G: Client Analytics

Phase 2G extends `dashboard-projection-service` with employer-facing analytics projections and exposes them in the employer portal at `/[locale]/analytics`.

## Service Boundary

`dashboard-projection-service` owns:

- employer analytics snapshots
- employer analytics dashboard read models
- refresh jobs for analytics projection observability
- transparent metric definitions for employer-facing reporting

It does not own absence, KTG, UVG, benefit, payment, premium, or people truth. Analytics records are derived from existing upstream outputs and stored as projection/read-model state.

## Projection Model

The 2G projection model adds:

- `EmployerAnalyticsSnapshot`
- `EmployerAnalyticsDashboard`
- `EmployerAnalyticsRefreshJob`

Snapshots support metric keys for absence volume, case volume, total cost, average duration, return-to-work success, cause share, and heatmap counts. Dashboards store a role-scoped employer payload for a time window. Refresh jobs record who triggered a refresh and whether it completed.

## Runtime/API Surface

The projection service contract now includes:

- `POST /v1/tenants/{tenantId}/employer-analytics/refresh`
- `GET /v1/tenants/{tenantId}/employer-analytics/dashboard`
- `GET /v1/tenants/{tenantId}/employer-analytics/snapshots`

The employer portal consumes analytics through `portal-workflow-service`:

- `GET /v1/employer/analytics`
- `POST /v1/employer/analytics/refresh`

This is intentional. `dashboard-projection-service` owns projection storage and refresh logic, while `portal-workflow-service` is the employer-facing route layer that:

- resolves employer-safe filters
- derives employer-safe analytics source records from upstream domain outputs
- enforces tenant and role visibility
- returns the browser-facing analytics DTO

## Employer Route Contract

`GET /v1/employer/analytics`

- returns the employer analytics dashboard payload for the requested period/filter window
- supports:
  - `periodStart`
  - `periodEnd`
  - `granularity`
  - `cause`
  - `status`
  - `caseType`
- always returns:
  - `refreshedAt`
  - `refreshJobId` when a matching refresh job exists
  - `latestRefresh` with latest known job status, trigger time, completion time, and actor

`POST /v1/employer/analytics/refresh`

- triggers a refresh for the requested employer analytics dashboard window
- returns:
  - `refreshJobId`
  - `jobStatus`
  - `refreshedAt`
  - the refreshed dashboard payload

This makes refresh observability explicit in both the write path and the normal analytics read path.

## Employer Portal Route

Employer management users use:

- `/[locale]/analytics`

The page supports:

- period start/end filters
- monthly or weekly granularity
- optional cause, status, and case-type filters
- refresh action
- trend table
- cause distribution
- cost by case type
- duration summary
- return-to-work success summary
- heatmap table
- metric definitions
- latest refresh status visibility

## Access Rules

Analytics are tenant-scoped and employer-facing. The workflow route rejects non-employer tenant contexts. Portal route access uses the existing employer `dashboard:read` permission rule, which blocks employee self-service users and users without employer dashboard access.

The current role scope for the analytics dashboard is employer-management oriented. The settled route behavior is:

- employer tenant only
- employer dashboard permission required
- employee self-service users denied
- internal tenant reads denied

## Known Technical Debt

- Analytics source composition currently happens in `portal-workflow-service` by deriving employer-safe records from existing service outputs before handing them to `dashboard-projection-service`. A later hardening pass can replace that with event-stream or service-client ingestion.
- Visualizations are table/card based. They are browser-usable and filterable, but not a full BI charting layer.
- Organization dimensions are limited to employer-safe demo department mapping until people-service exposes a stable employer organization read model.
- `dashboard-projection-service` OpenAPI now documents the direct projection contract, but the repo still does not expose a standalone HTTP runtime for that service. The browser product path remains intentionally routed through `portal-workflow-service`.
