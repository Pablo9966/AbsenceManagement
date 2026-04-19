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
