# Module 06: Claims Intake Workspace

## Scope

This module provides the internal elipsLife claims-intake cockpit around an existing KTG case. It owns intake completeness tracking, missing-information loops, handler queue projections, internal-only workspace notes, advisory recommendations, and workspace activity history. It does not own formal `KtgCase` truth, claims decisions, document truth, or notification delivery.

## Approved Data Model

### Core Entities

- `IntakeCaseWorkspace`
- `IntakeChecklistItem`
- `MissingInformationRequest`
- `HandlerWorkQueueEntry`
- `WorkspaceNote`
- `IntakeDecisionRecommendation`
- `WorkspaceActivityEvent`
- `WorkspaceEvidenceReference`

## Relationship Summary

- One active `IntakeCaseWorkspace` wraps one `ktg_case_id`.
- One workspace can have many checklist items, missing-information requests, queue entries, notes, recommendations, activity events, and evidence references.
- Queue re-entry creates a new `HandlerWorkQueueEntry`; it does not mutate prior queue history.
- `WorkspaceEvidenceReference` can point to a stable business reference like `certificate_reference_id`, an internal `document_id`, or both.

## PostgreSQL Design Notes

- Tenant isolation is reinforced in persistence with `(tenant_id, id)` composite foreign keys on all local child tables.
- `ktg_case_id`, `certificate_reference_id`, and raw document ids remain cross-service references without hard foreign keys to other service databases.
- One active workspace per `tenant_id + ktg_case_id` is enforced where active means `closed_at is null`.
- One active queue entry per `workspace_id + queue_type` is enforced where active means `exited_at is null`.

## API Design

### Main Endpoints

- `POST /v1/tenants/{tenantId}/intake-workspaces`
- `GET /v1/tenants/{tenantId}/intake-workspaces`
- `GET /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}`
- `PATCH /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/checklist-items`
- `PATCH /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/checklist-items/{itemId}`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/missing-information-requests`
- `PATCH /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/missing-information-requests/{requestId}`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/queue-entries`
- `PATCH /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/queue-entries/{entryId}`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/notes`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/recommendations`
- `POST /v1/tenants/{tenantId}/intake-workspaces/{workspaceId}/evidence-references`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived outputs are:

- `workspace_ready_for_review`
- `workspace_blocked`
- `queue_entry_overdue`

## Business Logic

### Core Rules

- `claims-intake-workspace-service` is an internal claims-ops domain only.
- `HandlerWorkQueueEntry` is an internal queue projection and does not replace Module 5A inbox items.
- Queue or missing-information state changes may emit `NotificationEvent`s to `inbox-notification-service`, but Module 6 does not own delivery.
- `WorkspaceNote.visibility` is internal-only in Phase 1.
- Checklist completeness is deterministic from `blocking_flag`, `status`, and `satisfied_by_reference`.

### Derived Formula: Workspace Ready For Review

`workspace_ready_for_review = no_open_blocking_checklist_items and no_open_missing_information_requests and workspace_status != completed`

Inputs returned:

- `open_blocking_checklist_count`
- `open_missing_information_request_count`
- `workspace_status`

### Derived Formula: Workspace Blocked

`workspace_blocked = open_missing_information_request_count > 0 or open_blocking_checklist_count > 0`

Inputs returned:

- `open_blocking_checklist_count`
- `open_missing_information_request_count`

### Derived Formula: Queue Entry Overdue

`queue_entry_overdue = sla_due_at < reference_at and exited_at is null`

Inputs returned:

- `sla_due_at`
- `reference_at`
- `exited_at`
- `queue_type`

### Workspace Status Model

- `new`
- `intake_in_progress`
- `waiting_for_information`
- `ready_for_review`
- `decision_pending`
- `completed`

`completed` is terminal in Phase 1.

### Missing Information Request Status Model

- `open`
- `answered`
- `cancelled`
- `overdue`

### Queue Entry Status Model

- `entered`
- `in_progress`
- `paused`
- `exited`

## UI Wireframe Description

### Screen: Claims Intake Queue

- Header:
  - KPI chips for `neu`, `blockiert`, `bereit zur Pruefung`, `ueber SLA`
  - Filters for handler, team, workspace status, queue type, due bucket
- Main table:
  - Columns `Fall`, `Mitarbeitende Person`, `Status`, `Blocker`, `offene Rueckfragen`, `Queue`, `SLA`, `Handler`
  - Row badges for `ueberfaellig`, `wartet auf Info`, `bereit`
- Right-side panel:
  - Workspace summary
  - Checklist progress
  - Latest activity

### Screen: Intake Workspace Detail

- Header:
  - Case reference, employee, assigned handler, workspace status
  - Primary actions `Rueckfrage senden`, `In Queue setzen`, `Zur Pruefung freigeben`
- Tabs:
  - `Uebersicht`
  - `Checklist`
  - `Rueckfragen`
  - `Evidenz`
  - `Interne Notizen`
  - `Aktivitaet`
- `Checklist` tab:
  - Structured blocker list with source service and satisfied-by references
- `Rueckfragen` tab:
  - Request owner, due date, channel policy, current status
- `Evidenz` tab:
  - Certificate references and deep links to document-service

## Integration Spec

Phase 1 priorities for this module:

1. `ktg-case-service`
2. `document-service`
3. `inbox-notification-service`
4. identity and org context

### ktg-case-service

- Direction:
  - Inbound read model and event source
- Usage:
  - create workspace from submitted or in-review KTG case
  - read case status, linked absences, and submission blockers

### document-service

- Direction:
  - Inbound read model and evidence linking
- Usage:
  - attach `certificate_reference_id`
  - deep-link `document_id` for internal evidence review

### inbox-notification-service

- Direction:
  - Outbound event trigger only
- Usage:
  - notify handler or HR when missing-information requests are opened, overdue, or resolved

### Identity And Org Context

- Direction:
  - Inbound enrichment
- Usage:
  - resolve handler teams, named recipients, and role-scoped requests

## Critical Test Cases

### Happy Path

1. Create a workspace from a submitted KTG case.
2. Add blocking checklist items and evidence references.
3. Open a missing-information request to HR with explicit recipient ownership.
4. Resolve all blockers and move the workspace to `ready_for_review`.

### Validation And Edge Cases

1. Reject a second active workspace for the same `tenant_id + ktg_case_id`.
2. Reject a second active queue entry for the same `workspace_id + queue_type`.
3. Reject missing-information requests without explicit recipient ownership.
4. Reject evidence references with neither `document_id` nor `certificate_reference_id`.
5. Reject invalid workspace status transitions from `completed`.

### Audit And Traceability

1. Record workspace status changes in `WorkspaceActivityEvent`.
2. Preserve queue history by creating a new row on re-entry.
3. Keep internal notes separate from HR-visible communication streams.

## Exit Criteria For Module 6

- Claims handlers have an internal intake cockpit around a KTG case.
- Checklist blockers and missing-information requests are deterministic and auditable.
- Internal queue semantics are explicit and separate from generic inbox workflow.
- Evidence references can use stable business identifiers and internal deep links together.
