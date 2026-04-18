create extension if not exists pgcrypto;

create type calculation_status as enum ('draft', 'calculated', 'superseded', 'approved_for_payment');
create type calculation_reason as enum ('initial', 'salary_change', 'incapacity_change', 'relapse_extension', 'manual_correction');
create type window_type as enum ('lohnfortzahlung', 'wartezeit_overlap', 'non_payable_coordination');
create type period_type as enum ('wartezeit', 'coordination_non_payable', 'payable', 'exhausted', 'excluded');
create type adjustment_origin as enum ('derived_recalculation', 'manual_correction');
create type adjustment_type as enum ('retroactive_increase', 'retroactive_decrease', 'salary_basis_correction', 'incapacity_correction');
create type payee_type as enum ('employer', 'employee');
create type payment_route_reason as enum ('salary_continuation_active', 'direct_employee_payment', 'employer_reimbursement_override');
create type instruction_status as enum ('pending', 'exported', 'cancelled');
create type actor_role as enum ('claims_handler', 'team_lead', 'finance_operator', 'system');

create table benefit_case_calculation (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    calculation_status calculation_status not null default 'draft',
    calculation_reason calculation_reason not null,
    reference_date date not null,
    coverage_snapshot_id uuid not null,
    benefit_days_consumed numeric(12,2) not null default 0,
    benefit_days_remaining numeric(12,2) not null default 0,
    max_benefit_days numeric(12,2) not null default 730,
    waiting_days_consumed numeric(12,2) not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_benefit_case_calculation_tenant_id_id unique (tenant_id, id),
    constraint ck_benefit_case_calculation_day_counters check (
        benefit_days_consumed >= 0 and benefit_days_remaining >= 0 and max_benefit_days >= 0 and waiting_days_consumed >= 0
    )
);

create index ix_benefit_case_calculation_case on benefit_case_calculation (tenant_id, ktg_case_id, created_at desc);
create index ix_benefit_case_calculation_status on benefit_case_calculation (tenant_id, calculation_status, updated_at desc);

create table insured_salary_snapshot (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    benefit_case_calculation_id uuid not null,
    ktg_case_id uuid,
    salary_basis_date date not null,
    salary_model text not null,
    annual_base_salary_chf numeric(14,2) not null,
    included_13th_month_chf numeric(14,2) not null default 0,
    insured_bonus_chf numeric(14,2) not null default 0,
    insured_allowances_chf numeric(14,2) not null default 0,
    employment_percentage numeric(5,2) not null,
    policy_cap_chf numeric(14,2) not null,
    insured_salary_chf numeric(14,2) not null,
    formula text not null,
    inputs_json jsonb not null,
    created_at timestamptz not null default now(),
    constraint uq_insured_salary_snapshot_tenant_id_id unique (tenant_id, id),
    constraint uq_insured_salary_snapshot_calculation unique (benefit_case_calculation_id),
    constraint fk_insured_salary_snapshot_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_insured_salary_snapshot_amounts check (
        annual_base_salary_chf >= 0 and included_13th_month_chf >= 0 and insured_bonus_chf >= 0 and insured_allowances_chf >= 0
        and employment_percentage >= 0 and employment_percentage <= 100
        and policy_cap_chf >= 0 and insured_salary_chf >= 0
        and length(trim(formula)) > 0
    )
);

create table coordination_window (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    benefit_case_calculation_id uuid not null,
    window_type window_type not null,
    window_start date not null,
    window_end date not null,
    days_count numeric(12,2) not null,
    legal_basis text not null,
    source_method text not null,
    formula text not null,
    inputs_json jsonb not null,
    created_at timestamptz not null default now(),
    constraint uq_coordination_window_tenant_id_id unique (tenant_id, id),
    constraint fk_coordination_window_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_coordination_window_dates check (window_end >= window_start),
    constraint ck_coordination_window_days_count check (days_count >= 0),
    constraint ck_coordination_window_text check (
        length(trim(legal_basis)) > 0 and length(trim(source_method)) > 0 and length(trim(formula)) > 0
    )
);

create index ix_coordination_window_calculation on coordination_window (tenant_id, benefit_case_calculation_id, window_start, window_end);

create table benefit_entitlement_period (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    benefit_case_calculation_id uuid not null,
    period_start date not null,
    period_end date not null,
    period_type period_type not null,
    absence_episode_id uuid,
    source_reference_json jsonb not null default '{}'::jsonb,
    incapacity_percentage numeric(5,2) not null,
    wartezeit_applicable_flag boolean not null default false,
    coordination_applicable_flag boolean not null default false,
    benefit_days numeric(12,2) not null,
    daily_allowance_rate_chf numeric(14,2) not null,
    payable_amount_chf numeric(14,2) not null,
    formula text not null,
    inputs_json jsonb not null,
    created_at timestamptz not null default now(),
    constraint uq_benefit_entitlement_period_tenant_id_id unique (tenant_id, id),
    constraint fk_benefit_entitlement_period_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_benefit_entitlement_period_dates check (period_end >= period_start),
    constraint ck_benefit_entitlement_period_numeric check (
        incapacity_percentage >= 0 and incapacity_percentage <= 100 and benefit_days >= 0 and daily_allowance_rate_chf >= 0 and payable_amount_chf >= 0
        and length(trim(formula)) > 0
    )
);

create index ix_benefit_entitlement_period_calculation on benefit_entitlement_period (tenant_id, benefit_case_calculation_id, period_start, period_end);

create table benefit_day_breakdown (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    benefit_entitlement_period_id uuid not null,
    benefit_date date not null,
    absence_episode_id uuid,
    source_reference_json jsonb not null default '{}'::jsonb,
    incapacity_percentage numeric(5,2) not null,
    salary_basis_per_day_chf numeric(14,2) not null,
    coverage_percentage numeric(5,2) not null,
    gross_daily_allowance_chf numeric(14,2) not null,
    deduction_reason text,
    deduction_amount_chf numeric(14,2) not null default 0,
    net_daily_allowance_chf numeric(14,2) not null,
    payable_flag boolean not null,
    created_at timestamptz not null default now(),
    constraint uq_benefit_day_breakdown_tenant_id_id unique (tenant_id, id),
    constraint fk_benefit_day_breakdown_period
        foreign key (tenant_id, benefit_entitlement_period_id) references benefit_entitlement_period(tenant_id, id),
    constraint uq_benefit_day_breakdown_period_date unique (benefit_entitlement_period_id, benefit_date),
    constraint ck_benefit_day_breakdown_numeric check (
        incapacity_percentage >= 0 and incapacity_percentage <= 100 and salary_basis_per_day_chf >= 0 and coverage_percentage >= 0 and coverage_percentage <= 100
        and gross_daily_allowance_chf >= 0 and deduction_amount_chf >= 0 and net_daily_allowance_chf >= 0
    ),
    constraint ck_benefit_day_breakdown_deduction_reason check (
        deduction_reason is null or length(trim(deduction_reason)) > 0
    )
);

create index ix_benefit_day_breakdown_period on benefit_day_breakdown (tenant_id, benefit_entitlement_period_id, benefit_date);
create index ix_benefit_day_breakdown_source_episode on benefit_day_breakdown (tenant_id, absence_episode_id, benefit_date) where absence_episode_id is not null;

create table benefit_adjustment (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    benefit_case_calculation_id uuid not null,
    adjustment_origin adjustment_origin not null,
    adjustment_type adjustment_type not null,
    effective_from date not null,
    effective_to date not null,
    reason_code text not null,
    delta_amount_chf numeric(14,2) not null,
    formula text not null,
    inputs_json jsonb not null,
    created_at timestamptz not null default now(),
    constraint uq_benefit_adjustment_tenant_id_id unique (tenant_id, id),
    constraint fk_benefit_adjustment_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_benefit_adjustment_dates check (effective_to >= effective_from),
    constraint ck_benefit_adjustment_reason_code check (length(trim(reason_code)) > 0),
    constraint ck_benefit_adjustment_formula check (length(trim(formula)) > 0)
);

create index ix_benefit_adjustment_calculation on benefit_adjustment (tenant_id, benefit_case_calculation_id, effective_from, effective_to);

create table payment_instruction (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    benefit_case_calculation_id uuid not null,
    payee_type payee_type not null,
    payee_reference text not null,
    payee_iban_reference text,
    payment_route_reason payment_route_reason not null,
    salary_continuation_active_flag boolean not null,
    routing_formula text not null,
    routing_inputs_json jsonb not null,
    payment_period_start date not null,
    payment_period_end date not null,
    gross_amount_chf numeric(14,2) not null,
    net_amount_chf numeric(14,2) not null,
    currency char(3) not null default 'CHF',
    instruction_status instruction_status not null default 'pending',
    created_at timestamptz not null default now(),
    constraint uq_payment_instruction_tenant_id_id unique (tenant_id, id),
    constraint fk_payment_instruction_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_payment_instruction_payee_reference check (length(trim(payee_reference)) > 0),
    constraint ck_payment_instruction_routing_formula check (length(trim(routing_formula)) > 0),
    constraint ck_payment_instruction_dates check (payment_period_end >= payment_period_start),
    constraint ck_payment_instruction_amounts check (gross_amount_chf >= 0 and net_amount_chf >= 0),
    constraint ck_payment_instruction_currency check (currency = 'CHF')
);

create index ix_payment_instruction_calculation on payment_instruction (tenant_id, benefit_case_calculation_id, created_at desc);
create index ix_payment_instruction_status on payment_instruction (tenant_id, instruction_status, created_at desc);

create table taggelddispositiv_snapshot (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    payment_instruction_id uuid not null,
    statement_period_start date not null,
    statement_period_end date not null,
    total_claimed_days numeric(12,2) not null,
    total_payable_days numeric(12,2) not null,
    total_amount_chf numeric(14,2) not null,
    statement_payload_json jsonb not null,
    generated_at timestamptz not null,
    constraint uq_taggelddispositiv_snapshot_tenant_id_id unique (tenant_id, id),
    constraint uq_taggelddispositiv_payment_instruction unique (payment_instruction_id),
    constraint fk_taggelddispositiv_payment_instruction
        foreign key (tenant_id, payment_instruction_id) references payment_instruction(tenant_id, id),
    constraint ck_taggelddispositiv_dates check (statement_period_end >= statement_period_start),
    constraint ck_taggelddispositiv_totals check (
        total_claimed_days >= 0 and total_payable_days >= 0 and total_amount_chf >= 0
    )
);

create table calculation_audit_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    benefit_case_calculation_id uuid not null,
    event_type text not null,
    occurred_at timestamptz not null,
    actor_id uuid,
    actor_role actor_role not null,
    correlation_id text,
    payload jsonb,
    created_at timestamptz not null default now(),
    constraint uq_calculation_audit_event_tenant_id_id unique (tenant_id, id),
    constraint fk_calculation_audit_event_calculation
        foreign key (tenant_id, benefit_case_calculation_id) references benefit_case_calculation(tenant_id, id),
    constraint ck_calculation_audit_event_event_type check (length(trim(event_type)) > 0)
);

create index ix_calculation_audit_event_calculation on calculation_audit_event (tenant_id, benefit_case_calculation_id, occurred_at desc);
create index ix_calculation_audit_event_correlation on calculation_audit_event (tenant_id, correlation_id) where correlation_id is not null;
