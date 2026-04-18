# Module 07: Daily Allowance Calculation Engine

## Scope

This module provides the monetary calculation truth for Swiss KTG Taggeld. It owns immutable calculation versions, insured salary snapshots, coordination windows such as `Lohnfortzahlung`, entitlement periods, daily breakdowns, payment-routing outputs, and `Taggelddispositiv` snapshots. It does not own KTG case lifecycle truth, intake workflow truth, or finance disbursement truth.

## Approved Data Model

### Core Entities

- `BenefitCaseCalculation`
- `InsuredSalarySnapshot`
- `CoordinationWindow`
- `BenefitEntitlementPeriod`
- `BenefitDayBreakdown`
- `BenefitAdjustment`
- `PaymentInstruction`
- `TaggelddispositivSnapshot`
- `CalculationAuditEvent`

## Relationship Summary

- One `ktg_case_id` can have many immutable `BenefitCaseCalculation` versions.
- One calculation has exactly one `InsuredSalarySnapshot`.
- One calculation can have many `CoordinationWindow`, `BenefitEntitlementPeriod`, `BenefitAdjustment`, `PaymentInstruction`, and `CalculationAuditEvent` rows.
- One entitlement period can have many `BenefitDayBreakdown` rows.
- One payment instruction can have one `TaggelddispositivSnapshot`.

## PostgreSQL Design Notes

- Tenant isolation is reinforced in persistence with `(tenant_id, id)` composite foreign keys on all local relationships.
- `InsuredSalarySnapshot` is enforced as one-to-one with `BenefitCaseCalculation` through a unique constraint on `benefit_case_calculation_id`.
- Calculation outputs are append-only in Phase 1. Recalculation creates a new `BenefitCaseCalculation`; prior calculation versions become `superseded`.
- `formula` and `inputs_json` are mandatory wherever transparency is claimed.

## API Design

### Main Endpoints

- `POST /v1/tenants/{tenantId}/benefit-calculations`
- `GET /v1/tenants/{tenantId}/benefit-calculations`
- `GET /v1/tenants/{tenantId}/benefit-calculations/{calculationId}`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/insured-salary-snapshot`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/coordination-windows`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/entitlement-periods`
- `POST /v1/tenants/{tenantId}/benefit-entitlement-periods/{periodId}/day-breakdowns`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/adjustments`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/payment-instructions`
- `POST /v1/tenants/{tenantId}/payment-instructions/{paymentInstructionId}/taggelddispositive`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/approve-for-payment`
- `POST /v1/tenants/{tenantId}/benefit-calculations/{calculationId}/supersede`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived outputs are:

- `insured_salary_transparency`
- `daily_allowance_rate_transparency`
- `period_payable_amount_transparency`
- `routing_transparency`

## Business Logic

### Core Rules

- `benefit-engine-service` owns monetary calculation truth only.
- Once a calculation reaches `calculated` or `approved_for_payment`, child records are treated as immutable.
- Salary normalization must annualize monthly salary before applying policy rules.
- `CoordinationWindow` supports segmented `Lohnfortzahlung` and other non-payable coordination windows.
- `PaymentInstruction` is a handoff artifact for downstream finance integration, not the disbursement source of truth.

### Transparent Salary Formula

`insured_salary = min(policy_cap, (annual_base_salary + included_13th_month + insured_bonus + insured_allowances)) * employment_percentage / 100`

Inputs returned:

- `salary_model`
- `annual_base_salary`
- `included_13th_month`
- `insured_bonus`
- `insured_allowances`
- `employment_percentage`
- `policy_cap`

### Transparent Daily Allowance Formula

`daily_allowance_rate = insured_salary * coverage_percentage / 100 / annual_divisor`

Inputs returned:

- `insured_salary`
- `coverage_percentage`
- `annual_divisor`

### Transparent Period Amount Formula

`payable_amount = sum(net_daily_allowance for payable days in period)`

Inputs returned:

- `payable_day_count`
- `gross_amount`
- `deduction_amount`
- `period_type`

### Transparent Routing Formula

`route_to = employer if salary_continuation_active else employee unless override`

Inputs returned:

- `salary_continuation_active_flag`
- `payee_type`
- `payment_route_reason`
- `payee_reference`

## UI Wireframe Description

### Screen: Benefit Calculation Workspace

- Header:
  - KTG fall number, employee, policy, calculation status, calculation reason
  - Primary actions `Berechnen`, `Zur Zahlung freigeben`, `Neu berechnen`
- Summary cards:
  - `versicherter Jahreslohn`
  - `Taggeldsatz pro Tag`
  - `verbrauchte Leistungstage`
  - `verbleibende Leistungstage`
- Main split layout:
  - Left pane `Koordinationsfenster` and `Entitlement periods`
  - Right pane formula inspector with exact inputs and resulting values

### Screen: Day Breakdown Detail

- Table:
  - `Datum`, `Absenzquelle`, `Arbeitsunfaehigkeit %`, `Tageslohn`, `Deckung %`, `Brutto`, `Abzug`, `Netto`, `zahlbar`
- Row drill-down:
  - source reference JSON
  - coordination window references
  - formula and inputs used

### Screen: Payment Instruction And Taggelddispositiv

- Top summary:
  - payee, routing reason, payment period, gross and net amount
- Tabs:
  - `Zahlungsinstruktion`
  - `Taggelddispositiv`
  - `Audit`
- `Taggelddispositiv` tab:
  - downloadable statement payload preview for HR and payroll

## Integration Spec

Phase 1 priorities for this module:

1. `ktg-case-service`
2. `people-service`
3. `absence-service`
4. finance / ERP handoff

### ktg-case-service

- Direction:
  - Inbound read model
- Usage:
  - coverage snapshot, case decision context, payment-run anchor compatibility

### people-service

- Direction:
  - Inbound read model
- Usage:
  - salary history, employment percentage, insured salary basis inputs

### absence-service

- Direction:
  - Inbound read model
- Usage:
  - incapacity percentages and source absence traceability

### Finance / ERP

- Direction:
  - Outbound instruction handoff
- Usage:
  - export `PaymentInstruction` and `TaggelddispositivSnapshot`

## Critical Test Cases

### Happy Path

1. Create an initial calculation for a KTG case with monthly salary and 13th month inclusion.
2. Freeze insured salary and segmented coordination windows.
3. Generate entitlement periods and day breakdown rows.
4. Create a payment instruction routed to the employer and generate the `Taggelddispositiv`.

### Validation And Edge Cases

1. Reject a second salary snapshot for the same calculation.
2. Reject child writes against `superseded` or `approved_for_payment` calculations.
3. Recalculate after a salary change and mark the prior calculation `superseded`.
4. Handle partial incapacity and overlapping coordination windows.
5. Preserve source traceability from day breakdown back to absence references.

### Audit And Traceability

1. Keep formula and inputs on every transparent artifact.
2. Record approval-for-payment and supersede events in `CalculationAuditEvent`.
3. Preserve cumulative benefit-day counters on every calculation version.

## Exit Criteria For Module 7

- Monetary calculation truth is separated from KTG case truth.
- Salary freeze, coordination windows, entitlement periods, and day-level transparency are auditable.
- Payment instructions preserve routing basis and remain external to finance execution truth.
- Recalculation produces a new immutable calculation version instead of mutating the old one.
