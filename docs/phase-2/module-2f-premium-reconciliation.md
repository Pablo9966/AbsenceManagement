# Phase 2F: Premium Reconciliation

Phase 2F adds `services/premium-reconciliation-service` as the finance/reconciliation operational domain for employer premium workflows.

## Service Boundary

`premium-reconciliation-service` owns:

- premium reporting periods
- salary mass report submission workflow
- salary mass report lines when line-level reporting is supplied
- premium exposure snapshots and claims ratio views
- premium adjustment calculations
- refund, invoice, and carry-forward settlement recommendations
- installment plan visibility
- employer premium dashboard snapshots
- premium reconciliation audit events

It does not own people master data, benefit calculation truth, KTG/UVG case truth, ERP invoice settlement, or payment/disbursement truth. It stores finance-facing reconciliation outputs derived from submitted salary mass and explicit upstream exposure inputs.

## Runtime/API Surface

The standalone service exposes:

- `POST /v1/premium/periods`
- `GET /v1/premium/periods`
- `POST /v1/premium/salary-mass-reports`
- `GET /v1/premium/salary-mass-reports`
- `GET /v1/premium/salary-mass-reports/{reportId}`
- `POST /v1/premium/salary-mass-reports/{reportId}/submit`
- `POST /v1/premium/adjustments/calculate`
- `GET /v1/premium/adjustments`
- `GET /v1/premium/adjustments/{calculationId}`
- `POST /v1/premium/adjustments/{calculationId}/recommendation`
- `GET /v1/premium/recommendations/{recommendationId}`
- `POST /v1/premium/installment-plans`
- `GET /v1/premium/installment-plans`
- `GET /v1/premium/installment-plans/{planId}`
- `GET /v1/premium/dashboard`
- `GET /v1/premium/audit-events`

The OpenAPI contract is maintained in `services/premium-reconciliation-service/openapi.yaml`.

## Employer Portal Routes

Employer finance users use:

- `/[locale]/premium`

The page includes:

- reporting period and salary mass submission status
- insured salary mass
- claims ratio
- expected premium
- adjustment delta and adjustment type
- salary mass submission form
- premium adjustment calculation form
- refund/additional invoice recommendation action
- installment plan creation and visibility

## Calculation Model

Premium adjustment calculation uses explicit salary mass and exposure inputs:

`delta_amount_chf = insured_salary_mass_chf * premium_rate - prior_premium_chf`

The calculation stores:

- formula
- inputs JSON
- prior premium
- recalculated premium
- delta amount
- adjustment type

Adjustment type is explicit:

- positive delta: `additional_invoice`
- negative delta: `refund`
- zero delta: `no_adjustment`

Premium exposure stores claims paid, optional claims reserved, premium rate, expected premium, and claims ratio. These values are passed as exposure inputs from upstream case/benefit/payment outputs; this service does not invent benefit truth.

## Known Technical Debt

- The service runtime currently uses an in-memory repository adapter for local/test execution. SQL schema exists, but a production persistence adapter is still required.
- Employer portal premium workflow is implemented as one finance page. It can be split into separate detail routes later if UX complexity grows.
- Upstream people-service and benefit-engine integration is represented by explicit input contracts in this slice. Live service-to-service reads remain future hardening.
