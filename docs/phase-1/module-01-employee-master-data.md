# Module 01: Employee Master Data Management

## Scope

This module establishes the auditable insurance inputs used later by absence handling, KTG case intake, UVG coordination, and Taggeld calculation.

## Approved Data Model

### Core Entities

- `Tenant`
- `ClientLegalEntity`
- `OrgUnit`
- `Employee`
- `EmploymentContract`
- `SalaryRecord`
- `CoverageEligibility`
- `IntegrationSource`
- `EmployeeExternalMapping`
- `MasterDataChangeEvent`
- `ConsentRecord`
- `ImportErrorQueue`

### Relationship Summary

- One tenant has many legal entities, org units, employees, and integration sources.
- One employee can hold multiple simultaneous employment contracts.
- One employment contract has effective-dated salary history and coverage eligibility rows.
- One integration source can map many local entities to third-party identifiers.
- Every employment contract stores a structured `working_time_model` for later absence-day proration logic.

## PostgreSQL Design Notes

- AHV number is stored encrypted and hashed.
- Effective-dated salary history uses non-overlapping date ranges per contract.
- Coverage eligibility uses non-overlapping date ranges per contract, policy, and coverage type.
- Audit events capture before/after payloads for retroactive corrections.

## API Design

### Main Endpoints

- `POST /v1/tenants`
- `GET /v1/tenants/{tenantId}`
- `POST /v1/tenants/{tenantId}/legal-entities`
- `POST /v1/tenants/{tenantId}/employees`
- `GET /v1/tenants/{tenantId}/employees`
- `GET /v1/tenants/{tenantId}/employees/{employeeId}`
- `PATCH /v1/tenants/{tenantId}/employees/{employeeId}`
- `POST /v1/tenants/{tenantId}/employees/{employeeId}/employment-contracts`
- `POST /v1/tenants/{tenantId}/employment-contracts/{contractId}/salary-records`
- `POST /v1/tenants/{tenantId}/employment-contracts/{contractId}/coverage-eligibilities`
- `GET /v1/tenants/{tenantId}/employees/{employeeId}/insured-salary-preview`
- `POST /v1/tenants/{tenantId}/integrations/{integrationSourceId}/sync-jobs/import`
- `GET /v1/tenants/{tenantId}/imports/errors`
- `GET /v1/tenants/{tenantId}/employees/{employeeId}/change-events`
- `POST /v1/tenants/{tenantId}/employees/{employeeId}/consents`

### Response Design Principle

Every calculated or derived value must return:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived response is an insured salary preview, not a persisted claim-time Taggeld basis.

## Business Logic

### Core Rules

- Personnel number must be unique per tenant.
- AHV hash must be unique per tenant.
- Salary records may not overlap for the same employment contract.
- Coverage windows may not overlap for the same contract, policy, and coverage type.
- Salary changes after an absence begins do not overwrite history. They create a new effective-dated row and downstream recalculation events.
- Multiple employments are allowed. Warnings are raised when aggregate employment percentage exceeds client threshold.
- A single employment contract may not exceed 100% employment percentage.

### Formula Preview

`insured_salary_preview = min(policy_salary_cap, insured_salary_components_total) * employment_percentage / 100`

Where:

- `annual_base_salary = base_salary_amount * 12` when `salary_model = monthly`, otherwise `annual_base_salary = base_salary_amount`
- `insured_salary_components_total = annual_base_salary + included_13th_month + insured_bonus + insured_allowances`
- `included_13th_month = annual_base_salary / 12` when policy includes 13th month and the salary does not already include it
- `insured_bonus = bonus_target_amount` only if policy flags bonus as insured

The preview exists for transparency only. The authoritative Taggeld basis is frozen later by the benefit engine at claim onset.

## UI Wireframe Description

### Screen: Employee Master Data List

- Left rail:
  - Tenant selector
  - Integration health widget
  - Saved filters
- Top bar:
  - Global search by name, personnel number, AHV masked suffix
  - Filter chips for legal entity, department, status, integration source, policy coverage
  - Primary button `Mitarbeitende erfassen`
- Main table:
  - Columns: Name, Personalnummer, Gesellschaft, Beschaeftigungsgrad, Abteilung, letzte Mutation, Integrationsstatus, Portalstatus
  - Row click opens side panel preview
  - Mass-action bar for export, resync, assign manager
- Right side panel preview:
  - Personal details
  - Active employments
  - Current salary basis summary
  - Coverage badges `KTG`, `UVG BU`, `UVG NBU`
  - Open data-quality warnings

### Screen: Employee Detail

- Header:
  - Full name, personnel number, masked AHV, preferred language, active status
  - Quick actions: `Bearbeiten`, `Integration erneut synchronisieren`, `Portal einladen`
- Tabs:
  - `Stammdaten`
  - `Anstellungen`
  - `Salaerhistorie`
  - `Deckungen`
  - `Einwilligungen`
  - `Audit Trail`
- `Stammdaten` tab:
  - Two-column form with personal data on the left, contact and portal data on the right
  - Badge if fields are integration-controlled and read-only
- `Anstellungen` tab:
  - Timeline cards per contract with legal entity, manager, org unit, work pattern, working time model, start/end dates
  - Inline warning banner for overlapping or suspicious FTE
- `Salaerhistorie` tab:
  - Effective-date table
  - Formula preview card showing insured salary preview with full inputs
  - Delta highlight when latest import changed salary basis
- `Deckungen` tab:
  - Policy-linked coverage table with start/end dates and salary basis rule version
- `Audit Trail` tab:
  - Chronological event list with actor, source, before/after diff, correlation id

### Screen: Integration Error Inbox

- Filter by connector, entity type, severity, retry status
- Error row shows external id, failed field, last payload timestamp, retry count
- Detail drawer includes field-level mapping diagnostics and `Erneut verarbeiten` action

## Integration Spec

Phase 1 prioritises:

1. Abacus AbaHR / AbaSalary
2. SAP SuccessFactors Employee Central
3. Personio
4. Manual CSV or SFTP fallback

### Abacus AbaHR / AbaSalary

- Direction:
  - Inbound employee, employment, salary master data
  - Outbound optional reconciliation acknowledgements
- Sync frequency:
  - Initial full load
  - Delta sync every 15 minutes
  - Manual rerun on demand
- Field mapping:
  - `MitarbeiterNr -> employee.personnel_number`
  - `AHVNr -> employee.ahv_number_ciphertext/hash`
  - `Vorname/Nachname -> employee.first_name/last_name`
  - `Eintritt/Austritt -> employment_contract.start_date/end_date`
  - `Pensum -> employment_contract.employment_percentage`
  - `Monatslohn/Jahreslohn -> salary_record.base_salary_amount`
  - `Kostenstelle -> org_unit(type=cost_centre)`
- Error handling:
  - Reject malformed AHV and invalid dates
  - Park record in `ImportErrorQueue`
  - Preserve original payload and correlation id

### SAP SuccessFactors Employee Central

- Direction:
  - Inbound biographical and employment events
  - Inbound compensation snapshots
- Sync frequency:
  - Event-driven via webhook where available
  - Nightly reconciliation full scan
- Field mapping:
  - `personIdExternal -> employee.external_person_id`
  - `userId -> employee_external_mapping.external_id`
  - `startDate/endDate -> employment_contract.start_date/end_date`
  - `standardHours -> employment_contract.weekly_hours`
  - `payGrade/payComponentRecurring -> salary_record.*`
  - `division/department -> org_unit`
- Error handling:
  - Idempotent replay by external version
  - Compensation rows with unsupported currencies are quarantined

### Personio

- Direction:
  - Inbound employee core data, team, supervisor, salary
- Sync frequency:
  - Poll every 30 minutes
  - Full validation nightly
- Field mapping:
  - `employee_id -> employee_external_mapping.external_id`
  - `first_name/last_name -> employee`
  - `email -> employee.work_email`
  - `team -> org_unit(type=department)`
  - `supervisor -> employment_contract.manager_employee_id`
  - `fixed_salary -> salary_record.base_salary_amount`
- Error handling:
  - Missing manager references accepted temporarily and repaired on next sync
  - Deleted remote records mapped to local inactive status, not hard delete

### Manual CSV / SFTP Fallback

- Direction:
  - Inbound only
- Sync frequency:
  - Client-driven batch upload
- Required columns:
  - Legal entity
  - Personnel number
  - First and last name
  - Date of birth
  - AHV number
  - Employment percentage
  - Salary amount
  - Salary model
  - Contract start date
- Error handling:
  - File-level validation report
  - Row-level errors downloadable by HR

## Critical Test Cases

### Happy Path

1. Create employee manually with one active contract and one salary row.
2. Import employee from Abacus and map to existing local employee by personnel number.
3. Add second concurrent contract for same employee under another legal entity.
4. Generate insured salary preview with 13th month included.

### Validation And Edge Cases

1. Reject overlapping salary periods for same contract.
2. Reject duplicate AHV within same tenant.
3. Accept same AHV across tenants only if business policy explicitly allows cross-tenant shared insured person handling, otherwise reject.
4. Raise warning when aggregate FTE exceeds threshold but still persist if client allows multiple contracts.
5. Create retroactive salary correction and confirm prior salary row remains immutable.
6. Quarantine import row with malformed AHV and expose it in error inbox.
7. Quarantine unsupported compensation currency from SuccessFactors.
8. End-date contract and ensure employee active flag remains true if another contract is still active.

### Audit And Compliance

1. Log before/after diff for every PATCH on employee.
2. Log purpose and actor for AHV access.
3. Export employee record for data-subject request excluding legally blocked case-retention data outside this module.
4. Record consent grant and withdrawal with immutable timestamps.

## Exit Criteria For Module 1

- Employee master data can be created manually or via integration.
- Effective-dated salary history supports later KTG calculations.
- Policy eligibility inputs are stored with auditability.
- Import failures are actionable by HR or operations.
- API contract is stable enough for portal and integration-gateway consumption.
