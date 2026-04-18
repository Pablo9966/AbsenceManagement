# Module 05A: Inbox And Notification Workflow

## Scope

This module owns user-facing inbox obligations, notification triggers, template selection, preference-aware delivery orchestration, and suppression auditability. It does not own dashboard KPI projections. Those belong to the later `dashboard-projection-service`.

## Approved Data Model

### Core Entities

- `InboxItem`
- `InboxItemAssignment`
- `NotificationEvent`
- `NotificationPreference`
- `NotificationTemplate`
- `NotificationDelivery`
- `DeliverySuppression`

## Relationship Summary

- One `NotificationEvent` can create many `InboxItem` rows and many `NotificationDelivery` rows.
- One `InboxItem` can have many assignment changes through `InboxItemAssignment`.
- One `NotificationTemplate` can be reused by many deliveries.
- One user can have many `NotificationPreference` rows by channel and notification type.
- One suppressed delivery intent is preserved in `DeliverySuppression` instead of disappearing silently.

## PostgreSQL Design Notes

- Tenant isolation is reinforced in persistence with `(tenant_id, id)` composite foreign keys on all local child tables.
- Upstream business objects like absence episodes, KTG cases, and document ids are referenced as scoped business ids without hard cross-service foreign keys.
- `NotificationEvent` is append-only and acts as the auditable trigger record.
- `InboxItem` is the durable action record even if delivery attempts fail or are suppressed.

## API Design

### Main Endpoints

- `POST /v1/tenants/{tenantId}/notification-events`
- `GET /v1/tenants/{tenantId}/inbox-items`
- `GET /v1/tenants/{tenantId}/inbox-items/{inboxItemId}`
- `PATCH /v1/tenants/{tenantId}/inbox-items/{inboxItemId}`
- `POST /v1/tenants/{tenantId}/inbox-items/{inboxItemId}/assignments`
- `GET /v1/tenants/{tenantId}/notification-preferences`
- `POST /v1/tenants/{tenantId}/notification-preferences`
- `PATCH /v1/tenants/{tenantId}/notification-preferences/{preferenceId}`
- `GET /v1/tenants/{tenantId}/notification-templates`
- `POST /v1/tenants/{tenantId}/notification-templates`
- `POST /v1/tenants/{tenantId}/notification-deliveries`
- `PATCH /v1/tenants/{tenantId}/notification-deliveries/{deliveryId}`
- `GET /v1/tenants/{tenantId}/delivery-suppressions`

### Response Design Principle

Derived outputs must expose:

- `value`
- `formula`
- `inputs`
- `effective_at`

For this module, the main derived outputs are:

- `notification_suppressed`
- `inbox_item_overdue`

## Business Logic

### Core Rules

- `InboxItem` must exist even when all outbound channels are suppressed or fail.
- `NotificationEvent` is immutable after creation.
- Quiet hours and disabled preferences can suppress outbound delivery, but never the inbox item itself.
- One user can only have one active preference row per `notification_type + channel`.
- A delivery can reference an inbox item, but the inbox item does not depend on delivery success.
- Suppressed notifications still create a `NotificationDelivery` row with `delivery_status = suppressed`; `DeliverySuppression` stores the audit reason, not the only record of the attempt.

### Derived Formula: Notification Suppressed

`notification_suppressed = preference_disabled or in_quiet_hours or duplicate_delivery_guard`

Inputs returned:

- `enabled_flag`
- `quiet_hours_start`
- `quiet_hours_end`
- `reference_local_time`
- `duplicate_delivery_flag`

### Derived Formula: Inbox Item Overdue

`inbox_item_overdue = due_at < reference_at and resolved_at is null and status not in (resolved, cancelled)`

Inputs returned:

- `due_at`
- `reference_at`
- `resolved_at`
- `status`

### Inbox Item State Machine

- `open -> acknowledged`
- `open -> resolved`
- `open -> cancelled`
- `acknowledged -> resolved`
- `acknowledged -> cancelled`

`resolved` and `cancelled` are terminal in Phase 1.

### Delivery State Machine

- `pending -> queued`
- `pending -> suppressed`
- `queued -> sent`
- `queued -> failed`
- `failed -> queued`

`sent` and `suppressed` are terminal in Phase 1.

## UI Wireframe Description

### Screen: HR Inbox

- Header:
  - KPI chips for `offen`, `ueberfaellig`, `heute faellig`, `ungelesen`
  - Filters for role, source type, priority, due bucket
- Main list:
  - Columns `Titel`, `Zusammenfassung`, `Quelle`, `Prioritaet`, `Faelligkeit`, `Status`, `Zuweisung`
  - Row badges for `ueberfaellig`, `neu`, `nur im Portal`, `Zustellung fehlgeschlagen`
- Right-side panel:
  - Full item detail
  - Primary and secondary actions
  - Delivery history preview
  - Assignment history preview

### Screen: Notification Preferences

- Table by notification type and channel
- Toggles for `in_app`, `email`, later `sms`
- Quiet-hours editor with local time range
- Locale selector per user

### Screen: Template Admin

- Template list by notification type, language, channel, scope
- Preview panel with rendered placeholders
- Version badge and active flag

### Screen: Delivery Monitor

- Filter by status, channel, provider, source event
- Columns `Empfaenger`, `Kanal`, `Vorlage`, `Status`, `ausgeloest`, `gesendet`, `Fehler`
- Drilldown into suppressions and retries

## Integration Spec

Phase 1 priorities for this module:

1. `absence-service`
2. `ktg-case-service`
3. `document-service`
4. identity and user directory
5. email provider

### absence-service

- Direction:
  - Inbound event trigger
- Event examples:
  - new absence reported
  - absence acknowledged
  - return-to-work due
- Error handling:
  - If source entity lookup fails, preserve the event and flag the inbox item for reconciliation

### ktg-case-service

- Direction:
  - Inbound event trigger
- Event examples:
  - case submission blocked
  - case submitted
  - deadline overdue

### document-service

- Direction:
  - Inbound event trigger
- Event examples:
  - certificate expiring
  - document under review
  - access anomaly for compliance review

### Identity And User Directory

- Direction:
  - Inbound audience resolution
- Use:
  - map role-targeted items to concrete users
  - resolve locale and channel eligibility

### Email Provider

- Direction:
  - Outbound delivery only in Phase 1
- Error handling:
  - Provider failure sets delivery `failed` and leaves inbox item intact

## Critical Test Cases

### Happy Path

1. A certificate-expiry event creates one inbox item for HR and one email delivery.
2. A KTG submission-blocked event creates a high-priority inbox item and an in-app delivery.
3. A line manager acknowledges an inbox item and later resolves it.

### Validation And Edge Cases

1. Suppress email delivery when the user preference is disabled, but still create the inbox item.
2. Suppress delivery during quiet hours and write `DeliverySuppression`.
3. Reject duplicate active preference for the same user, notification type, and channel.
4. Reject invalid inbox status transitions from `resolved` or `cancelled`.
5. Retry a failed delivery by transitioning back to `queued`.

### Audit And Traceability

1. Preserve immutable `NotificationEvent` payloads.
2. Keep delivery failure reasons and suppression reasons queryable.
3. Retain assignment history when an inbox item changes owner.

## Exit Criteria For Module 5A

- Inbox obligations are durable and queryable by user and role.
- Delivery attempts are preference-aware and auditable.
- Suppressed notifications are explicitly recorded, not silently dropped.
- Upstream services can trigger inbox items and outbound delivery without owning notification workflow.
