create extension if not exists pgcrypto;

create type absence_type as enum ('ktg_sickness', 'uvg_bu', 'uvg_nbu', 'eo_maternity', 'eo_military', 'other_leave');
create type absence_status as enum ('reported', 'acknowledged', 'in_progress', 'partially_returned', 'closed', 'cancelled');
create type absence_source as enum ('employee_portal', 'hr_portal', 'line_manager', 'integration', 'api', 'batch');
create type absence_actor_role as enum ('employee', 'hr_manager', 'payroll_manager', 'line_manager', 'system');
create type comment_visibility as enum ('hr_internal', 'manager_visible', 'employee_visible', 'system_internal');
create type recurrence_link_basis as enum ('same_condition_reported', 'manual_linked', 'claims_linked');
create type recurrence_status as enum ('open', 'closed');
create type status_event_type as enum (
    'reported',
    'acknowledged',
    'started',
    'partially_returned',
    'closed',
    'cancelled',
    'reopened',
    'relapse_linked',
    'corrected'
);
create type absence_working_time_model as enum ('fixed_schedule', 'annualized_hours', 'shift', 'irregular');

create table absence_recurrence_group (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    recurrence_basis recurrence_link_basis not null,
    initial_episode_id uuid,
    status recurrence_status not null default 'open',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_absence_recurrence_group_tenant_id_id unique (tenant_id, id)
);

create table absence_episode (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    employee_id uuid not null,
    primary_absence_type absence_type not null,
    source absence_source not null,
    reported_at timestamptz not null,
    reported_by_user_id uuid,
    reported_by_role absence_actor_role not null,
    start_date date not null,
    first_day_of_incapacity date,
    expected_end_date date,
    actual_end_date date,
    status absence_status not null default 'reported',
    reason_category text,
    reason_subcategory text,
    line_manager_ack_required boolean not null default false,
    line_manager_acknowledged_at timestamptz,
    recurrence_group_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_absence_episode_tenant_id_id unique (tenant_id, id),
    constraint fk_absence_episode_recurrence_group
        foreign key (tenant_id, recurrence_group_id) references absence_recurrence_group(tenant_id, id),
    constraint ck_absence_episode_first_day_of_incapacity
        check (first_day_of_incapacity is null or first_day_of_incapacity <= start_date),
    constraint ck_absence_episode_first_day_of_incapacity_required_for_ktg
        check (primary_absence_type <> 'ktg_sickness' or first_day_of_incapacity is not null),
    constraint ck_absence_episode_expected_end_date
        check (expected_end_date is null or expected_end_date >= start_date),
    constraint ck_absence_episode_actual_end_date
        check (actual_end_date is null or actual_end_date >= start_date)
);

alter table absence_recurrence_group
    add constraint fk_absence_recurrence_group_initial_episode
    foreign key (tenant_id, initial_episode_id) references absence_episode(tenant_id, id);

create table absence_contract_impact (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    episode_id uuid not null,
    employment_contract_id uuid not null,
    affected_employment_percentage numeric(5,2) not null,
    employment_percentage_snapshot numeric(5,2) not null,
    working_time_model absence_working_time_model not null,
    scheduled_hours_per_week_snapshot numeric(5,2),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_absence_contract_impact unique (episode_id, employment_contract_id),
    constraint uq_absence_contract_impact_tenant_id_id unique (tenant_id, id),
    constraint fk_absence_contract_impact_episode
        foreign key (tenant_id, episode_id) references absence_episode(tenant_id, id),
    constraint ck_absence_contract_impact_affected_percentage
        check (affected_employment_percentage > 0 and affected_employment_percentage <= 100),
    constraint ck_absence_contract_impact_employment_snapshot
        check (employment_percentage_snapshot > 0 and employment_percentage_snapshot <= 100),
    constraint ck_absence_contract_impact_scheduled_hours
        check (scheduled_hours_per_week_snapshot is null or scheduled_hours_per_week_snapshot > 0)
);

create table absence_daily_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    episode_id uuid not null,
    contract_impact_id uuid not null,
    employee_id uuid not null,
    employment_contract_id uuid not null,
    absence_date date not null,
    incapacity_percentage numeric(5,2) not null,
    partial_day_percentage numeric(5,2) not null default 100,
    scheduled_work_minutes integer,
    lost_work_minutes integer,
    certified_flag boolean not null default false,
    certificate_reference_id uuid,
    return_to_work_flag boolean not null default false,
    coordinated_overlap_flag boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_absence_daily_record_by_impact unique (contract_impact_id, absence_date),
    constraint fk_absence_daily_record_episode
        foreign key (tenant_id, episode_id) references absence_episode(tenant_id, id),
    constraint fk_absence_daily_record_contract_impact
        foreign key (tenant_id, contract_impact_id) references absence_contract_impact(tenant_id, id),
    constraint ck_absence_daily_record_incapacity
        check (incapacity_percentage > 0 and incapacity_percentage <= 100),
    constraint ck_absence_daily_record_partial_day
        check (partial_day_percentage > 0 and partial_day_percentage <= 100),
    constraint ck_absence_daily_record_scheduled_minutes
        check (scheduled_work_minutes is null or scheduled_work_minutes > 0),
    constraint ck_absence_daily_record_lost_minutes
        check (lost_work_minutes is null or lost_work_minutes >= 0),
    constraint ck_absence_daily_record_minutes_consistency
        check (
            scheduled_work_minutes is null
            or lost_work_minutes is null
            or lost_work_minutes <= scheduled_work_minutes
        )
);

create unique index uq_absence_daily_record_non_overlapping
    on absence_daily_record (tenant_id, employee_id, employment_contract_id, absence_date)
    where coordinated_overlap_flag = false and deleted_at is null;

create table absence_status_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    episode_id uuid not null,
    from_status absence_status,
    to_status absence_status not null,
    event_type status_event_type not null,
    event_at timestamptz not null,
    actor_id uuid,
    actor_role absence_actor_role not null,
    correlation_id text,
    payload jsonb,
    created_at timestamptz not null default now(),
    constraint fk_absence_status_event_episode
        foreign key (tenant_id, episode_id) references absence_episode(tenant_id, id)
);

create table absence_comment (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    episode_id uuid not null,
    author_id uuid,
    author_role absence_actor_role not null,
    visibility comment_visibility not null,
    message text not null,
    created_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint fk_absence_comment_episode
        foreign key (tenant_id, episode_id) references absence_episode(tenant_id, id),
    constraint ck_absence_comment_message check (length(trim(message)) > 0)
);

create index ix_absence_episode_employee
    on absence_episode (tenant_id, employee_id, start_date desc)
    where deleted_at is null;

create index ix_absence_episode_status
    on absence_episode (tenant_id, status, start_date desc)
    where deleted_at is null;

create index ix_absence_episode_recurrence_group
    on absence_episode (tenant_id, recurrence_group_id)
    where recurrence_group_id is not null and deleted_at is null;

create index ix_absence_contract_impact_episode
    on absence_contract_impact (tenant_id, episode_id)
    where deleted_at is null;

create index ix_absence_daily_record_episode
    on absence_daily_record (tenant_id, episode_id, absence_date)
    where deleted_at is null;

create index ix_absence_daily_record_employee_contract_date
    on absence_daily_record (tenant_id, employee_id, employment_contract_id, absence_date)
    where deleted_at is null;

create index ix_absence_status_event_episode
    on absence_status_event (tenant_id, episode_id, event_at desc);

create index ix_absence_status_event_correlation_id
    on absence_status_event (tenant_id, correlation_id)
    where correlation_id is not null;

create index ix_absence_comment_episode
    on absence_comment (tenant_id, episode_id, created_at desc)
    where deleted_at is null;
