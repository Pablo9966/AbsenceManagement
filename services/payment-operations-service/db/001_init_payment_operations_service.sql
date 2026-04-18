create extension if not exists pgcrypto;

create type run_status as enum (
    'draft', 'ready_for_export', 'exported', 'awaiting_reconciliation',
    'reconciled', 'completed', 'cancelled'
);
create type run_type as enum ('scheduled', 'manual', 'correction');
create type item_status as enum ('included', 'excluded', 'exported', 'reconciled');
create type export_format as enum ('pain_001', 'csv', 'json');
create type export_status as enum ('pending', 'generated', 'failed');
create type reconciliation_status as enum ('not_started', 'in_progress', 'matched', 'mismatch', 'confirmed');
create type statement_type as enum ('payment_statement', 'taggelddispositiv', 'settlement_summary');
create type settlement_status as enum ('open', 'partially_paid', 'fully_paid', 'overpaid');
create type payment_actor_role as enum ('finance_operator', 'team_lead', 'system', 'api');

create table payment_run (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    run_number text not null,
    run_type run_type not null,
    run_status run_status not null default 'draft',
    created_at timestamptz not null default now(),
    created_by text not null,
    scheduled_execution_at timestamptz,
    exported_at timestamptz,
    completed_at timestamptz,
    cancelled_at timestamptz,
    currency char(3) not null default 'CHF',
    total_gross_amount_chf numeric(14,2) not null default 0,
    total_net_amount_chf numeric(14,2) not null default 0,
    instruction_count integer not null default 0,
    reconciliation_status reconciliation_status not null default 'not_started',
    notes text,
    constraint uq_payment_run_tenant_id_id unique (tenant_id, id),
    constraint uq_payment_run_number unique (tenant_id, run_number),
    constraint ck_payment_run_total_gross check (total_gross_amount_chf >= 0),
    constraint ck_payment_run_total_net check (total_net_amount_chf >= 0),
    constraint ck_payment_run_instruction_count check (instruction_count >= 0)
);

create table payment_run_item (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid not null,
    payment_instruction_id uuid not null,
    ktg_case_id uuid not null,
    payee_type text not null,
    payee_reference text not null,
    payment_period_start date not null,
    payment_period_end date not null,
    gross_amount_chf numeric(14,2) not null,
    net_amount_chf numeric(14,2) not null,
    item_status item_status not null default 'included',
    included_at timestamptz not null default now(),
    excluded_reason text,
    constraint uq_payment_run_item_tenant_id_id unique (tenant_id, id),
    constraint fk_payment_run_item_run
        foreign key (tenant_id, payment_run_id) references payment_run(tenant_id, id),
    constraint ck_payment_run_item_gross check (gross_amount_chf >= 0),
    constraint ck_payment_run_item_net check (net_amount_chf >= 0),
    constraint ck_payment_run_item_period check (payment_period_end >= payment_period_start)
);

create unique index uq_payment_run_item_active_instruction
    on payment_run_item (tenant_id, payment_instruction_id)
    where item_status in ('included', 'exported');

create table payment_export_package (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid not null,
    export_format export_format not null,
    file_name text not null,
    storage_reference text not null,
    checksum text not null,
    generated_at timestamptz not null,
    generated_by text not null,
    export_status export_status not null default 'pending',
    constraint uq_payment_export_package_tenant_id_id unique (tenant_id, id),
    constraint fk_payment_export_package_run
        foreign key (tenant_id, payment_run_id) references payment_run(tenant_id, id)
);

create table payment_statement (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid not null,
    payment_instruction_id uuid,
    ktg_case_id uuid not null,
    statement_type statement_type not null,
    statement_period_start date not null,
    statement_period_end date not null,
    file_name text not null,
    storage_reference text not null,
    pdf_size_bytes integer not null,
    generated_at timestamptz not null,
    constraint uq_payment_statement_tenant_id_id unique (tenant_id, id),
    constraint fk_payment_statement_run
        foreign key (tenant_id, payment_run_id) references payment_run(tenant_id, id),
    constraint ck_payment_statement_period check (statement_period_end >= statement_period_start),
    constraint ck_payment_statement_pdf_size check (pdf_size_bytes > 0)
);

create table case_settlement_summary (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    latest_payment_run_id uuid,
    total_gross_paid_chf numeric(14,2) not null default 0,
    total_net_paid_chf numeric(14,2) not null default 0,
    total_payable_days numeric(12,2) not null default 0,
    last_statement_at timestamptz,
    settlement_status settlement_status not null default 'open',
    updated_at timestamptz not null default now(),
    constraint uq_case_settlement_summary_case unique (tenant_id, ktg_case_id),
    constraint ck_case_settlement_summary_gross check (total_gross_paid_chf >= 0),
    constraint ck_case_settlement_summary_net check (total_net_paid_chf >= 0),
    constraint ck_case_settlement_summary_days check (total_payable_days >= 0)
);

create table payment_reconciliation_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid not null,
    reconciliation_status reconciliation_status not null default 'not_started',
    reconciled_at timestamptz,
    reconciled_by text,
    mismatch_reason text,
    payroll_booking_reference text,
    confirmation_received_at timestamptz,
    constraint uq_payment_reconciliation_record_run unique (tenant_id, payment_run_id),
    constraint fk_payment_reconciliation_record_run
        foreign key (tenant_id, payment_run_id) references payment_run(tenant_id, id)
);

create table payroll_booking_confirmation (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid not null,
    confirmation_reference text not null,
    confirmed_at timestamptz not null,
    confirmed_by text not null,
    booking_payload_json jsonb not null,
    constraint uq_payroll_booking_confirmation_run unique (tenant_id, payment_run_id),
    constraint fk_payroll_booking_confirmation_run
        foreign key (tenant_id, payment_run_id) references payment_run(tenant_id, id)
);

create table payment_operations_audit_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    payment_run_id uuid,
    payment_instruction_id uuid,
    event_type text not null,
    occurred_at timestamptz not null,
    actor_id text not null,
    actor_role payment_actor_role not null,
    correlation_id text,
    payload jsonb
);

create index ix_payment_run_tenant_status on payment_run (tenant_id, run_status, created_at desc);
create index ix_payment_run_tenant_type on payment_run (tenant_id, run_type, created_at desc);
create index ix_payment_run_item_run on payment_run_item (tenant_id, payment_run_id, included_at desc);
create index ix_payment_run_item_instruction on payment_run_item (tenant_id, payment_instruction_id);
create index ix_payment_export_package_run on payment_export_package (tenant_id, payment_run_id, generated_at desc);
create index ix_payment_statement_run on payment_statement (tenant_id, payment_run_id, generated_at desc);
create index ix_payment_statement_case on payment_statement (tenant_id, ktg_case_id, generated_at desc);
create index ix_case_settlement_summary_case on case_settlement_summary (tenant_id, ktg_case_id);
create index ix_payment_reconciliation_run on payment_reconciliation_record (tenant_id, payment_run_id);
create index ix_payment_reconciliation_status on payment_reconciliation_record (tenant_id, reconciliation_status);
create index ix_payment_operations_audit_run on payment_operations_audit_event (tenant_id, payment_run_id, occurred_at desc) where payment_run_id is not null;
create index ix_payment_operations_audit_occurred on payment_operations_audit_event (tenant_id, occurred_at desc);
