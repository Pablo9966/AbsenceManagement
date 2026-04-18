create extension if not exists pgcrypto;

create type dashboard_role as enum ('hr_manager', 'payroll_manager', 'line_manager', 'claims_handler', 'account_manager', 'actuary', 'admin');
create type projection_type as enum ('kpi_snapshot', 'widget_snapshot', 'full_dashboard_refresh');
create type projection_job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');
create type source_service as enum ('people_service', 'absence_service', 'ktg_case_service', 'document_service', 'inbox_notification_service', 'integration_gateway');
create type benchmark_scope as enum ('industry', 'portfolio', 'market_reference');

create table dashboard_kpi_snapshot (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    dashboard_role dashboard_role not null,
    kpi_key text not null,
    value_json jsonb not null,
    formula text,
    inputs_json jsonb,
    window_start date not null,
    window_end date not null,
    refreshed_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint ck_dashboard_kpi_snapshot_kpi_key check (length(trim(kpi_key)) > 0),
    constraint ck_dashboard_kpi_snapshot_window check (window_end >= window_start)
);

create table dashboard_widget_snapshot (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    dashboard_role dashboard_role not null,
    widget_key text not null,
    widget_payload jsonb not null,
    window_start date,
    window_end date,
    refreshed_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint ck_dashboard_widget_snapshot_widget_key check (length(trim(widget_key)) > 0),
    constraint ck_dashboard_widget_snapshot_window check (
        window_start is null or window_end is null or window_end >= window_start
    )
);

create table projection_job (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    projection_type projection_type not null,
    scope_key text not null,
    job_status projection_job_status not null default 'pending',
    requested_at timestamptz not null,
    started_at timestamptz,
    completed_at timestamptz,
    error_code text,
    error_message text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_projection_job_scope_key check (length(trim(scope_key)) > 0),
    constraint ck_projection_job_timestamps check (
        (started_at is null or started_at >= requested_at)
        and (completed_at is null or completed_at >= requested_at)
    )
);

create table projection_dependency_watermark (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    source_service source_service not null,
    source_stream text not null,
    last_processed_event_id text,
    last_processed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_projection_dependency_watermark unique (tenant_id, source_service, source_stream),
    constraint ck_projection_dependency_watermark_source_stream check (length(trim(source_stream)) > 0)
);

create table dashboard_view_config (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    dashboard_role dashboard_role not null,
    widget_key text not null,
    display_order integer not null,
    enabled_flag boolean not null default true,
    default_filters_json jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_dashboard_view_config unique (tenant_id, dashboard_role, widget_key),
    constraint ck_dashboard_view_config_widget_key check (length(trim(widget_key)) > 0),
    constraint ck_dashboard_view_config_display_order check (display_order >= 0)
);

create table benchmark_snapshot (
    id uuid primary key default gen_random_uuid(),
    benchmark_scope benchmark_scope not null,
    industry_code text,
    metric_key text not null,
    value_json jsonb not null,
    methodology_version text not null,
    refreshed_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint ck_benchmark_snapshot_metric_key check (length(trim(metric_key)) > 0),
    constraint ck_benchmark_snapshot_methodology_version check (length(trim(methodology_version)) > 0),
    constraint ck_benchmark_snapshot_industry_code check (industry_code is null or length(trim(industry_code)) > 0)
);

create index ix_dashboard_kpi_snapshot_active on dashboard_kpi_snapshot (tenant_id, dashboard_role, kpi_key, refreshed_at desc);
create index ix_dashboard_widget_snapshot_active on dashboard_widget_snapshot (tenant_id, dashboard_role, widget_key, refreshed_at desc);
create index ix_projection_job_status on projection_job (tenant_id, job_status, requested_at desc);
create index ix_projection_dependency_watermark_source on projection_dependency_watermark (tenant_id, source_service, source_stream);
create index ix_dashboard_view_config_role on dashboard_view_config (tenant_id, dashboard_role, display_order);
create index ix_benchmark_snapshot_scope on benchmark_snapshot (benchmark_scope, metric_key, refreshed_at desc);

