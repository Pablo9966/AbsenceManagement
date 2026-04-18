create extension if not exists pgcrypto;

create type document_type as enum (
    'medical_certificate',
    'hospital_discharge',
    'specialist_referral',
    'physio_confirmation',
    'accident_report',
    'other'
);
create type document_category as enum ('health_sensitive', 'claims_correspondence', 'payroll_support', 'administrative');
create type document_source_channel as enum ('employee_portal', 'hr_portal', 'claims_portal', 'integration', 'api', 'batch');
create type document_actor_role as enum ('employee', 'hr_manager', 'claims_handler', 'compliance_user', 'system', 'api');
create type document_status as enum ('uploaded', 'available', 'under_review', 'superseded', 'quarantined', 'deleted');
create type link_target_type as enum ('employee', 'absence_episode', 'absence_daily_record', 'ktg_case', 'uvg_case');
create type extraction_status as enum ('pending', 'extracted', 'reviewed', 'rejected');
create type extraction_job_type as enum ('ocr', 'medical_certificate_extraction', 'virus_scan', 'checksum_verification');
create type extraction_job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');
create type access_type as enum ('view_metadata', 'generate_download', 'download_file', 'view_extraction', 'export_package');
create type access_result as enum ('allowed', 'denied');
create type processing_purpose as enum ('absence_tracking', 'claims_assessment', 'certificate_validation', 'legal_retention', 'data_subject_request');
create type certificate_status as enum ('active', 'expiring', 'expired', 'replaced', 'invalidated');
create type retention_status as enum ('active_retention', 'legal_hold', 'deletion_eligible', 'deleted_retained');

create table document_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    employee_id uuid,
    uploader_user_id uuid,
    uploader_role document_actor_role not null,
    document_type document_type not null,
    document_category document_category not null,
    source_channel document_source_channel not null,
    storage_object_key text not null,
    storage_region text not null default 'CH',
    mime_type text not null,
    file_name text not null,
    file_size_bytes bigint not null,
    checksum_sha256 text not null,
    encryption_key_ref text not null,
    status document_status not null default 'uploaded',
    retention_status retention_status not null default 'active_retention',
    legal_hold_flag boolean not null default false,
    legal_hold_reason text,
    retention_until date,
    retention_policy_code text,
    superseded_by_document_version_id uuid,
    superseded_at timestamptz,
    uploaded_at timestamptz not null,
    deleted_at timestamptz,
    constraint uq_document_record_tenant_id_id unique (tenant_id, id),
    constraint ck_document_record_storage_region check (storage_region = 'CH'),
    constraint ck_document_record_file_size_bytes check (file_size_bytes > 0),
    constraint ck_document_record_checksum_sha256 check (checksum_sha256 ~ '^[A-Fa-f0-9]{64}$'),
    constraint ck_document_record_file_name check (length(trim(file_name)) > 0),
    constraint ck_document_record_storage_object_key check (length(trim(storage_object_key)) > 0),
    constraint ck_document_record_encryption_key_ref check (length(trim(encryption_key_ref)) > 0),
    constraint ck_document_record_legal_hold_reason check (
        legal_hold_flag = false or (legal_hold_reason is not null and length(trim(legal_hold_reason)) > 0)
    ),
    constraint ck_document_record_retention_policy_code check (
        retention_policy_code is null or length(trim(retention_policy_code)) > 0
    ),
    constraint ck_document_record_deleted_at_guardrail check (
        deleted_at is null or (
            legal_hold_flag = false
            and (retention_until is null or deleted_at::date >= retention_until)
        )
    ),
    constraint ck_document_record_superseded_at check (
        superseded_by_document_version_id is null or superseded_at is not null
    )
);

create unique index uq_document_record_checksum_active
    on document_record (tenant_id, checksum_sha256)
    where deleted_at is null;

create table document_link (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    link_target_type link_target_type not null,
    link_target_id uuid not null,
    is_primary boolean not null default false,
    linked_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint uq_document_link_tenant_document_target unique (tenant_id, document_id, link_target_type, link_target_id),
    constraint fk_document_link_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id)
);

create unique index uq_document_link_primary_target
    on document_link (tenant_id, link_target_type, link_target_id)
    where is_primary = true;

create table document_version (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    version_number integer not null,
    storage_object_key text not null,
    checksum_sha256 text not null,
    replaced_document_version_id uuid,
    created_at timestamptz not null default now(),
    constraint uq_document_version_tenant_id_id unique (tenant_id, id),
    constraint uq_document_version_document_version_number unique (tenant_id, document_id, version_number),
    constraint fk_document_version_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id),
    constraint fk_document_version_replaced_version
        foreign key (tenant_id, replaced_document_version_id) references document_version(tenant_id, id),
    constraint ck_document_version_version_number check (version_number > 0),
    constraint ck_document_version_storage_object_key check (length(trim(storage_object_key)) > 0),
    constraint ck_document_version_checksum_sha256 check (checksum_sha256 ~ '^[A-Fa-f0-9]{64}$')
);

alter table document_record
    add constraint fk_document_record_superseded_by_document_version
    foreign key (tenant_id, superseded_by_document_version_id) references document_version(tenant_id, id) deferrable initially deferred;

create table document_extraction_job (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    job_type extraction_job_type not null,
    status extraction_job_status not null default 'pending',
    requested_at timestamptz not null,
    started_at timestamptz,
    completed_at timestamptz,
    provider text,
    raw_result_payload jsonb,
    error_code text,
    error_message text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_document_extraction_job_tenant_id_id unique (tenant_id, id),
    constraint fk_document_extraction_job_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id),
    constraint ck_document_extraction_job_provider check (provider is null or length(trim(provider)) > 0),
    constraint ck_document_extraction_job_error_message check (error_message is null or length(trim(error_message)) > 0),
    constraint ck_document_extraction_job_timestamps check (
        (started_at is null or started_at >= requested_at)
        and (completed_at is null or completed_at >= requested_at)
    )
);

create table medical_certificate_fact (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    absence_episode_id uuid,
    certificate_reference_id uuid not null,
    first_day_of_incapacity date not null,
    certificate_start_date date not null,
    certificate_end_date date,
    incapacity_percentage numeric(5,2) not null,
    issued_on date,
    issuing_provider_name text,
    extraction_status extraction_status not null default 'pending',
    extraction_confidence numeric(5,2),
    review_required_flag boolean not null,
    reviewed_by uuid,
    reviewed_at timestamptz,
    superseded_by_document_version_id uuid,
    superseded_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_medical_certificate_fact_tenant_id_id unique (tenant_id, id),
    constraint uq_medical_certificate_fact_document unique (tenant_id, document_id),
    constraint uq_medical_certificate_fact_certificate_reference unique (tenant_id, certificate_reference_id),
    constraint fk_medical_certificate_fact_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id),
    constraint fk_medical_certificate_fact_superseded_by_document_version
        foreign key (tenant_id, superseded_by_document_version_id) references document_version(tenant_id, id),
    constraint ck_medical_certificate_fact_date_range check (
        certificate_end_date is null or certificate_end_date >= certificate_start_date
    ),
    constraint ck_medical_certificate_fact_first_day_of_incapacity check (
        first_day_of_incapacity <= certificate_start_date
    ),
    constraint ck_medical_certificate_fact_incapacity_percentage check (
        incapacity_percentage > 0 and incapacity_percentage <= 100
    ),
    constraint ck_medical_certificate_fact_extraction_confidence check (
        extraction_confidence is null or (extraction_confidence >= 0 and extraction_confidence <= 1)
    ),
    constraint ck_medical_certificate_fact_issuing_provider_name check (
        issuing_provider_name is null or length(trim(issuing_provider_name)) > 0
    ),
    constraint ck_medical_certificate_fact_superseded_at check (
        superseded_by_document_version_id is null or superseded_at is not null
    )
);

create table certificate_coverage_window (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    absence_episode_id uuid,
    medical_certificate_fact_id uuid not null,
    covered_from date not null,
    covered_to date,
    certificate_status certificate_status not null,
    expiry_alert_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_certificate_coverage_window_fact unique (tenant_id, medical_certificate_fact_id),
    constraint fk_certificate_coverage_window_fact
        foreign key (tenant_id, medical_certificate_fact_id) references medical_certificate_fact(tenant_id, id),
    constraint ck_certificate_coverage_window_dates check (
        covered_to is null or covered_to >= covered_from
    )
);

create table document_access_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    actor_id uuid,
    actor_role document_actor_role not null,
    access_type access_type not null,
    purpose_of_use processing_purpose not null,
    correlation_id text,
    accessed_at timestamptz not null,
    result access_result not null,
    created_at timestamptz not null default now(),
    constraint fk_document_access_event_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id)
);

create table document_consent_reference (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    document_id uuid not null,
    employee_id uuid not null,
    consent_record_id uuid not null,
    processing_purpose processing_purpose not null,
    recorded_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint uq_document_consent_reference unique (tenant_id, document_id, consent_record_id, processing_purpose),
    constraint fk_document_consent_reference_document
        foreign key (tenant_id, document_id) references document_record(tenant_id, id)
);

create index ix_document_record_employee on document_record (tenant_id, employee_id, uploaded_at desc) where deleted_at is null;
create index ix_document_record_status on document_record (tenant_id, status, uploaded_at desc) where deleted_at is null;
create index ix_document_record_retention_status on document_record (tenant_id, retention_status, retention_until) where deleted_at is null;
create index ix_document_link_document on document_link (tenant_id, document_id, linked_at desc);
create index ix_document_link_target on document_link (tenant_id, link_target_type, link_target_id, linked_at desc);
create index ix_document_version_document on document_version (tenant_id, document_id, version_number desc);
create index ix_document_extraction_job_document on document_extraction_job (tenant_id, document_id, requested_at desc);
create index ix_document_extraction_job_status on document_extraction_job (tenant_id, status, requested_at desc);
create index ix_medical_certificate_fact_episode on medical_certificate_fact (tenant_id, absence_episode_id, certificate_start_date desc);
create index ix_medical_certificate_fact_document on medical_certificate_fact (tenant_id, document_id);
create index ix_medical_certificate_fact_superseded on medical_certificate_fact (tenant_id, superseded_by_document_version_id) where superseded_by_document_version_id is not null;
create index ix_certificate_coverage_window_episode on certificate_coverage_window (tenant_id, absence_episode_id, covered_from desc);
create index ix_certificate_coverage_window_status on certificate_coverage_window (tenant_id, certificate_status, expiry_alert_at);
create index ix_document_access_event_document on document_access_event (tenant_id, document_id, accessed_at desc);
create index ix_document_access_event_actor on document_access_event (tenant_id, actor_id, accessed_at desc) where actor_id is not null;
create index ix_document_access_event_correlation_id on document_access_event (tenant_id, correlation_id) where correlation_id is not null;
create index ix_document_consent_reference_document on document_consent_reference (tenant_id, document_id, recorded_at desc);
