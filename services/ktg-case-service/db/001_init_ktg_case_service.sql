create extension if not exists pgcrypto;

create type ktg_case_status as enum ('suggested', 'draft', 'submitted', 'in_review', 'benefit_active', 'closed', 'rejected');
create type submission_readiness_status as enum ('not_ready', 'ready', 'blocked');
create type case_actor_role as enum ('hr_manager', 'claims_handler', 'account_manager', 'system', 'api');
create type submission_validation_status as enum ('valid', 'warning', 'blocked');
create type correspondence_channel as enum ('portal', 'email', 'api', 'claims_system');
create type deadline_type as enum ('case_submission', 'certificate_renewal', 'reintegration_touchpoint', 'hr_follow_up', 'claims_reply', 'benefit_review');
create type deadline_counting_method as enum ('calendar_days', 'working_days');
create type deadline_escalation_status as enum ('not_escalated', 'escalated', 'resolved');
create type task_type as enum ('submit_case', 'request_certificate', 'review_claims_reply', 'prepare_return_to_work', 'follow_up_employer', 'manual');
create type task_status as enum ('open', 'in_progress', 'completed', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type note_visibility as enum ('shared_hr_claims', 'elips_internal', 'system_internal');
create type decision_status as enum ('accepted', 'partially_accepted', 'rejected', 'suspended', 'closed_without_payment');
create type case_status_event_type as enum ('suggested', 'drafted', 'submitted', 'submission_blocked', 'in_review', 'benefit_activated', 'closed', 'rejected', 'corrected', 'relapse_linked');

create table ktg_case (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    case_number text not null,
    employee_id uuid not null,
    policy_id text not null,
    status ktg_case_status not null default 'suggested',
    submission_readiness_status submission_readiness_status not null default 'not_ready',
    benefit_start_date date,
    claims_system_case_id text,
    relapse_of_case_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_ktg_case_case_number unique (tenant_id, case_number),
    constraint uq_ktg_case_tenant_id_id unique (tenant_id, id),
    constraint fk_ktg_case_relapse_of_case
        foreign key (tenant_id, relapse_of_case_id) references ktg_case(tenant_id, id)
);

create unique index uq_ktg_case_claims_system_case_id
    on ktg_case (tenant_id, claims_system_case_id)
    where claims_system_case_id is not null and deleted_at is null;

create table ktg_case_absence_link (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    absence_episode_id uuid not null,
    is_originating_episode boolean not null default false,
    linked_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint uq_ktg_case_absence_link unique (ktg_case_id, absence_episode_id),
    constraint fk_ktg_case_absence_link_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id)
);

create unique index uq_ktg_case_originating_episode
    on ktg_case_absence_link (ktg_case_id)
    where is_originating_episode = true;

create table ktg_case_coverage_snapshot (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    policy_id text not null,
    coverage_percentage numeric(5,2) not null,
    wartezeit_days integer not null,
    leistungsdauer_days integer not null,
    lohnfortzahlung_days integer not null,
    salary_formula_version text not null,
    insured_salary_snapshot_id uuid,
    insured_salary_amount_chf numeric(14,2),
    insured_salary_formula text,
    insured_salary_inputs jsonb,
    first_day_of_incapacity date not null,
    captured_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint uq_ktg_case_coverage_snapshot_case unique (ktg_case_id),
    constraint fk_ktg_case_coverage_snapshot_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id),
    constraint ck_ktg_case_coverage_snapshot_coverage_percentage check (coverage_percentage > 0 and coverage_percentage <= 100),
    constraint ck_ktg_case_coverage_snapshot_wartezeit_days check (wartezeit_days >= 0),
    constraint ck_ktg_case_coverage_snapshot_leistungsdauer_days check (leistungsdauer_days > 0),
    constraint ck_ktg_case_coverage_snapshot_lohnfortzahlung_days check (lohnfortzahlung_days >= 0),
    constraint ck_ktg_case_coverage_snapshot_insured_salary_amount check (insured_salary_amount_chf is null or insured_salary_amount_chf >= 0)
);

create table ktg_case_submission (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    submitted_at timestamptz not null,
    submitted_by uuid,
    validation_result submission_validation_status not null,
    external_claims_system_id text,
    correspondence_channel correspondence_channel not null,
    payload_snapshot jsonb not null,
    created_at timestamptz not null default now(),
    constraint fk_ktg_case_submission_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id)
);

create unique index uq_ktg_case_submission_external_claims_system_id
    on ktg_case_submission (tenant_id, external_claims_system_id)
    where external_claims_system_id is not null;

create table ktg_deadline (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    deadline_type deadline_type not null,
    due_at timestamptz not null,
    counting_method deadline_counting_method not null,
    responsible_role case_actor_role not null,
    escalation_status deadline_escalation_status not null default 'not_escalated',
    completed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_ktg_deadline_tenant_id_id unique (tenant_id, id),
    constraint fk_ktg_deadline_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id),
    constraint ck_ktg_deadline_completed_at check (completed_at is null or completed_at >= created_at)
);

create table ktg_task (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    deadline_id uuid,
    task_type task_type not null,
    status task_status not null default 'open',
    priority task_priority not null default 'medium',
    assignee_id uuid,
    due_at timestamptz,
    completed_at timestamptz,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_ktg_task_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id),
    constraint fk_ktg_task_deadline
        foreign key (tenant_id, deadline_id) references ktg_deadline(tenant_id, id),
    constraint ck_ktg_task_completed_at check (completed_at is null or completed_at >= created_at)
);

create table ktg_case_note (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    author_id uuid,
    author_role case_actor_role not null,
    visibility note_visibility not null,
    message text not null,
    created_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint fk_ktg_case_note_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id),
    constraint ck_ktg_case_note_message check (length(trim(message)) > 0)
);

create table ktg_case_decision (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    decision_status decision_status not null,
    reason_code text,
    reason_text text,
    effective_from date,
    effective_to date,
    decision_at timestamptz not null,
    daily_allowance_amount_chf numeric(14,2) not null,
    payment_run_id uuid,
    created_at timestamptz not null default now(),
    constraint fk_ktg_case_decision_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id),
    constraint ck_ktg_case_decision_effective_dates check (effective_to is null or effective_from is null or effective_to >= effective_from),
    constraint ck_ktg_case_decision_daily_allowance_amount check (daily_allowance_amount_chf >= 0)
);

create table ktg_case_status_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    from_status ktg_case_status,
    to_status ktg_case_status not null,
    event_type case_status_event_type not null,
    event_at timestamptz not null,
    actor_id uuid,
    actor_role case_actor_role not null,
    correlation_id text,
    payload jsonb,
    created_at timestamptz not null default now(),
    constraint fk_ktg_case_status_event_case
        foreign key (tenant_id, ktg_case_id) references ktg_case(tenant_id, id)
);

create index ix_ktg_case_employee on ktg_case (tenant_id, employee_id, created_at desc) where deleted_at is null;
create index ix_ktg_case_status on ktg_case (tenant_id, status, created_at desc) where deleted_at is null;
create index ix_ktg_case_relapse on ktg_case (tenant_id, relapse_of_case_id) where relapse_of_case_id is not null and deleted_at is null;
create index ix_ktg_case_absence_link_case on ktg_case_absence_link (tenant_id, ktg_case_id, linked_at desc);
create index ix_ktg_case_absence_link_episode on ktg_case_absence_link (tenant_id, absence_episode_id, linked_at desc);
create index ix_ktg_case_submission_case on ktg_case_submission (tenant_id, ktg_case_id, submitted_at desc);
create index ix_ktg_deadline_case on ktg_deadline (tenant_id, ktg_case_id, due_at);
create index ix_ktg_deadline_open on ktg_deadline (tenant_id, escalation_status, due_at) where completed_at is null;
create index ix_ktg_task_case on ktg_task (tenant_id, ktg_case_id, status, due_at);
create index ix_ktg_case_note_case on ktg_case_note (tenant_id, ktg_case_id, created_at desc) where deleted_at is null;
create index ix_ktg_case_decision_case on ktg_case_decision (tenant_id, ktg_case_id, decision_at desc);
create index ix_ktg_case_status_event_case on ktg_case_status_event (tenant_id, ktg_case_id, event_at desc);
create index ix_ktg_case_status_event_correlation_id on ktg_case_status_event (tenant_id, correlation_id) where correlation_id is not null;
