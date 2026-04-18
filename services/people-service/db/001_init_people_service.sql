create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type org_unit_type as enum ('department', 'cost_centre', 'location', 'business_unit');
create type tenant_status as enum ('draft', 'active', 'suspended', 'terminated');
create type portal_status as enum ('not_invited', 'invited', 'active', 'locked');
create type contract_type as enum ('permanent', 'fixed_term', 'hourly', 'apprenticeship', 'executive', 'other');
create type work_pattern_type as enum ('full_time', 'part_time', 'shift', 'irregular', 'hourly');
create type working_time_model as enum ('fixed_schedule', 'annualized_hours', 'shift', 'irregular');
create type employment_contract_status as enum ('active', 'terminated', 'suspended', 'on_leave');
create type salary_model as enum ('monthly', 'annual', 'hourly', 'variable');
create type thirteenth_month_rule as enum ('not_included', 'included_in_base', 'paid_separately');
create type coverage_type as enum ('ktg', 'uvg_bu', 'uvg_nbu', 'uvg_zusatz');
create type eligibility_status as enum ('eligible', 'waiting_for_policy_sync', 'excluded', 'suspended');
create type integration_direction as enum ('inbound', 'outbound', 'bidirectional');
create type integration_auth_mode as enum ('oauth2', 'basic_auth', 'api_key', 'sftp_key', 'manual_upload');
create type integration_status as enum ('draft', 'active', 'degraded', 'failed', 'paused');
create type change_source as enum ('api', 'ui', 'integration', 'batch');
create type change_type as enum ('created', 'updated', 'corrected', 'terminated', 'reactivated', 'merged');
create type consent_type as enum ('employee_portal_access', 'medical_document_processing', 'notifications', 'data_sharing');
create type import_error_status as enum ('open', 'retrying', 'resolved', 'ignored');

create table tenant (
    id uuid primary key default gen_random_uuid(),
    elips_client_number text not null,
    legal_name text not null,
    status tenant_status not null default 'draft',
    default_language varchar(5) not null default 'de-CH',
    country_code char(2) not null default 'CH',
    data_residency char(2) not null default 'CH',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_tenant_client_number unique (elips_client_number),
    constraint ck_tenant_country_code check (country_code = 'CH'),
    constraint ck_tenant_data_residency check (data_residency = 'CH')
);

create table client_legal_entity (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    name text not null,
    uid_number text,
    street text,
    postal_code text,
    city text,
    country_code char(2) not null default 'CH',
    iban text,
    active_from date not null,
    active_to date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_client_legal_entity_name unique (tenant_id, name),
    constraint ck_client_legal_entity_dates check (active_to is null or active_to >= active_from),
    constraint ck_client_legal_entity_uid_number
        check (uid_number is null or uid_number ~ '^CHE-[0-9]{3}\.[0-9]{3}\.[0-9]{3}$')
);

create table org_unit (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    legal_entity_id uuid references client_legal_entity(id),
    type org_unit_type not null,
    code text,
    name text not null,
    parent_org_unit_id uuid references org_unit(id),
    valid_from date not null,
    valid_to date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_org_unit_code unique (tenant_id, type, code),
    constraint ck_org_unit_dates check (valid_to is null or valid_to >= valid_from)
);

create table employee (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    personnel_number text not null,
    external_person_id text,
    first_name text not null,
    last_name text not null,
    preferred_name text,
    date_of_birth date not null,
    ahv_number_ciphertext bytea,
    ahv_number_hash text,
    ahv_number_last4 char(4),
    nationality_code char(2),
    work_email text,
    private_email text,
    mobile_phone text,
    preferred_language varchar(5) not null default 'de-CH',
    portal_status portal_status not null default 'not_invited',
    active_flag boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_employee_personnel_number unique (tenant_id, personnel_number)
);

create unique index uq_employee_ahv_hash
    on employee (tenant_id, ahv_number_hash)
    where ahv_number_hash is not null and deleted_at is null;

create table employment_contract (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    employee_id uuid not null references employee(id),
    legal_entity_id uuid not null references client_legal_entity(id),
    employment_number text not null,
    contract_type contract_type not null,
    work_pattern_type work_pattern_type not null,
    working_time_model working_time_model not null default 'fixed_schedule',
    start_date date not null,
    end_date date,
    employment_percentage numeric(5,2) not null,
    weekly_hours numeric(5,2),
    manager_employee_id uuid references employee(id),
    org_unit_id uuid references org_unit(id),
    payroll_reference text,
    status employment_contract_status not null default 'active',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_employment_number unique (tenant_id, employment_number),
    constraint ck_employment_dates check (end_date is null or end_date >= start_date),
    constraint ck_employment_percentage check (employment_percentage > 0 and employment_percentage <= 100),
    constraint ck_weekly_hours check (weekly_hours is null or weekly_hours > 0)
);

create table salary_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    employment_contract_id uuid not null references employment_contract(id),
    valid_from date not null,
    valid_to date,
    effective_range daterange generated always as (
        daterange(valid_from, coalesce(valid_to + 1, 'infinity'::date), '[)')
    ) stored,
    salary_model salary_model not null,
    base_salary_amount numeric(14,2) not null,
    currency char(3) not null default 'CHF',
    thirteenth_month_rule thirteenth_month_rule not null default 'not_included',
    bonus_target_amount numeric(14,2) not null default 0,
    bonus_insured_flag boolean not null default false,
    allowances_amount numeric(14,2) not null default 0,
    ahv_relevant_salary_amount numeric(14,2),
    fte_reference_percentage numeric(5,2) not null default 100,
    source_event_id uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint ck_salary_record_dates check (valid_to is null or valid_to >= valid_from),
    constraint ck_salary_currency check (currency = 'CHF'),
    constraint ck_base_salary_amount check (base_salary_amount >= 0),
    constraint ck_bonus_target_amount check (bonus_target_amount >= 0),
    constraint ck_allowances_amount check (allowances_amount >= 0),
    constraint ck_fte_reference_percentage check (fte_reference_percentage > 0 and fte_reference_percentage <= 100)
);

alter table salary_record add constraint ex_salary_record_effective_range
    exclude using gist (
        employment_contract_id with =,
        effective_range with &&
    )
    where (deleted_at is null);

create table coverage_eligibility (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    employment_contract_id uuid not null references employment_contract(id),
    policy_id text not null,
    coverage_type coverage_type not null,
    insured_from date not null,
    insured_to date,
    insured_range daterange generated always as (
        daterange(insured_from, coalesce(insured_to + 1, 'infinity'::date), '[)')
    ) stored,
    eligibility_status eligibility_status not null default 'waiting_for_policy_sync',
    occupation_class text,
    risk_group text,
    salary_basis_rule_version text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint ck_coverage_eligibility_dates check (insured_to is null or insured_to >= insured_from)
);

alter table coverage_eligibility add constraint ex_coverage_eligibility_range
    exclude using gist (
        employment_contract_id with =,
        policy_id with =,
        coverage_type with =,
        insured_range with &&
    )
    where (deleted_at is null);

create table integration_source (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    system_name text not null,
    system_type text not null,
    direction integration_direction not null,
    auth_mode integration_auth_mode not null,
    last_sync_at timestamptz,
    sync_frequency_minutes integer,
    status integration_status not null default 'draft',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_integration_source_name unique (tenant_id, system_name),
    constraint ck_sync_frequency_minutes check (sync_frequency_minutes is null or sync_frequency_minutes > 0)
);

create table employee_external_mapping (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    integration_source_id uuid not null references integration_source(id),
    entity_type text not null,
    local_entity_id uuid not null,
    external_id text not null,
    external_version text,
    last_seen_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint uq_employee_external_mapping unique (tenant_id, integration_source_id, entity_type, external_id)
);

create table master_data_change_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    entity_type text not null,
    entity_id uuid not null,
    change_type change_type not null,
    effective_at timestamptz not null,
    source change_source not null,
    actor_id uuid,
    correlation_id text,
    payload_before jsonb,
    payload_after jsonb,
    created_at timestamptz not null default now()
);

create index ix_master_data_change_event_entity
    on master_data_change_event (tenant_id, entity_type, entity_id, effective_at desc);

create index ix_master_data_change_event_correlation_id
    on master_data_change_event (tenant_id, correlation_id)
    where correlation_id is not null;

create table consent_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    employee_id uuid not null references employee(id),
    consent_type consent_type not null,
    granted_at timestamptz not null,
    revoked_at timestamptz,
    capture_channel text not null,
    policy_version text not null,
    created_at timestamptz not null default now(),
    constraint ck_consent_record_timestamps check (revoked_at is null or revoked_at >= granted_at)
);

create index ix_consent_record_employee on consent_record (tenant_id, employee_id, consent_type, granted_at desc);

create table import_error_queue (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references tenant(id),
    integration_source_id uuid not null references integration_source(id),
    entity_type text not null,
    external_id text not null,
    error_code text not null,
    error_message text not null,
    raw_payload jsonb,
    retry_count integer not null default 0,
    status import_error_status not null default 'open',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    resolved_at timestamptz
);

create index ix_employee_list on employee (tenant_id, last_name, first_name) where deleted_at is null;
create index ix_employee_active on employee (tenant_id) where active_flag = true and deleted_at is null;
create index ix_employment_contract_employee on employment_contract (tenant_id, employee_id) where deleted_at is null;
create index ix_salary_record_contract on salary_record (tenant_id, employment_contract_id, valid_from desc) where deleted_at is null;
create index ix_coverage_eligibility_contract on coverage_eligibility (tenant_id, employment_contract_id, insured_from desc) where deleted_at is null;
create index ix_import_error_queue_status on import_error_queue (tenant_id, integration_source_id, status, created_at desc);
create index ix_import_error_queue_external_id on import_error_queue (tenant_id, integration_source_id, external_id);
