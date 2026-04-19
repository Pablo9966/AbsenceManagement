create type uvg_case_type as enum ('bu', 'nbu');
create type uvg_case_status as enum ('reported', 'intake_in_progress', 'under_review', 'awaiting_documents', 'coordinating', 'approved', 'rejected', 'closed');
create type uvg_occupational_context as enum ('occupational', 'non_occupational', 'unknown');
create type uvg_decision_status as enum ('pending', 'approved', 'rejected', 'partially_approved');
create type uvg_coordination_type as enum ('ktg_overlap', 'complementary_uvg', 'benefit_overlap_review');
create type uvg_coordination_status as enum ('not_required', 'open', 'in_review', 'resolved');

create table uvg_cases (
  id text primary key,
  tenant_id text not null,
  employee_id text not null,
  policy_id text not null,
  case_number text not null,
  uvg_case_type uvg_case_type not null,
  case_status uvg_case_status not null,
  accident_date date not null,
  reported_at timestamptz not null,
  reported_by text not null,
  incident_location text not null,
  incident_summary text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  ktg_case_id text,
  coordination_status uvg_coordination_status not null,
  coordination_notes text,
  unique (tenant_id, case_number)
);

create table uvg_accident_intakes (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  reporter_role text not null,
  reporter_user_id text,
  employer_reference text,
  accident_date date not null,
  accident_time text,
  accident_place text not null,
  occupational_context uvg_occupational_context not null,
  accident_description text not null,
  witness_details text,
  police_involved_flag boolean not null,
  submitted_at timestamptz not null
);

create table uvg_injury_records (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  injury_type text not null,
  body_part text not null,
  severity text not null,
  medical_treatment_flag boolean not null,
  hospitalized_flag boolean not null,
  notes text
);

create table uvg_circumstance_records (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  cause_category text not null,
  activity_context text not null,
  third_party_involved_flag boolean not null,
  vehicle_involved_flag boolean not null,
  narrative text not null,
  created_at timestamptz not null
);

create table uvg_document_references (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  document_id text not null,
  document_role text not null,
  linked_at timestamptz not null
);

create table uvg_case_decisions (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  decision_status uvg_decision_status not null,
  decision_reason text not null,
  effective_from date not null,
  effective_to date,
  decided_at timestamptz not null,
  decided_by text not null
);

create table uvg_coordination_records (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  coordination_type uvg_coordination_type not null,
  related_ktg_case_id text,
  overlap_start date,
  overlap_end date,
  coordination_status uvg_coordination_status not null,
  benefit_overlap_flag boolean not null,
  notes text,
  updated_at timestamptz not null
);

create table uvg_accident_report_artifacts (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  report_type text not null,
  file_name text not null,
  storage_reference text not null,
  generated_at timestamptz not null,
  generated_by text not null
);

create table uvg_case_audit_events (
  id text primary key,
  tenant_id text not null,
  uvg_case_id text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  actor_id text not null,
  actor_role text not null,
  correlation_id text,
  payload jsonb not null default '{}'::jsonb
);

create index uvg_cases_tenant_employee_idx on uvg_cases (tenant_id, employee_id);
create index uvg_cases_tenant_status_idx on uvg_cases (tenant_id, case_status);
create index uvg_audit_case_idx on uvg_case_audit_events (tenant_id, uvg_case_id, occurred_at desc);
