# Phase 2A.1: Identity, Access, Onboarding, And Admin Foundation

## Scope

This module provides the platform identity and access foundation for the elipsLife Absence Management Platform. It owns platform users, tenant memberships, role and permission policy configuration, auditable user-to-employee linking, lawful-basis purpose records, session policy, SSO configuration metadata, onboarding state, provisioning invites, and compliance-grade audit access rules.

It does not own business-domain data such as absences, KTG cases, documents, or benefit calculations. It is the platform-control layer consumed by employer, internal, and later employee-facing applications.

## Approved Data Model

### Core Entities

- `PlatformUser`
- `UserProfile`
- `TenantMembership`
- `UserEmployeeLink`
- `RoleAssignment`
- `PermissionPolicySet`
- `PermissionGrant`
- `PortalSessionPolicy`
- `SsoConfiguration`
- `AccessPurposeRecord`
- `AuditAccessPolicy`
- `OnboardingWorkspace`
- `ProvisioningInvite`
- `AccessAuditEvent`

## Relationship Summary

- One `PlatformUser` can have many `TenantMembership` rows.
- One `PlatformUser` can have one `UserProfile`.
- One `TenantMembership` can have many `RoleAssignment` rows.
- One tenant can define many `PermissionPolicySet`, each with many `PermissionGrant`.
- One `UserEmployeeLink` maps a tenant-scoped platform user to one employee record for self-service and least-privilege access.
- One tenant has one active `PortalSessionPolicy` and can have multiple `SsoConfiguration` rows over time or by provider.
- One `OnboardingWorkspace` tracks the tenant onboarding state.
- One tenant can issue many `ProvisioningInvite` rows.
- `AccessPurposeRecord` tracks lawful basis and purpose bindings for sensitive-data access.

## PostgreSQL Design Notes

- Every local relationship is reinforced with tenant-scoped composite foreign keys `(tenant_id, id)`.
- One active membership per `tenant_id + user_id`.
- One active `UserEmployeeLink` per `tenant_id + user_id`.
- `PermissionPolicySet` is versionable and auditable as configuration; grants must not be interpreted only from mutable in-place rows.
- `AccessPurposeRecord` uses `lawful_basis`, not only consent, to match Swiss insurance operations.
- Locale values support `de-CH`, `en-CH`, `fr-CH`, and `it-CH`, while implementation work in Phase 2 focuses on `de-CH` and `en-CH`.

## API Design

### Main Endpoints

- `POST /v1/platform-users`
- `PATCH /v1/platform-users/{userId}`
- `POST /v1/tenants/{tenantId}/memberships`
- `PATCH /v1/tenants/{tenantId}/memberships/{membershipId}`
- `POST /v1/tenants/{tenantId}/user-employee-links`
- `POST /v1/tenants/{tenantId}/role-assignments`
- `POST /v1/tenants/{tenantId}/permission-policy-sets`
- `POST /v1/tenants/{tenantId}/permission-policy-sets/{policySetId}/grants`
- `GET /v1/tenants/{tenantId}/permissions/effective?userId=...`
- `PUT /v1/tenants/{tenantId}/session-policy`
- `PUT /v1/tenants/{tenantId}/sso-configurations/{configurationId}`
- `POST /v1/tenants/{tenantId}/access-purpose-records`
- `POST /v1/tenants/{tenantId}/onboarding-workspaces`
- `PATCH /v1/tenants/{tenantId}/onboarding-workspaces/{workspaceId}`
- `POST /v1/tenants/{tenantId}/provisioning-invites`
- `GET /v1/tenants/{tenantId}/audit-access-policy`

### Response Design Principle

Derived responses must return:

- `value`
- `formula`
- `inputs`
- `effective_at`

Primary transparent outputs in this module:

- `resolved_locale`
- `effective_permission_allowed`
- `onboarding_ready_for_go_live`

## Business Logic

### Core Rules

- Route access must be enforced by effective permissions derived from role assignments plus active policy sets.
- `de-CH` and `en-CH` are the first implemented languages, but `fr-CH` and `it-CH` must be valid locale options in storage and resolution logic.
- `UserEmployeeLink` is required for employee self-service access later and must be auditable.
- `AccessPurposeRecord` must support `consent`, `contract`, `legal_obligation`, and `insurance_claim_handling`.
- Compliance and audit access must be explicitly granted; absence of grant is deny by default.

### Derived Formula: Resolved Locale

`resolved_locale = route_locale ?? user_preferred_language ?? tenant_default_language ?? 'de-CH'`

Inputs returned:

- `route_locale`
- `user_preferred_language`
- `tenant_default_language`

### Derived Formula: Effective Permission Allowed

`effective_permission_allowed = any(active grant with effect = allow and matching condition) and no matching deny grant`

Inputs returned:

- `role_codes`
- `resource_type`
- `action`
- `matched_allow_grants`
- `matched_deny_grants`
- `active_policy_versions`

### Onboarding Workspace State Machine

- `created -> policy_sync`
- `policy_sync -> admin_setup`
- `admin_setup -> user_provisioning`
- `user_provisioning -> integration_setup`
- `integration_setup -> ready`
- `ready -> paused`

### Provisioning Invite State Machine

- `pending -> accepted`
- `pending -> expired`
- `pending -> revoked`

## UI Wireframe Description

### Screen: Employer Portal Shell

- Left navigation:
  - `Dashboard`
  - `Absences`
  - `Cases`
  - `Documents`
  - `Payments`
  - `Premium`
  - `Tasks`
  - `Admin`
- Top bar:
  - tenant context
  - language switch
  - notifications
  - profile
- Route guards:
  - hidden navigation items if no effective permission
  - hard server-side access denial on deep links

### Screen: Internal Portal Shell

- Left navigation:
  - `Dashboard`
  - `Intake`
  - `KTG`
  - `Benefits`
  - `Compliance`
  - `Admin`
- Dense operations layout
- Claims and compliance surfaces are separate top-level entries

### Screen: Tenant Onboarding Wizard

- Step 1:
  - tenant admin and default locale
- Step 2:
  - policy-sync readiness
- Step 3:
  - user provisioning and role assignment
- Step 4:
  - SSO and session policy
- Step 5:
  - integration readiness placeholder
- Step 6:
  - go-live checklist

### Screen: Compliance Audit Access

- Filter panel:
  - user
  - role
  - resource
  - time window
  - lawful basis
- Main table:
  - access event, actor, purpose, lawful basis, resource, result
- Export action:
  - only visible with explicit audit export permission

## Integration Spec

Phase 2A priorities for this module:

1. Employer portal
2. Internal portal
3. Later employee portal
4. SSO providers

### Employer/Internal Portals

- Direction:
  - inbound permission resolution and locale metadata
- Usage:
  - route guards
  - navigation shaping
  - session policy lookup

### Employee Portal

- Direction:
  - inbound user-to-employee linkage
- Usage:
  - enforce self-only access later in Phase 2D

### SSO Providers

- Direction:
  - outbound configuration metadata only in this phase
- Usage:
  - store SAML/OIDC tenant configuration and activation status

## Critical Test Cases

### Access Control

1. HR user can access employer portal but not internal claims queue.
2. Claims handler can access internal intake workspace but not employer admin.
3. Compliance user can view audit entries and export only if explicit grant exists.

### Locale

1. `route_locale` overrides user and tenant defaults.
2. User preferred locale falls back to tenant default.
3. Tenant default falls back to `de-CH`.

### Identity Mapping

1. Reject a second active `UserEmployeeLink` for the same tenant and user.
2. Employee self-service linkage remains auditable after revocation.

### Onboarding

1. Onboarding workspace progresses through all required steps.
2. Invite expiration blocks stale acceptance.

### Lawful Basis

1. Sensitive access can be recorded under `insurance_claim_handling` without implying user consent.
2. Revoked consent-based access purpose can be flagged separately from contract/legal basis access.

## Exit Criteria

- Platform identity and tenant membership are modeled and auditable.
- Permission policy is versionable and explicit.
- User-to-employee linkage exists for later self-service.
- Employer and internal portal shells can consume locale and permission decisions.
- Sensitive-data access can be tied to purpose and lawful basis.
