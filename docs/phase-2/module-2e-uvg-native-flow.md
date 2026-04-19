# Phase 2E: UVG Native Flow

Phase 2E adds `services/uvg-case-service` as the native accident case domain. The service owns UVG accident intake, BU/NBU classification, injury and circumstance records, explicit UVG/KTG coordination, decisions, accident report artifacts, and UVG audit events.

Employer portal routes:

- `/[locale]/uvg-cases`
- `/[locale]/uvg-cases/report`
- `/[locale]/uvg-cases/[caseId]`

Internal portal routes:

- `/[locale]/uvg-cases`
- `/[locale]/uvg-cases/[caseId]`

The workflow layer exposes employer-safe and internal-safe DTOs. Employer detail deliberately excludes internal injuries, circumstances, decisions, coordination internals, and audit events. Internal routes use `tenant-internal-demo` as the caller tenant and explicitly read employer-originated UVG case truth from the UVG service for claims processing.

Authorization and visibility rule:

- Employer UVG routes require `uvg_case:read` or `uvg_case:write` and can only use the employer tenant context.
- Internal UVG routes require `uvg_case:read_internal` or `uvg_case:write_internal` and can only use the internal tenant context.
- Wrong tenant context returns `403`.
- Missing or non-visible detail records return `404`.

Accident report artifacts are generated from UVG service data and persisted as `UvgAccidentReportArtifact` metadata. The initial local runtime stores artifact metadata and generated PDF bytes through the service command response; durable binary storage remains an environment adapter concern.

## Service Boundary

`uvg-case-service` owns:

- UVG accident case intake and lifecycle truth.
- BU/NBU accident classification.
- Injury and circumstance records.
- Accident-specific report artifact metadata.
- UVG/KTG coordination state for complementary and overlap handling.
- Formal UVG decisions.
- UVG lifecycle audit events.

`uvg-case-service` does not own:

- Generic document truth. It stores `UvgDocumentReference` links to document-service document IDs.
- Identity, tenant, role, or permission truth.
- General absence truth outside explicit UVG linkage.
- Payment/disbursement truth.
- Benefit calculation truth.

## Runtime/API Surface

The standalone UVG service runtime exposes the full Phase 2E command surface:

- `GET /v1/uvg-cases`
- `POST /v1/uvg-cases`
- `GET /v1/uvg-cases/{caseId}`
- `POST /v1/uvg-cases/{caseId}/status`
- `POST /v1/uvg-cases/{caseId}/injuries`
- `POST /v1/uvg-cases/{caseId}/circumstances`
- `POST /v1/uvg-cases/{caseId}/documents`
- `POST /v1/uvg-cases/{caseId}/coordination`
- `POST /v1/uvg-cases/{caseId}/decisions`
- `POST /v1/uvg-cases/{caseId}/report-artifact`
- `GET /v1/uvg-cases/{caseId}/audit-events`

The OpenAPI contract is maintained in `services/uvg-case-service/openapi.yaml`.

## Coordination Model

Coordination is explicit via `UvgCoordinationRecord`. A record captures:

- `coordination_type`: `ktg_overlap`, `complementary_uvg`, or `benefit_overlap_review`.
- optional `related_ktg_case_id`.
- optional overlap start/end dates.
- `coordination_status`: `not_required`, `open`, `in_review`, or `resolved`.
- `benefit_overlap_flag`.
- internal coordination notes.

This keeps parallel KTG/UVG tracking visible and auditable without moving KTG or benefit calculation truth into the UVG service.

## Accident Report Artifact Contract

Accident report generation creates a `UvgAccidentReportArtifact` record and returns generated payload metadata:

- `report_type`: currently `accident_report_pdf`.
- `file_name`: `{caseNumber}-accident-report.pdf`.
- `storage_reference`: `uvg-reports/{tenantId}/{caseId}/{caseNumber}.pdf`.
- `generated_at` and `generated_by`.
- `pdfBase64` and `pdfSizeBytes` in the command response for local/runtime verification.

The PDF bytes are reproducible from service data using `buildAccidentReportArtifactPayload`. Durable binary persistence is intentionally left to a future storage adapter; the UVG service already persists artifact metadata.

## Portal Verification

Employer pages exist for list, report, and detail. Employer detail exposes employer-safe case fields, linked document IDs, and report artifacts only.

Internal pages exist for queue and detail. Internal detail exposes intake, injury, circumstance, document linkage, coordination, decision, report artifact, and audit-event sections.

## Known Technical Debt

- The standalone UVG runtime uses an in-memory repository adapter for local/test execution. SQL schema exists, but a production persistence adapter is still needed.
- Report artifact bytes are returned in command responses for verification; durable file/object storage integration remains future hardening.
- The portal workflow service still composes local service modules for integrated browser flows rather than calling independently deployed services over the network.
