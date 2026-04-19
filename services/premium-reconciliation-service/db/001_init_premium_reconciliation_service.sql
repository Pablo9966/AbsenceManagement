create type premium_period_type as enum ('annual', 'monthly', 'correction');
create type premium_reporting_status as enum ('draft', 'submitted', 'under_review', 'reconciled', 'closed');
create type salary_mass_report_status as enum ('draft', 'submitted', 'validated', 'rejected');
create type premium_snapshot_status as enum ('draft', 'calculated', 'published');
create type premium_adjustment_status as enum ('draft', 'calculated', 'approved', 'superseded');
create type premium_adjustment_type as enum ('refund', 'additional_invoice', 'no_adjustment');
create type premium_recommendation_type as enum ('refund', 'invoice', 'carry_forward');
create type premium_installment_plan_status as enum ('draft', 'active', 'completed', 'cancelled');
create type premium_installment_status as enum ('scheduled', 'due', 'paid', 'overdue', 'cancelled');

create table premium_reporting_periods (
  id text primary key,
  tenant_id text not null,
  period_start date not null,
  period_end date not null,
  reporting_year int not null,
  reporting_month int,
  period_type premium_period_type not null,
  reporting_status premium_reporting_status not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  submitted_at timestamptz,
  submitted_by text
);

create table salary_mass_reports (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text not null,
  report_status salary_mass_report_status not null,
  currency text not null,
  annual_salary_mass_chf numeric(14,2) not null,
  insured_salary_mass_chf numeric(14,2) not null,
  employee_count int not null,
  submission_source text not null,
  submitted_at timestamptz not null,
  submitted_by text not null,
  notes text
);

create table salary_mass_report_lines (
  id text primary key,
  tenant_id text not null,
  salary_mass_report_id text not null,
  employee_reference text not null,
  contract_reference text,
  employment_percentage numeric(6,2) not null,
  annual_salary_chf numeric(14,2) not null,
  insured_salary_chf numeric(14,2) not null,
  salary_category text not null,
  line_status text not null,
  validation_notes text
);

create table premium_exposure_snapshots (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text not null,
  exposure_basis text not null,
  insured_salary_mass_chf numeric(14,2) not null,
  claims_paid_chf numeric(14,2) not null,
  claims_reserved_chf numeric(14,2),
  claims_ratio numeric(12,6) not null,
  premium_rate_applied numeric(12,6) not null,
  expected_premium_chf numeric(14,2) not null,
  snapshot_status premium_snapshot_status not null,
  created_at timestamptz not null
);

create table premium_adjustment_calculations (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text not null,
  salary_mass_report_id text not null,
  adjustment_status premium_adjustment_status not null,
  prior_premium_chf numeric(14,2) not null,
  recalculated_premium_chf numeric(14,2) not null,
  delta_amount_chf numeric(14,2) not null,
  adjustment_type premium_adjustment_type not null,
  formula text not null,
  inputs_json jsonb not null,
  calculated_at timestamptz not null
);

create table premium_settlement_recommendations (
  id text primary key,
  tenant_id text not null,
  premium_adjustment_calculation_id text not null,
  recommendation_type premium_recommendation_type not null,
  gross_amount_chf numeric(14,2) not null,
  net_amount_chf numeric(14,2) not null,
  vat_amount_chf numeric(14,2),
  settlement_reason text not null,
  installment_eligible_flag boolean not null,
  created_at timestamptz not null
);

create table premium_installment_plans (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text not null,
  plan_status premium_installment_plan_status not null,
  installment_count int not null,
  total_amount_chf numeric(14,2) not null,
  start_date date not null,
  end_date date,
  created_at timestamptz not null
);

create table premium_installment_items (
  id text primary key,
  tenant_id text not null,
  premium_installment_plan_id text not null,
  due_date date not null,
  amount_chf numeric(14,2) not null,
  installment_status premium_installment_status not null,
  paid_at timestamptz,
  reference text
);

create table employer_premium_dashboard_snapshots (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text not null,
  exposure_status text not null,
  claims_ratio numeric(12,6) not null,
  expected_premium_chf numeric(14,2) not null,
  adjustment_delta_chf numeric(14,2) not null,
  open_installment_amount_chf numeric(14,2) not null,
  snapshot_payload_json jsonb not null,
  created_at timestamptz not null
);

create table premium_reconciliation_audit_events (
  id text primary key,
  tenant_id text not null,
  premium_reporting_period_id text,
  salary_mass_report_id text,
  event_type text not null,
  occurred_at timestamptz not null,
  actor_id text not null,
  actor_role text not null,
  correlation_id text,
  payload jsonb not null
);
