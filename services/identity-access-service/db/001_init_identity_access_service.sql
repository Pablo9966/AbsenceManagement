create extension if not exists pgcrypto;

create type platform_user_status as enum ('invited', 'active', 'locked', 'disabled');
create type locale_code as enum ('de-CH', 'en-CH', 'fr-CH', 'it-CH');
create type membership_status as enum ('active', 'suspended', 'revoked');
create type employee_link_type as enum ('employee_self_service', 'manager_delegate', 'claims_reference');
create type scope_type as enum ('tenant', 'org_unit', 'employee', 'case', 'document', 'audit');
create type effect_type as enum ('allow', 'deny');
create type provider_type as enum ('saml', 'oidc', 'local');
create type provider_status as enum ('draft', 'active', 'inactive');
create type lawful_basis as enum ('consent', 'contract', 'legal_obligation', 'insurance_claim_handling');
create type onboarding_status as enum ('created', 'policy_sync', 'admin_setup', 'user_provisioning', 'integration_setup', 'ready', 'paused');
create type invite_status as enum ('pending', 'accepted', 'expired', 'revoked');
create type actor_role as enum ('platform_admin', 'tenant_admin', 'compliance_user', 'system');

create table platform_user (
    id uuid primary key default gen_random_uuid(),
    email text not null unique,
    preferred_language locale_code not null default 'de-CH',
    status platform_user_status not null default 'invited',
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint ck_platform_user_email check (position('@' in email) > 1)
);

create table user_profile (
    user_id uuid primary key,
    first_name text not null,
    last_name text not null,
    display_name text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_user_profile_user foreign key (user_id) references platform_user(id),
    constraint ck_user_profile_names check (length(trim(first_name)) > 0 and length(trim(last_name)) > 0)
);

create table tenant_membership (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid not null,
    membership_status membership_status not null default 'active',
    joined_at timestamptz not null,
    left_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_tenant_membership_tenant_id_id unique (tenant_id, id),
    constraint fk_tenant_membership_user foreign key (user_id) references platform_user(id),
    constraint ck_tenant_membership_dates check (left_at is null or left_at >= joined_at)
);

create unique index uq_tenant_membership_active_user
    on tenant_membership (tenant_id, user_id)
    where left_at is null and membership_status <> 'revoked';

create table user_employee_link (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid not null,
    employee_id uuid not null,
    link_type employee_link_type not null,
    linked_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now(),
    constraint uq_user_employee_link_tenant_id_id unique (tenant_id, id),
    constraint fk_user_employee_link_user foreign key (user_id) references platform_user(id),
    constraint ck_user_employee_link_dates check (revoked_at is null or revoked_at >= linked_at)
);

create unique index uq_user_employee_link_active_user
    on user_employee_link (tenant_id, user_id)
    where revoked_at is null;

create table permission_policy_set (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid,
    policy_code text not null,
    policy_version integer not null,
    active_flag boolean not null default true,
    description text,
    created_at timestamptz not null default now(),
    constraint uq_permission_policy_set_tenant_id_id unique (tenant_id, id),
    constraint uq_permission_policy_set_code_version unique (tenant_id, policy_code, policy_version),
    constraint ck_permission_policy_set_code check (length(trim(policy_code)) > 0),
    constraint ck_permission_policy_set_version check (policy_version > 0)
);

create table permission_grant (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid,
    policy_set_id uuid not null,
    role_code text not null,
    resource_type text not null,
    action text not null,
    effect effect_type not null,
    condition_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint uq_permission_grant_tenant_id_id unique (tenant_id, id),
    constraint fk_permission_grant_policy_set foreign key (tenant_id, policy_set_id) references permission_policy_set(tenant_id, id),
    constraint ck_permission_grant_fields check (
        length(trim(role_code)) > 0 and length(trim(resource_type)) > 0 and length(trim(action)) > 0
    )
);

create table role_assignment (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid not null,
    role_code text not null,
    scope_type scope_type not null default 'tenant',
    scope_reference text,
    assigned_at timestamptz not null,
    revoked_at timestamptz,
    created_at timestamptz not null default now(),
    constraint uq_role_assignment_tenant_id_id unique (tenant_id, id),
    constraint fk_role_assignment_user foreign key (user_id) references platform_user(id),
    constraint ck_role_assignment_role_code check (length(trim(role_code)) > 0),
    constraint ck_role_assignment_scope_reference check (
        scope_type = 'tenant' or (scope_reference is not null and length(trim(scope_reference)) > 0)
    ),
    constraint ck_role_assignment_dates check (revoked_at is null or revoked_at >= assigned_at)
);

create table portal_session_policy (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    mfa_required_flag boolean not null default true,
    idle_timeout_minutes integer not null default 30,
    allowed_auth_methods_json jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_portal_session_policy_tenant_id_id unique (tenant_id, id),
    constraint uq_portal_session_policy_tenant unique (tenant_id),
    constraint ck_portal_session_policy_timeout check (idle_timeout_minutes between 5 and 240)
);

create table sso_configuration (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    provider_type provider_type not null,
    provider_status provider_status not null default 'draft',
    saml_metadata_json jsonb,
    oidc_config_json jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_sso_configuration_tenant_id_id unique (tenant_id, id),
    constraint ck_sso_configuration_payload check (
        (provider_type = 'saml' and saml_metadata_json is not null)
        or (provider_type = 'oidc' and oidc_config_json is not null)
        or provider_type = 'local'
    )
);

create table access_purpose_record (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid,
    employee_id uuid,
    purpose_code text not null,
    lawful_basis lawful_basis not null,
    granted_at timestamptz not null,
    revoked_at timestamptz,
    source text not null,
    reference_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    constraint uq_access_purpose_record_tenant_id_id unique (tenant_id, id),
    constraint fk_access_purpose_record_user foreign key (user_id) references platform_user(id),
    constraint ck_access_purpose_record_purpose_code check (length(trim(purpose_code)) > 0 and length(trim(source)) > 0),
    constraint ck_access_purpose_record_subject check (user_id is not null or employee_id is not null),
    constraint ck_access_purpose_record_dates check (revoked_at is null or revoked_at >= granted_at)
);

create table audit_access_policy (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    role_code text not null,
    policy_set_id uuid,
    can_view_audit_flag boolean not null default false,
    can_export_audit_flag boolean not null default false,
    sensitive_scope_json jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_audit_access_policy_tenant_id_id unique (tenant_id, id),
    constraint uq_audit_access_policy_role unique (tenant_id, role_code),
    constraint fk_audit_access_policy_policy_set foreign key (tenant_id, policy_set_id) references permission_policy_set(tenant_id, id),
    constraint ck_audit_access_policy_role_code check (length(trim(role_code)) > 0)
);

create table onboarding_workspace (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    status onboarding_status not null default 'created',
    current_step text not null,
    policy_sync_status text not null,
    user_provisioning_status text not null,
    integration_setup_status text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_onboarding_workspace_tenant_id_id unique (tenant_id, id),
    constraint uq_onboarding_workspace_tenant unique (tenant_id),
    constraint ck_onboarding_workspace_fields check (
        length(trim(current_step)) > 0 and length(trim(policy_sync_status)) > 0
        and length(trim(user_provisioning_status)) > 0 and length(trim(integration_setup_status)) > 0
    )
);

create table provisioning_invite (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    email text not null,
    target_role_code text not null,
    invite_status invite_status not null default 'pending',
    expires_at timestamptz not null,
    accepted_at timestamptz,
    created_at timestamptz not null default now(),
    constraint uq_provisioning_invite_tenant_id_id unique (tenant_id, id),
    constraint ck_provisioning_invite_email check (position('@' in email) > 1),
    constraint ck_provisioning_invite_role_code check (length(trim(target_role_code)) > 0),
    constraint ck_provisioning_invite_dates check (accepted_at is null or accepted_at <= expires_at)
);

create table access_audit_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid,
    actor_id uuid,
    actor_role actor_role not null,
    resource_type text not null,
    resource_reference text not null,
    action text not null,
    lawful_basis lawful_basis,
    purpose_code text,
    result text not null,
    correlation_id text,
    occurred_at timestamptz not null,
    payload jsonb,
    created_at timestamptz not null default now(),
    constraint uq_access_audit_event_tenant_id_id unique (tenant_id, id),
    constraint fk_access_audit_event_user foreign key (user_id) references platform_user(id),
    constraint ck_access_audit_event_fields check (
        length(trim(resource_type)) > 0 and length(trim(resource_reference)) > 0
        and length(trim(action)) > 0 and length(trim(result)) > 0
    )
);

create index ix_tenant_membership_active on tenant_membership (tenant_id, membership_status, joined_at desc) where left_at is null;
create index ix_user_employee_link_active on user_employee_link (tenant_id, employee_id, user_id) where revoked_at is null;
create index ix_role_assignment_active on role_assignment (tenant_id, user_id, role_code) where revoked_at is null;
create index ix_permission_grant_lookup on permission_grant (tenant_id, policy_set_id, role_code, resource_type, action, effect);
create index ix_sso_configuration_active on sso_configuration (tenant_id, provider_type, provider_status);
create index ix_access_purpose_record_lookup on access_purpose_record (tenant_id, lawful_basis, purpose_code, granted_at desc);
create index ix_provisioning_invite_status on provisioning_invite (tenant_id, invite_status, expires_at);
create index ix_access_audit_event_lookup on access_audit_event (tenant_id, occurred_at desc, resource_type, action);
create index ix_access_audit_event_correlation on access_audit_event (tenant_id, correlation_id) where correlation_id is not null;
