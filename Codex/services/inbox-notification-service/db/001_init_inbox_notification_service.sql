create extension if not exists pgcrypto;

create type audience_type as enum ('user', 'role');
create type inbox_priority as enum ('low', 'medium', 'high', 'urgent');
create type inbox_status as enum ('open', 'acknowledged', 'resolved', 'cancelled');
create type assignment_status as enum ('assigned', 'accepted', 'released');
create type source_type as enum ('absence_episode', 'ktg_case', 'document', 'system');
create type notification_channel as enum ('in_app', 'email', 'sms');
create type notification_type as enum (
    'certificate_expiring',
    'case_submission_blocked',
    'deadline_overdue',
    'absence_reported',
    'return_to_work_due',
    'system_alert',
    'manual'
);
create type template_scope_type as enum ('global', 'tenant');
create type delivery_status as enum ('pending', 'queued', 'sent', 'failed', 'suppressed');
create type suppression_reason as enum ('preference_disabled', 'quiet_hours', 'duplicate_delivery_guard', 'channel_unavailable');

create table notification_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    event_type notification_type not null,
    source_type source_type not null,
    source_id uuid not null,
    correlation_id text,
    triggered_at timestamptz not null,
    payload jsonb not null,
    created_at timestamptz not null default now(),
    constraint uq_notification_event_tenant_id_id unique (tenant_id, id)
);

create table inbox_item (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    audience_type audience_type not null,
    audience_user_id uuid,
    audience_role text,
    source_type source_type not null,
    source_id uuid not null,
    title text not null,
    summary text not null,
    priority inbox_priority not null default 'medium',
    due_at timestamptz,
    status inbox_status not null default 'open',
    primary_action_label text,
    primary_action_url text,
    secondary_action_url text,
    notification_event_id uuid,
    created_at timestamptz not null default now(),
    read_at timestamptz,
    resolved_at timestamptz,
    constraint uq_inbox_item_tenant_id_id unique (tenant_id, id),
    constraint fk_inbox_item_notification_event
        foreign key (tenant_id, notification_event_id) references notification_event(tenant_id, id),
    constraint ck_inbox_item_title check (length(trim(title)) > 0),
    constraint ck_inbox_item_summary check (length(trim(summary)) > 0),
    constraint ck_inbox_item_audience check (
        (audience_type = 'user' and audience_user_id is not null and audience_role is null)
        or (audience_type = 'role' and audience_role is not null and audience_user_id is null)
    ),
    constraint ck_inbox_item_resolved_at check (resolved_at is null or resolved_at >= created_at)
);

create table inbox_item_assignment (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    inbox_item_id uuid not null,
    assigned_user_id uuid,
    assigned_role text,
    assigned_at timestamptz not null,
    assignment_status assignment_status not null default 'assigned',
    created_at timestamptz not null default now(),
    constraint fk_inbox_item_assignment_item
        foreign key (tenant_id, inbox_item_id) references inbox_item(tenant_id, id),
    constraint ck_inbox_item_assignment_target check (
        assigned_user_id is not null or assigned_role is not null
    )
);

create table notification_preference (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    user_id uuid not null,
    channel notification_channel not null,
    notification_type notification_type not null,
    enabled_flag boolean not null default true,
    locale text not null,
    quiet_hours_start time,
    quiet_hours_end time,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_notification_preference_active unique (tenant_id, user_id, channel, notification_type),
    constraint ck_notification_preference_locale check (length(trim(locale)) > 0)
);

create table notification_template (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid,
    scope_type template_scope_type not null,
    notification_type notification_type not null,
    channel notification_channel not null,
    language text not null,
    subject_template text,
    body_template text not null,
    active_flag boolean not null default true,
    version integer not null,
    created_at timestamptz not null default now(),
    constraint uq_notification_template_scope unique (tenant_id, scope_type, notification_type, channel, language, version),
    constraint ck_notification_template_scope check (
        (scope_type = 'global' and tenant_id is null)
        or (scope_type = 'tenant' and tenant_id is not null)
    ),
    constraint ck_notification_template_language check (length(trim(language)) > 0),
    constraint ck_notification_template_body check (length(trim(body_template)) > 0),
    constraint ck_notification_template_version check (version > 0)
);

create table notification_delivery (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    notification_event_id uuid not null,
    inbox_item_id uuid,
    recipient_user_id uuid not null,
    channel notification_channel not null,
    template_id uuid,
    delivery_status delivery_status not null default 'pending',
    triggered_at timestamptz not null,
    sent_at timestamptz,
    provider_message_id text,
    failure_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_notification_delivery_tenant_id_id unique (tenant_id, id),
    constraint fk_notification_delivery_event
        foreign key (tenant_id, notification_event_id) references notification_event(tenant_id, id),
    constraint fk_notification_delivery_inbox_item
        foreign key (tenant_id, inbox_item_id) references inbox_item(tenant_id, id),
    constraint fk_notification_delivery_template
        foreign key (template_id) references notification_template(id),
    constraint ck_notification_delivery_failure_reason check (
        failure_reason is null or length(trim(failure_reason)) > 0
    )
);

create table delivery_suppression (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    notification_event_id uuid not null,
    recipient_user_id uuid not null,
    channel notification_channel not null,
    suppression_reason suppression_reason not null,
    suppressed_at timestamptz not null,
    delivery_id uuid,
    created_at timestamptz not null default now(),
    constraint fk_delivery_suppression_event
        foreign key (tenant_id, notification_event_id) references notification_event(tenant_id, id),
    constraint fk_delivery_suppression_delivery
        foreign key (tenant_id, delivery_id) references notification_delivery(tenant_id, id)
);

create index ix_notification_event_source on notification_event (tenant_id, source_type, source_id, triggered_at desc);
create index ix_notification_event_correlation_id on notification_event (tenant_id, correlation_id) where correlation_id is not null;
create index ix_inbox_item_audience_user on inbox_item (tenant_id, audience_user_id, status, due_at) where audience_user_id is not null;
create index ix_inbox_item_audience_role on inbox_item (tenant_id, audience_role, status, due_at) where audience_role is not null;
create index ix_inbox_item_source on inbox_item (tenant_id, source_type, source_id, created_at desc);
create index ix_notification_preference_user on notification_preference (tenant_id, user_id, notification_type, channel);
create index ix_notification_template_lookup on notification_template (tenant_id, scope_type, notification_type, channel, language, active_flag, version desc);
create index ix_notification_delivery_recipient on notification_delivery (tenant_id, recipient_user_id, delivery_status, triggered_at desc);
create index ix_notification_delivery_event on notification_delivery (tenant_id, notification_event_id, triggered_at desc);
create index ix_delivery_suppression_recipient on delivery_suppression (tenant_id, recipient_user_id, suppressed_at desc);

