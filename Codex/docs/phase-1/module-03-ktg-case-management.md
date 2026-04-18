# Module 03: KTG Case Registration And Deadline Management

## Scope

This module converts qualifying sickness absences into formal KTG claim cases, freezes policy and salary inputs for auditability, manages submission readiness, tracks deadlines and tasks, records claims decisions, and maintains a clean domain boundary between absence facts and insurance-case operations.

## Approved Data Model

### Core Entities

- `KtgCase`
- `KtgCaseAbsenceLink`
- `KtgCaseCoverageSnapshot`
- `KtgCaseSubmission`
- `KtgDeadline`
- `KtgTask`
- `KtgCaseNote`
- `KtgCaseDecision`

### Support Entity

- `KtgCaseStatusEvent`

`KtgCaseStatusEvent` is a support table added for lifecycle auditability. It does not change the approved business model; it preserves status history explicitly instead of inferring it from notes or generic audit logs.

### Relationship Summary

- One `KtgCase` belongs to one tenant, one employee, and one policy.
- One `KtgCase` can link to many absence episodes through `KtgCaseAbsenceLink`.
- Exactly zero or one originating absence episode can be flagged per case.
- One `KtgCase` has one frozen `KtgCaseCoverageSnapshot`.
- One `KtgCase` can have many submissions, deadlines, tasks, notes, decisions, and status events.
- Rueckfall is represented by `relapse_of_case_id` on `KtgCase`, not by a special lifecycle state.
- Tenant isolation is enforced in persistence as well as in application code: all intra-service relationships use `(tenant_id, id)` composite foreign keys to prevent cross-tenant UUID references.

## PostgreSQL Design Notes

- Cross-service references to `employee_id`, `absence_episode_id`, policy records, and insured salary snapshots are stored without hard foreign keys to other service databases.
- `KtgCaseAbsenceLink` replaces a single originating absence FK and supports long-running cases plus Rueckfall-linked episode chains.
- `KtgCaseCoverageSnapshot` freezes `wartezeit_days`, `leistungsdauer_days`, `lohnfortzahlung_days`, and salary inputs at case opening.
- `KtgCaseDecision.payment_run_id` is a Module 7 anchor stub so payment runs can attach to approved decisions without back-migrating case records.
- All local child tables reference `KtgCase` or `KtgDeadline` through tenant-scoped composite keys so a cross-tenant persistence bug cannot bind records together by UUID alone.

## API Design

### Main Endpoints

- `GET /v1/tenants/{tenantId}/ktg-case-suggestions`
- `POST /v1/tenants/{tenantId}/ktg-cases`
- `GET /v1/tenants/{tenantId}/ktg-cases`
- `GET /v1/tenants/{tenantId}/ktg-cases/{caseId}`
- `PATCH /v1/tenants/{tenantId}/ktg-cases/{caseId}`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/absence-links`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/coverage-snapshot`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/submissions`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/status-transitions`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/deadlines`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/tasks`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/notes`
- `POST /v1/tenants/{tenantId}/ktg-cases/{caseId}/decisions`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at` or `window`

For this module, the main derived outputs are:

- `should_suggest_case`
- `first_payable_day`
- `submission_readiness`
- `deadline_due_at`

## Business Logic

### Core Rules

- `KtgCase.status` does not include `relapse`. Rueckfall is modelled only via `relapse_of_case_id`.
- A case can link to multiple absence episodes, but only one absence link may be flagged as `is_originating_episode = true`.
- `lohnfortzahlung_days` must be captured in the coverage snapshot at case opening.
- Deadline counting must distinguish `calendar_days` and `working_days`.
- A decision can record `daily_allowance_amount_chf = 0` for rejected or closed-without-payment outcomes, but never a negative amount.

### Derived Formula: Smart Suggestion

`should_suggest_case = absence_days_recorded >= wartezeit_days and no_open_case_for_same_episode_chain`

Inputs returned:

- `first_day_of_incapacity`
- `latest_absence_date`
- `recorded_absence_days`
- `wartezeit_days`
- `existing_open_case_flag`

This remains rules-based in Phase 1. Module 6 and later AI layers can enrich the score, but the deterministic baseline must stay auditable.

### Derived Formula: First Payable Day

Assumption: day 1 is the first recorded day of incapacity.

`first_payable_day = first_day_of_incapacity + max(wartezeit_days, lohnfortzahlung_days)`

Inputs returned:

- `first_day_of_incapacity`
- `wartezeit_days`
- `lohnfortzahlung_days`
- `controlling_wait_days = max(wartezeit_days, lohnfortzahlung_days)`

### Derived Formula: Submission Readiness

`submission_readiness = all(required_blocks_present and no_blocking_validation_issue)`

Required blocks:

- at least one linked absence episode
- one originating absence episode
- coverage snapshot present
- first day of incapacity available from the originating absence chain
- policy id present

Persisted `submission_readiness_status` is synchronized on every case mutation that affects readiness. The stored state is:

- `not_ready` before prerequisites are complete
- `ready` when all required blocks are present
- `blocked` when a submission attempt fails validation or is blocked

### Deadline Engine Rule

- `calendar_days` means every day counts, including weekends and public holidays.
- `working_days` means Monday to Friday only in Phase 1. Swiss canton-specific holidays are a future enhancement and should be externalized later.

### Case State Machine

- `suggested -> draft`
- `suggested -> submitted`
- `suggested -> rejected`
- `draft -> submitted`
- `draft -> rejected`
- `submitted -> in_review`
- `submitted -> rejected`
- `in_review -> benefit_active`
- `in_review -> rejected`
- `benefit_active -> closed`

`rejected` and `closed` are terminal in Phase 1.

## UI Wireframe Description

### Screen: KTG Case Suggestions Inbox

- Header:
  - KPI cards for `neue Vorschlaege`, `einreichungsbereit`, `ueberfaellige Meldungen`
  - Filter chips for tenant, HR manager, department, policy, Wartezeit bucket
- Main table:
  - Columns `Mitarbeitende Person`, `erster Tag AUF`, `heutige Absenzdauer`, `Wartezeit`, `Vorschlag`, `offener Fall`, `naechste Frist`
  - Right-side explanation drawer showing the exact suggestion formula and inputs
- Actions:
  - `Fall eroeffnen`
  - `Vorschlag ignorieren`
  - `Zur Pruefung markieren`

### Screen: KTG Case Detail

- Header:
  - Case number, employee, policy badge, lifecycle status, relapse badge if linked
  - Primary actions `Einreichen`, `Status aktualisieren`, `Rueckfall verknuepfen`
- Tabs:
  - `Uebersicht`
  - `Absenzen`
  - `Deckung`
  - `Fristen`
  - `Tasks`
  - `Kommunikation`
  - `Entscheide`
  - `Statushistorie`
- `Uebersicht` tab:
  - Submission readiness card with blockers
  - First payable day formula card
  - Snapshot summary for Wartezeit, Lohnfortzahlung, Leistungsdauer, insured salary reference
- `Absenzen` tab:
  - Linked episode list with one origin marker
  - Daily incapacity summary pulled from absence-service projections
- `Fristen` tab:
  - Deadline timeline grouped by overdue, this week, completed
  - Counting method badge on each deadline
- `Tasks` tab:
  - Kanban or list layout with due-date sorting
- `Kommunikation` tab:
  - Shared HR and claims-handler note stream
- `Entscheide` tab:
  - Claims decisions with daily allowance amount and payment run reference

### Screen: Claims Handler Intake View

- Left panel:
  - Submitted or in-review KTG cases
- Center:
  - Case data and absence history
- Right:
  - Decision composer
  - Deadline generator
  - Request-missing-info quick actions

## Integration Spec

Phase 1 priorities for this module:

1. elipsLife Policy Administration System
2. elipsLife Claims System
3. absence-service
4. people-service
5. notification-service

### elipsLife Policy Administration System

- Direction:
  - Inbound policy terms and salary basis rules
- Sync frequency:
  - Read-through on case opening
  - Daily reconciliation
- Field mapping:
  - `policy_id -> ktg_case.policy_id`
  - `coverage_percentage -> ktg_case_coverage_snapshot.coverage_percentage`
  - `wartezeit_days -> ktg_case_coverage_snapshot.wartezeit_days`
  - `leistungsdauer_days -> ktg_case_coverage_snapshot.leistungsdauer_days`
  - `salary_formula_version -> ktg_case_coverage_snapshot.salary_formula_version`
- Error handling:
  - Missing policy blocks case submission readiness
  - Version mismatch creates review task

### elipsLife Claims System

- Direction:
  - Outbound new case submissions
  - Inbound case ids, decisions, and correspondence
- Sync frequency:
  - Event-driven where available
  - Hourly reconciliation
- Field mapping:
  - `ktg_case.id -> external payload local_case_id`
  - `external_claims_case_id -> ktg_case.claims_system_case_id`
  - `decision_status -> ktg_case_decision.decision_status`
  - `daily_allowance_amount -> ktg_case_decision.daily_allowance_amount_chf`
  - `payment_run_id -> ktg_case_decision.payment_run_id`
- Error handling:
- A blocked pre-submission validation attempt leaves the case in its current lifecycle state and sets `submission_readiness_status = blocked`
- A blocked pre-submission validation attempt is written to `KtgCaseStatusEvent` as `submission_blocked` for explicit auditability
- A successful submission writes `ktg_case.claims_system_case_id` when an external case id is returned and transitions the case to `submitted`
  - Failed downstream submission after outbound handoff can leave the case in `submitted` with follow-up tasks and reconciliation
  - Unknown inbound decision case id is quarantined

### absence-service

- Direction:
  - Inbound read model only in Phase 1
- Sync frequency:
  - Read-through plus event subscription
- Field mapping:
  - `absence_episode.id -> ktg_case_absence_link.absence_episode_id`
  - `first_day_of_incapacity -> suggestion and payable-day formulas`
  - `recurrence_group_id -> Rueckfall case-link logic`
- Error handling:
  - Missing originating absence blocks readiness

### people-service

- Direction:
  - Inbound read model only in Phase 1
- Sync frequency:
  - Read-through plus change events
- Field mapping:
  - `employee_id -> ktg_case.employee_id`
  - `insured_salary_snapshot_id -> ktg_case_coverage_snapshot.insured_salary_snapshot_id`
  - `policy-linked insured salary preview -> case-opening reference`
- Error handling:
  - Missing employee master data blocks submission

### notification-service

- Direction:
  - Outbound deadline and task notifications
- Sync frequency:
  - Event-driven on deadline creation and overdue checks
- Error handling:
  - Delivery failures remain visible on deadline/task records

## Critical Test Cases

### Happy Path

1. Suggest a KTG case when sickness absence days cross Wartezeit.
2. Open a case from a suggestion, link the originating absence, and capture coverage snapshot.
3. Submit the case to the claims system and store the external case id.
4. Receive an accepted decision with `daily_allowance_amount_chf` and `payment_run_id`.

### Validation And Edge Cases

1. Reject duplicate originating absence links on the same case.
2. Reject negative `daily_allowance_amount_chf`.
3. Reject `lohnfortzahlung_days < 0`.
4. Reject unsupported status transitions from `closed` or `rejected`.
5. Block readiness when no coverage snapshot exists.
6. Allow a relapse-linked case to have normal lifecycle states while pointing to `relapse_of_case_id`.

### Deadline Logic

1. Calculate a `calendar_days` submission deadline.
2. Calculate a `working_days` deadline and skip weekends.
3. Mark overdue deadlines and escalate them.
4. Complete a deadline and verify linked tasks remain auditable.

### Audit And Traceability

1. Record status transition history in `KtgCaseStatusEvent`.
2. Preserve the exact coverage snapshot used at case opening.
3. Keep submission payload snapshots for later dispute handling.
4. Link multiple absence episodes to one case and retain the originating marker.

## Exit Criteria For Module 3

- KTG cases can be suggested, opened, linked to absences, and submitted.
- Frozen coverage and salary inputs are stored auditably.
- Deadline and task management is operational with counting-method awareness.
- Claims decisions can be stored with daily allowance amount and payment-run stub references.
