# Module 04: Medical Certificate And Document Management

## Scope

This module owns encrypted medical and claims-supporting documents, OCR and structured extraction workflows, certificate validity tracking, version history, and sensitive access logging. It is product-neutral at the storage layer and provides reviewed certificate facts to `absence-service`, `ktg-case-service`, and later `uvg-case-service`.

## Approved Data Model

### Core Entities

- `DocumentRecord`
- `DocumentLink`
- `MedicalCertificateFact`
- `DocumentVersion`
- `DocumentAccessEvent`
- `DocumentExtractionJob`
- `CertificateCoverageWindow`
- `DocumentConsentReference`

### Relationship Summary

- One `DocumentRecord` belongs to one tenant and one employee context.
- One `DocumentRecord` can link to many business targets through `DocumentLink`.
- One `DocumentRecord` can have many `DocumentVersion`, `DocumentAccessEvent`, and `DocumentExtractionJob` rows.
- One certificate document can have zero or one `MedicalCertificateFact`.
- One `MedicalCertificateFact` can drive one `CertificateCoverageWindow`.
- One `DocumentRecord` can reference many consent or purpose records through `DocumentConsentReference`.

## PostgreSQL Design Notes

- Cross-service references to `employee_id`, `absence_episode_id`, `ktg_case_id`, `uvg_case_id`, and `consent_record_id` are stored without hard foreign keys to other service databases.
- Tenant isolation is reinforced in persistence with `(tenant_id, id)` composite foreign keys on all local child tables.
- `MedicalCertificateFact.certificate_reference_id` is the stable business reference that downstream services should use instead of raw file ids.
- `absence_daily_record.certificate_reference_id` in `absence-service` is intended to reference `medical_certificate_fact.certificate_reference_id`.
- Duplicate upload detection is enforced with a partial unique index on active `tenant_id + checksum_sha256`.
- `DocumentVersion` preserves replacement chains explicitly, so the original file and later corrected scans remain auditable.
- `DocumentRecord` carries explicit legal-hold and retention state with deletion guardrails enforced in both SQL and service logic.

## API Design

### Main Endpoints

- `POST /v1/tenants/{tenantId}/documents`
- `GET /v1/tenants/{tenantId}/documents`
- `GET /v1/tenants/{tenantId}/documents/{documentId}`
- `PATCH /v1/tenants/{tenantId}/documents/{documentId}`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/links`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/versions`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/certificate-facts`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/extraction-jobs`
- `PATCH /v1/tenants/{tenantId}/documents/{documentId}/extraction-jobs/{jobId}`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/access-events`
- `POST /v1/tenants/{tenantId}/documents/{documentId}/consent-references`
- `GET /v1/tenants/{tenantId}/absence-episodes/{episodeId}/certificate-coverage`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived outputs are:

- `review_required`
- `certificate_coverage_window`
- `expiry_alert_at`

## Business Logic

### Core Rules

- Only one active `MedicalCertificateFact` may exist per document.
- `certificate_reference_id` must be unique per tenant.
- `certificate_end_date` cannot be earlier than `certificate_start_date`.
- `incapacity_percentage` must be greater than `0` and at most `100` for a valid medical certificate.
- Every access to health-sensitive document content or extraction output must generate a `DocumentAccessEvent` with `purpose_of_use`.
- `DocumentRecord.storage_region` is fixed to `CH`.
- Corrected or clearer re-uploads create a new `DocumentVersion`; they do not overwrite prior evidence in place.
- When `DocumentVersion.replaced_document_version_id` is provided, the currently active evidence is marked as superseded, the linked `MedicalCertificateFact` is marked as replaced by that new version, and the `CertificateCoverageWindow` moves to `certificate_status = replaced` until reviewed replacement facts are written.
- `DocumentRecord` carries `legal_hold_flag`, `legal_hold_reason`, `retention_until`, `retention_policy_code`, and persisted `retention_status`.
- Operational soft deletion is blocked while `legal_hold_flag = true` or before `retention_until`.

### Derived Formula: Review Required

`review_required = extraction_confidence < confidence_threshold or critical_fields_missing or extraction_status in (pending, rejected)`

Critical fields for a medical certificate:

- `certificate_start_date`
- `certificate_end_date` or open-ended marker
- `incapacity_percentage`
- `issuing_provider_name`

Inputs returned:

- `extraction_confidence`
- `confidence_threshold`
- `critical_fields_present`
- `extraction_status`
- `missing_fields`

### Derived Formula: Certificate Coverage Window

`covered_from = certificate_start_date`

`covered_to = certificate_end_date`

`certificate_status = replaced | invalidated | expired | expiring | active`

Status evaluation order:

1. `replaced` when a later accepted version supersedes the certificate
2. `invalidated` when review rejects the certificate facts
3. `expired` when `reference_date > certificate_end_date`
4. `expiring` when `reference_date >= expiry_alert_at`
5. `active` otherwise

### Derived Formula: Expiry Alert

`expiry_alert_at = certificate_end_date - expiry_alert_lead_days`

Default `expiry_alert_lead_days` in Phase 1: `3`

This stays tenant-configurable later.

### Extraction Job State Machine

- `pending -> running`
- `pending -> cancelled`
- `running -> completed`
- `running -> failed`
- `running -> cancelled`
- `failed -> pending`

`completed` and `cancelled` are terminal in Phase 1.

### Document Status Rules

- `uploaded` on initial file receipt
- `under_review` when medical extraction exists but review is required
- `available` when a reviewed or sufficiently confident document is usable
- `superseded` when a newer accepted version replaces the current evidence
- `quarantined` for security or integrity concerns
- `deleted` for operational soft deletion subject to retention controls

### Retention Status Rules

- `active_retention` while the document is within its normal retention window
- `legal_hold` when legal hold overrides normal deletion eligibility
- `deletion_eligible` when `retention_until` has passed and no legal hold remains
- `deleted_retained` after operational soft deletion while the retained record remains queryable

## UI Wireframe Description

### Screen: HR Certificate Inbox

- Header:
  - KPI cards for `neue Dokumente`, `Review noetig`, `Zertifikate laufen ab`, `Zugriff heute`
  - Primary actions `Dokument hochladen` and `Massenimport`
- Main table:
  - Columns `Mitarbeitende Person`, `Dokumenttyp`, `Upload`, `Extraktion`, `Zertifikatszeitraum`, `Review`, `Verknuepfung`, `Ablauf`
  - Row badges for `sensitiv`, `review noetig`, `abgelaufen`, `ersetzt`
- Right-side detail drawer:
  - File metadata card
  - Structured extraction card
  - Coverage window card with formula and expiry alert
  - Linked absence or KTG case references
  - Access-log preview

### Screen: Document Detail

- Header:
  - File name, document type, employee, lifecycle badge
  - Primary actions `Download vorbereiten`, `Review bestaetigen`, `Neue Version erfassen`, `Verknuepfen`
- Tabs:
  - `Uebersicht`
  - `Extraktion`
  - `Versionen`
  - `Verknuepfungen`
  - `Zugriffe`
  - `Einwilligung`
- `Uebersicht` tab:
  - Metadata grid
  - Medical certificate summary
  - Coverage window and expiry alert card
- `Extraktion` tab:
  - OCR text excerpt
  - Extracted structured fields with confidence chips
  - Review controls per field
- `Versionen` tab:
  - Chronological replacement timeline with checksums and uploader
- `Zugriffe` tab:
  - Access table with actor, role, purpose, result, and correlation id

### Screen: Employee Self-Service Upload Flow

- Step 1:
  - Choose document type
  - Select related absence if known
- Step 2:
  - Upload file
  - Privacy notice and processing-purpose reminder
- Step 3:
  - Review extracted certificate data
  - Correct obvious OCR errors
- Completion:
  - Confirmation page with upload status, review state, and expiry reminder if detectable

### Screen: Claims Handler Medical Evidence Panel

- Left column:
  - Linked medical documents by recency and type
- Center:
  - Reviewed certificate facts and historical versions
- Right:
  - Sensitive access justification prompt
  - Quick actions `Zugriff protokollieren`, `Rueckfrage an HR`, `Zertifikat als ersetzt markieren`

## Integration Spec

Phase 1 priorities for this module:

1. employee and HR portals
2. `absence-service`
3. `ktg-case-service`
4. secure storage and KMS layer
5. OCR and extraction provider
6. SharePoint or OneDrive import

### Employee And HR Portals

- Direction:
  - Inbound uploads
  - Outbound status and expiry display
- Sync frequency:
  - Real time
- Field mapping:
  - `selected document type -> document_record.document_type`
  - `employee context -> document_record.employee_id`
  - `linked absence -> document_link(link_target_type='absence_episode')`
- Error handling:
  - Unsupported file type blocks upload
  - Large-file violations return client-safe validation errors

### absence-service

- Direction:
  - Outbound certificate business reference and coverage window
  - Inbound absence context lookup
- Sync frequency:
  - Event-driven on reviewed certificate facts and coverage updates
- Field mapping:
  - `medical_certificate_fact.certificate_reference_id -> absence_daily_record.certificate_reference_id`
  - `absence_episode_id -> certificate_coverage_window.absence_episode_id`
  - `covered_to -> expiry alerts`
- Error handling:
  - Missing episode link keeps the certificate in review queue

### ktg-case-service

- Direction:
  - Outbound reviewed certificate facts and linked evidence metadata
  - Inbound case-context lookup for link targets
- Sync frequency:
  - Event-driven
- Field mapping:
  - `document_link(link_target_type='ktg_case') -> ktg_case.id`
  - `medical_certificate_fact.first_day_of_incapacity -> KTG submission evidence`
- Error handling:
  - Case link failure does not block document storage, but creates a review issue

### Secure Storage And KMS

- Direction:
  - Outbound object storage writes
  - Inbound retrieval and integrity verification
- Sync frequency:
  - Real time
- Field mapping:
  - `storage_object_key`, `checksum_sha256`, `encryption_key_ref`
- Error handling:
  - Integrity mismatch quarantines the document

### OCR And Extraction Provider

- Direction:
  - Outbound extraction jobs
  - Inbound OCR and structured results
- Sync frequency:
  - Async event or polling depending provider capability
- Field mapping:
  - `document_extraction_job.raw_result_payload -> extraction review UI`
  - reviewed fields -> `medical_certificate_fact`
- Error handling:
  - Provider failure sets job `failed`
  - low-confidence extraction sets `review_required = true`

### SharePoint Or OneDrive Import

- Direction:
  - Inbound only in Phase 1
- Sync frequency:
  - Scheduled import or manual trigger
- Field mapping:
  - file path and metadata -> `document_record`
  - folder or tags -> default links and categories
- Error handling:
  - Duplicate checksum is treated as idempotent duplicate and routed to review

## Critical Test Cases

### Happy Path

1. Employee uploads an Arztzeugnis linked to a sickness absence and the document is stored encrypted.
2. OCR extraction completes, structured certificate facts are reviewed, and `review_required` becomes false.
3. Certificate coverage is created for the absence episode and an expiry alert is scheduled three days before `certificate_end_date`.
4. Claims handler opens the document and a sensitive access event is recorded with purpose `claims_assessment`.

### Validation And Edge Cases

1. Reject duplicate active upload for the same tenant and checksum.
2. Reject `certificate_end_date < certificate_start_date`.
3. Reject `incapacity_percentage <= 0` or `> 100`.
4. Reject extraction-job status transitions from `completed` to `running`.
5. Reject consent reference creation when `processing_purpose` is missing.
6. Allow document storage even when the business link target is missing, but surface the issue for reconciliation.

### Audit And Compliance

1. Record every medical-document access with actor, role, purpose, result, and correlation id.
2. Preserve prior file versions when a new scan supersedes an existing certificate.
3. Keep raw extraction payload and reviewed business facts separate.
4. Ensure soft-deleted documents remain queryable for legal-hold and retention workflows.
5. Block operational deletion while legal hold or retention rules still apply.

### Coverage And Expiry Logic

1. Mark a certificate as `active` before the alert window.
2. Mark a certificate as `expiring` on or after `expiry_alert_at`.
3. Mark a certificate as `expired` after `certificate_end_date`.
4. Mark a certificate as `replaced` when a newer accepted version supersedes it.

## Exit Criteria For Module 4

- Sensitive medical documents can be uploaded, encrypted, linked, versioned, and accessed with full auditability.
- OCR and extraction jobs are trackable and reviewable.
- Reviewed medical certificate facts are available as structured evidence.
- Certificate coverage and expiry logic are transparent and auditable.
