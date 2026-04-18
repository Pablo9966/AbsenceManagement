create extension if not exists pgcrypto;

create type workspace_status as enum ('new', 'intake_in_progress', 'waiting_for_information', 'ready_for_review', 'decision_pending', 'completed');
create type checklist_item_status as enum ('open', 'satisfied', 'waived');
create type source_service as enum ('ktg_case_service', 'document_service', 'absence_service', 'people_service', 'manual');
create type request_party_type as enum ('hr_manager', 'employee', 'claims_handler', 'document_review', 'external_partner');
create type request_channel_policy as enum ('portal_only', 'portal_and_email', 'internal_only');
create type missing_information_request_status as enum ('open', 'answered', 'cancelled', 'overdue');
create type queue_type as enum ('new_submissions', 'missing_information_follow_up', 'ready_for_review', 'decision_pending');
create type queue_entry_status as enum ('entered', 'in_progress', 'paused', 'exited');
create type note_visibility as enum ('internal_claims_only', 'internal_claims_team');
create type note_type as enum ('triage_note', 'medical_review_note', 'operations_note', 'system_note');
create type recommendation_type as enum ('request_more_information', 'ready_for_decision', 'medical_review_needed', 'escalate');
create type actor_role as enum ('claims_handler', 'team_lead', 'medical_reviewer', 'system');
create type evidence_reference_type as enum ('document_id', 'certificate_reference_id');
create type document_role as enum ('primary_certificate', 'supporting_medical_evidence', 'claims_attachment', 'reference_only');
create type link_source as enum ('manual', 'inferred_from_ktg_case', 'inferred_from_document_service');

create table intake_case_workspace (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    ktg_case_id uuid not null,
    employee_id uuid not null,
    policy_id text not null,
    workspace_status workspace_status not null default 'new',
    assigned_handler_id uuid,
    assigned_team text,
    submitted_at timestamptz not null,
    last_activity_at timestamptz not null,
    closed_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint uq_intake_case_workspace_tenant_id_id unique (tenant_id, id),
    constraint ck_intake_case_workspace_policy_id check (length(trim(policy_id)) > 0),
    constraint ck_intake_case_workspace_assigned_team check (assigned_team is null or length(trim(assigned_team)) > 0),
    constraint ck_intake_case_workspace_timestamps check (
        last_activity_at >= submitted_at
        and (closed_at is null or closed_at >= submitted_at)
    )
);

create unique index uq_intake_case_workspace_active_case
    on intake_case_workspace (tenant_id, ktg_case_id)
    where closed_at is null;

create table intake_checklist_item (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    check_type text not null,
    blocker_code text,
    source_service source_service not null,
    blocking_flag boolean not null default false,
    status checklist_item_status not null default 'open',
    required_flag boolean not null default true,
    satisfied_by_reference_type evidence_reference_type,
    satisfied_by_reference_id text,
    completed_at timestamptz,
    completed_by uuid,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_intake_checklist_item_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_intake_checklist_item_check_type check (length(trim(check_type)) > 0),
    constraint ck_intake_checklist_item_blocker_code check (blocker_code is null or length(trim(blocker_code)) > 0),
    constraint ck_intake_checklist_item_satisfied_reference check (
        (satisfied_by_reference_type is null and satisfied_by_reference_id is null)
        or (satisfied_by_reference_type is not null and satisfied_by_reference_id is not null and length(trim(satisfied_by_reference_id)) > 0)
    )
);

create table missing_information_request (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    request_reason_code text not null,
    request_details text,
    requested_from_party_type request_party_type not null,
    requested_from_user_id uuid,
    requested_from_role text,
    request_channel_policy request_channel_policy not null,
    related_reference_type text,
    related_reference_id text,
    status missing_information_request_status not null default 'open',
    requested_at timestamptz not null,
    due_at timestamptz,
    resolved_at timestamptz,
    resolved_by uuid,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_missing_information_request_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_missing_information_request_reason_code check (length(trim(request_reason_code)) > 0),
    constraint ck_missing_information_request_owner check (
        requested_from_user_id is not null or (requested_from_role is not null and length(trim(requested_from_role)) > 0)
    ),
    constraint ck_missing_information_request_resolved_at check (
        resolved_at is null or resolved_at >= requested_at
    )
);

create table handler_work_queue_entry (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    queue_type queue_type not null,
    queue_status queue_entry_status not null default 'entered',
    sla_due_at timestamptz,
    sort_score numeric(12,4),
    entered_at timestamptz not null,
    exited_at timestamptz,
    exit_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint fk_handler_work_queue_entry_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_handler_work_queue_entry_exit_reason check (exit_reason is null or length(trim(exit_reason)) > 0),
    constraint ck_handler_work_queue_entry_exited_at check (exited_at is null or exited_at >= entered_at)
);

create unique index uq_handler_work_queue_entry_active
    on handler_work_queue_entry (tenant_id, workspace_id, queue_type)
    where exited_at is null;

create table workspace_note (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    author_id uuid,
    author_role actor_role not null,
    visibility note_visibility not null,
    note_type note_type not null,
    message text not null,
    created_at timestamptz not null default now(),
    constraint fk_workspace_note_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_workspace_note_message check (length(trim(message)) > 0)
);

create table intake_decision_recommendation (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    recommendation_type recommendation_type not null,
    confidence numeric(5,4),
    reason_codes jsonb,
    summary text not null,
    generated_at timestamptz not null,
    accepted_by uuid,
    accepted_at timestamptz,
    created_at timestamptz not null default now(),
    constraint fk_intake_decision_recommendation_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_intake_decision_recommendation_confidence check (
        confidence is null or (confidence >= 0 and confidence <= 1)
    ),
    constraint ck_intake_decision_recommendation_summary check (length(trim(summary)) > 0),
    constraint ck_intake_decision_recommendation_accepted_at check (
        accepted_at is null or accepted_at >= generated_at
    )
);

create table workspace_activity_event (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    event_type text not null,
    actor_id uuid,
    actor_role actor_role not null,
    occurred_at timestamptz not null,
    correlation_id text,
    payload jsonb,
    created_at timestamptz not null default now(),
    constraint fk_workspace_activity_event_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_workspace_activity_event_event_type check (length(trim(event_type)) > 0)
);

create table workspace_evidence_reference (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null,
    workspace_id uuid not null,
    document_role document_role not null,
    document_id uuid,
    certificate_reference_id uuid,
    link_source link_source not null,
    link_confidence numeric(5,4),
    linked_at timestamptz not null,
    created_at timestamptz not null default now(),
    constraint fk_workspace_evidence_reference_workspace
        foreign key (tenant_id, workspace_id) references intake_case_workspace(tenant_id, id),
    constraint ck_workspace_evidence_reference_reference check (
        document_id is not null or certificate_reference_id is not null
    ),
    constraint ck_workspace_evidence_reference_link_confidence check (
        link_confidence is null or (link_confidence >= 0 and link_confidence <= 1)
    )
);

create index ix_intake_case_workspace_status on intake_case_workspace (tenant_id, workspace_status, submitted_at desc) where closed_at is null;
create index ix_intake_case_workspace_handler on intake_case_workspace (tenant_id, assigned_handler_id, workspace_status) where assigned_handler_id is not null and closed_at is null;
create index ix_intake_checklist_item_workspace on intake_checklist_item (tenant_id, workspace_id, status, blocking_flag);
create index ix_missing_information_request_workspace on missing_information_request (tenant_id, workspace_id, status, due_at);
create index ix_handler_work_queue_entry_active on handler_work_queue_entry (tenant_id, queue_type, queue_status, sla_due_at) where exited_at is null;
create index ix_workspace_note_workspace on workspace_note (tenant_id, workspace_id, created_at desc);
create index ix_intake_decision_recommendation_workspace on intake_decision_recommendation (tenant_id, workspace_id, generated_at desc);
create index ix_workspace_activity_event_workspace on workspace_activity_event (tenant_id, workspace_id, occurred_at desc);
create index ix_workspace_activity_event_correlation on workspace_activity_event (tenant_id, correlation_id) where correlation_id is not null;
create index ix_workspace_evidence_reference_workspace on workspace_evidence_reference (tenant_id, workspace_id, linked_at desc);

