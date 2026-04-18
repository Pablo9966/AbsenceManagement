# Module 02: Absence Recording And Tracking

## Scope

This module records the factual absence layer before KTG case opening and before UVG claims coordination. It supports sickness, accident, EO-related leaves, and other leaves in one unified flow with daily granularity, partial-day handling, Rueckfall grouping, and employee/team timeline views.

## Approved Data Model

### Core Entities

- `AbsenceEpisode`
- `AbsenceContractImpact`
- `AbsenceDailyRecord`
- `AbsenceRecurrenceGroup`
- `AbsenceStatusEvent`
- `AbsenceComment`

### Relationship Summary

- One `AbsenceEpisode` belongs to one tenant and one employee.
- One `AbsenceEpisode` can affect multiple employment contracts through `AbsenceContractImpact`.
- One `AbsenceContractImpact` can have many `AbsenceDailyRecord` rows.
- One `AbsenceRecurrenceGroup` can link many `AbsenceEpisode` rows as Rueckfall-related events.
- One `AbsenceEpisode` has append-only `AbsenceStatusEvent` history and user-facing or internal `AbsenceComment` entries.

## PostgreSQL Design Notes

- Cross-service references to `employee_id` and `employment_contract_id` are stored as UUIDs without hard foreign keys to the `people-service` database.
- Daily overlap prevention is enforced at the database layer with a partial unique index on `tenant_id + employee_id + employment_contract_id + absence_date` when `coordinated_overlap_flag = false`.
- Per-episode contract duplication is blocked by a unique constraint on `episode_id + employment_contract_id`.
- Rueckfall linking is handled by `recurrence_group_id` on the episode plus an `initial_episode_id` back-reference on the recurrence group.
- `absence_recurrence_group.initial_episode_id` is intentionally nullable so a group can be created before the first episode is fully attached by integration or manual reconciliation.
- Policy-configurable Rueckfall qualification windows are not enforced in Module 2 yet. Module 3 must read a policy-level `max_recurrence_gap_days` rule when linking KTG cases.

## API Design

### Main Endpoints

- `POST /v1/tenants/{tenantId}/absence-episodes`
- `GET /v1/tenants/{tenantId}/absence-episodes`
- `GET /v1/tenants/{tenantId}/absence-episodes/{episodeId}`
- `PATCH /v1/tenants/{tenantId}/absence-episodes/{episodeId}`
- `POST /v1/tenants/{tenantId}/absence-episodes/{episodeId}/contract-impacts`
- `POST /v1/tenants/{tenantId}/absence-episodes/{episodeId}/daily-records`
- `POST /v1/tenants/{tenantId}/absence-episodes/{episodeId}/status-transitions`
- `POST /v1/tenants/{tenantId}/absence-episodes/{episodeId}/comments`
- `POST /v1/tenants/{tenantId}/absence-episodes/{episodeId}/recurrence-link`
- `GET /v1/tenants/{tenantId}/employees/{employeeId}/absence-timeline`
- `GET /v1/tenants/{tenantId}/employees/{employeeId}/bradford-factor`
- `GET /v1/tenants/{tenantId}/absence-calendar`

### Response Design Principle

Derived values must return:

- `value`
- `formula`
- `inputs`
- `effective_at` or `window`

For this module, the main derived responses are:

- `absence_day_equivalent`
- `bradford_factor`
- timeline groupings per employee

## Business Logic

### Core Rules

- One absence episode can span multiple employment contracts, but each contract can only appear once per episode.
- No overlapping non-coordinated absence day rows are allowed for the same employee, contract, and date.
- `incapacity_percentage` must be greater than 0 and at most 100.
- `partial_day_percentage` must be greater than 0 and at most 100.
- `actual_end_date` and `expected_end_date` cannot be earlier than `start_date`.
- `first_day_of_incapacity` may be earlier than `start_date`, but never later.
- `first_day_of_incapacity` is required when `primary_absence_type = ktg_sickness`.
- Rueckfall requires a valid recurrence group, either existing or created during the link action.
- `working_time_model` is snapshotted onto each contract impact from the `people-service` contract record so later absence calculations remain auditable even if the source contract changes.

### Derived Formula: Absence Day Equivalent

Preferred formula when minute-level scheduling is available:

`absence_day_equivalent = min(1, lost_work_minutes / scheduled_work_minutes)`

Fallback formula when only percentages are available:

`absence_day_equivalent = (incapacity_percentage / 100) * (partial_day_percentage / 100)`

Inputs returned:

- `scheduled_work_minutes`
- `lost_work_minutes`
- `incapacity_percentage`
- `partial_day_percentage`
- `method`

### Derived Formula: Bradford Factor

`bradford_factor = S * S * D`

Where:

- `S = count(distinct absence_episode_id)` within the requested window and included absence types
- `D = sum(absence_day_equivalent)` within the requested window

Default included absence types:

- `ktg_sickness`
- `uvg_bu`
- `uvg_nbu`

The included types must be configurable per tenant later.

### Multi-Contract Aggregation Rule

Employee-level timeline and Bradford calculations must aggregate per unique `absence_date` per episode, not per contract-impact row. A single employee cannot contribute more than one full absence day equivalent on the same calendar day within the same episode, even if multiple employment contracts are affected.

### Episode State Machine

- `reported -> acknowledged`
- `reported -> in_progress`
- `reported -> cancelled`
- `acknowledged -> in_progress`
- `acknowledged -> cancelled`
- `in_progress -> partially_returned`
- `in_progress -> closed`
- `in_progress -> cancelled`
- `partially_returned -> in_progress`
- `partially_returned -> closed`
- `partially_returned -> cancelled`

`closed` and `cancelled` are terminal in Phase 1. Rueckfall creates a new episode linked to the same recurrence group instead of reopening the prior one.

## UI Wireframe Description

### Screen: HR Absence Inbox

- Left rail:
  - Saved views
  - Team filters
  - Absence type filters
  - Status filters
- Header:
  - KPI strip for open absences, today returns, unacknowledged manager actions, expiring certificates placeholder
  - Primary buttons `Absenz erfassen` and `Import starten`
- Main split view:
  - Left pane table with columns `Name`, `Typ`, `Start`, `heute`, `Status`, `Pensum betroffen`, `Rueckfall`, `Manager Bestaetigung`
  - Right pane detail drawer with episode summary, affected contracts, daily record heatmap, notes, and next recommended actions
- Interactions:
  - Keyboard-search by employee or personnel number
  - Click row to open timeline
  - Bulk export filtered list for payroll or compliance

### Screen: Employee Absence Detail

- Header:
  - Employee identity card with active contract badges and manager
  - Status chip and quick actions `Bestaetigen`, `Rueckfall verknuepfen`, `Schliessen`
- Tabs:
  - `Uebersicht`
  - `Kalender`
  - `Tagesdaten`
  - `Rueckfall`
  - `Kommentare`
  - `Statushistorie`
- `Uebersicht` tab:
  - Episode metadata
  - Reason category
  - Contract impact cards with affected employment percentage and working time model
- `Kalender` tab:
  - Month grid with per-day incapacity shading and hover detail
- `Tagesdaten` tab:
  - Editable grid by date with columns for incapacity, partial day, certified flag, return-to-work flag, derived day equivalent
- `Rueckfall` tab:
  - Linked episodes timeline
  - Action to create or attach recurrence group
- `Kommentare` tab:
  - Comment composer with visibility selection

### Screen: Employee Self-Service Reporting Flow

- Step 1:
  - Choose absence type and first day of absence
- Step 2:
  - Indicate expected return date or `offen`
  - Enter current incapacity percentage
- Step 3:
  - Confirm affected employment if multiple contracts exist
- Step 4:
  - Review and submit
- Completion:
  - Confirmation page with current status, next action, and medical certificate reminder placeholder for Module 4

### Screen: Team Absence Calendar

- Top bar:
  - Date range selector
  - Team filter
  - Toggle between month, week, and person timeline views
- Main area:
  - Horizontal employee rows
  - Absence bars with color by type and hatch by partial incapacity
  - Side panel showing day-level summary totals

## Integration Spec

Phase 1 priorities for this module:

1. Abacus AbaHR / AbaSalary
2. SAP SuccessFactors Employee Central Time Off
3. Personio Time Off
4. Soreco TimeSafe
5. Manual CSV / SFTP fallback

### Abacus AbaHR / AbaSalary

- Direction:
  - Inbound absence master data and follow-up changes
  - Outbound optional payroll booking indicators
- Sync frequency:
  - Delta every 15 minutes
  - Manual replay on demand
- Field mapping:
  - `MitarbeiterNr -> absence_episode.employee_id` through existing master-data mapping
  - `Abwesenheitsart -> absence_episode.primary_absence_type`
  - `Von/Bis -> absence_episode.start_date / expected_end_date`
  - `Arbeitsunfaehigkeit% -> absence_daily_record.incapacity_percentage`
  - `Halbtagskennzeichen -> absence_daily_record.partial_day_percentage`
- Error handling:
  - Unknown personnel number goes to connector error queue
  - Date-range collisions return row-level validation errors

### SAP SuccessFactors Employee Central Time Off

- Direction:
  - Inbound absences and updates
  - Outbound HR confirmation status where configured
- Sync frequency:
  - Event-driven if webhook available
  - Nightly reconciliation
- Field mapping:
  - `personIdExternal -> employee_id` via external mapping
  - `timeType -> primary_absence_type`
  - `startDate/endDate -> absence_episode.start_date / expected_end_date`
  - `quantityInDays -> derived daily record series`
  - `fractionQuantity -> partial_day_percentage`
- Error handling:
  - Unsupported time types are quarantined
  - Replayed external versions are idempotent

### Personio Time Off

- Direction:
  - Inbound absences
  - Outbound status update optional
- Sync frequency:
  - Poll every 30 minutes
  - Full validation nightly
- Field mapping:
  - `employee_id -> employee_id`
  - `time_off_type -> primary_absence_type`
  - `start_date/end_date -> episode range`
  - `half_day_start/half_day_end -> partial_day_percentage`
- Error handling:
  - Missing employee mapping blocks import
  - Partial-day inconsistencies create review tasks

### Soreco TimeSafe

- Direction:
  - Inbound scheduling context and absence booking
  - Outbound return-to-work corrections optional
- Sync frequency:
  - Hourly for schedule context
  - On-demand for corrections
- Field mapping:
  - `planned_minutes -> scheduled_work_minutes`
  - `lost_minutes -> lost_work_minutes`
  - `absence_code -> primary_absence_type`
- Error handling:
  - If schedule context is missing, fall back to percentage-based day-equivalent calculation

### Manual CSV / SFTP Fallback

- Direction:
  - Inbound only
- Required columns:
  - Personnel number
  - Absence type
  - Start date
  - End date or open flag
  - Incapacity percentage
  - Partial-day percentage if applicable
  - Employment number when multiple contracts exist
- Error handling:
  - File-level summary
  - Row-level downloadable error report

## Critical Test Cases

### Happy Path

1. HR creates a sickness absence episode for one contract with daily records at 100%.
2. Employee self-reports an accident absence and line manager acknowledges it.
3. One absence episode affects two concurrent contracts with separate contract-impact rows.
4. Bradford Factor is returned for a 12-month window using sickness and accident records.

### Validation And Edge Cases

1. Reject overlapping non-coordinated absence days for the same employee, contract, and date.
2. Allow overlapping days when `coordinated_overlap_flag = true`.
3. Reject `incapacity_percentage = 0` or `> 100`.
4. Reject `partial_day_percentage = 0` or `> 100`.
5. Reject `actual_end_date < start_date`.
6. Reject duplicate contract impact for the same episode and employment contract.
7. Create Rueckfall group and link a second sickness episode to it.
8. Close an episode and confirm it cannot transition back directly from `closed`.

### Derived Metrics

1. Compute day equivalent from minutes when minute-level inputs are present.
2. Fall back to percentage-based formula when minutes are absent.
3. Calculate Bradford Factor with two episodes and partial-day records.
4. Exclude non-selected absence types from Bradford Factor.

### Audit And Traceability

1. Create initial `reported` status event automatically on episode creation.
2. Record actor and timestamp for every status transition.
3. Preserve comment visibility scope correctly in API responses.
4. Keep recurrence linkage traceable in timeline output.

## Exit Criteria For Module 2

- HR and employees can record absences in one unified flow.
- Daily records support partial-day and partial-incapacity handling.
- Team and employee timelines are derivable from stored data.
- Rueckfall linkage is explicit and auditable.
- Bradford Factor is available with transparent formulas and inputs.
