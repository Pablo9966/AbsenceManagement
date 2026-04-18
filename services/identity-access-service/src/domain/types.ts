export type LocaleCode = "de-CH" | "en-CH" | "fr-CH" | "it-CH";
export type PlatformUserStatus = "invited" | "active" | "locked" | "disabled";
export type MembershipStatus = "active" | "suspended" | "revoked";
export type EmployeeLinkType = "employee_self_service" | "manager_delegate" | "claims_reference";
export type ScopeType = "tenant" | "org_unit" | "employee" | "case" | "document" | "audit";
export type EffectType = "allow" | "deny";
export type ProviderType = "saml" | "oidc" | "local";
export type ProviderStatus = "draft" | "active" | "inactive";
export type LawfulBasis = "consent" | "contract" | "legal_obligation" | "insurance_claim_handling";
export type OnboardingStatus = "created" | "policy_sync" | "admin_setup" | "user_provisioning" | "integration_setup" | "ready" | "paused";
export type InviteStatus = "pending" | "accepted" | "expired" | "revoked";
export type ActorRole = "platform_admin" | "tenant_admin" | "compliance_user" | "system";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface TransparentLocale extends TransparentValue<LocaleCode> {
  effectiveAt: string;
}

export interface PlatformUser {
  id: string;
  email: string;
  preferredLanguage: LocaleCode;
  status: PlatformUserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  membershipStatus: MembershipStatus;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEmployeeLink {
  id: string;
  tenantId: string;
  userId: string;
  employeeId: string;
  linkType: EmployeeLinkType;
  linkedAt: string;
  revokedAt?: string;
}

export interface RoleAssignment {
  id: string;
  tenantId: string;
  userId: string;
  roleCode: string;
  scopeType: ScopeType;
  scopeReference?: string;
  assignedAt: string;
  revokedAt?: string;
}

export interface PermissionPolicySet {
  id: string;
  tenantId?: string;
  policyCode: string;
  policyVersion: number;
  activeFlag: boolean;
  description?: string;
  createdAt: string;
}

export interface PermissionGrant {
  id: string;
  tenantId?: string;
  policySetId: string;
  roleCode: string;
  resourceType: string;
  action: string;
  effect: EffectType;
  conditionJson: Record<string, unknown>;
  createdAt: string;
}

export interface PortalSessionPolicy {
  id: string;
  tenantId: string;
  mfaRequiredFlag: boolean;
  idleTimeoutMinutes: number;
  allowedAuthMethodsJson: unknown[];
  createdAt: string;
  updatedAt: string;
}

export interface SsoConfiguration {
  id: string;
  tenantId: string;
  providerType: ProviderType;
  providerStatus: ProviderStatus;
  samlMetadataJson?: Record<string, unknown>;
  oidcConfigJson?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AccessPurposeRecord {
  id: string;
  tenantId: string;
  userId?: string;
  employeeId?: string;
  purposeCode: string;
  lawfulBasis: LawfulBasis;
  grantedAt: string;
  revokedAt?: string;
  source: string;
  referenceJson: Record<string, unknown>;
  createdAt: string;
}

export interface AuditAccessPolicy {
  id: string;
  tenantId: string;
  roleCode: string;
  policySetId?: string;
  canViewAuditFlag: boolean;
  canExportAuditFlag: boolean;
  sensitiveScopeJson: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingWorkspace {
  id: string;
  tenantId: string;
  status: OnboardingStatus;
  currentStep: string;
  policySyncStatus: string;
  userProvisioningStatus: string;
  integrationSetupStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisioningInvite {
  id: string;
  tenantId: string;
  email: string;
  targetRoleCode: string;
  inviteStatus: InviteStatus;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface AccessAuditEvent {
  id: string;
  tenantId: string;
  userId?: string;
  actorId?: string;
  actorRole: ActorRole;
  resourceType: string;
  resourceReference: string;
  action: string;
  lawfulBasis?: LawfulBasis;
  purposeCode?: string;
  result: string;
  correlationId?: string;
  occurredAt: string;
  payload?: Record<string, unknown>;
}

export interface EffectivePermissionDecision {
  allowed: TransparentBoolean;
  matchedAllowGrants: PermissionGrant[];
  matchedDenyGrants: PermissionGrant[];
  activePolicySets: PermissionPolicySet[];
}

export interface PermissionCheck {
  resourceType: string;
  action: string;
}

export interface EffectivePermissionSnapshot extends PermissionCheck {
  allowed: boolean;
  decision: EffectivePermissionDecision;
}

export interface PortalBootstrap {
  user: PlatformUser;
  profile: UserProfile | null;
  membership: TenantMembership | null;
  locale: TransparentLocale;
  roleAssignments: RoleAssignment[];
  effectivePermissions: EffectivePermissionSnapshot[];
  auditAccessPolicies: AuditAccessPolicy[];
  onboardingReadiness: TransparentBoolean;
}

export interface UpdatePlatformUserPatch {
  preferredLanguage?: LocaleCode;
  status?: PlatformUserStatus;
  updatedAt?: string;
}

export interface UpdateTenantMembershipPatch {
  membershipStatus?: MembershipStatus;
  leftAt?: string;
  updatedAt?: string;
}

export interface UpdateOnboardingWorkspacePatch {
  status?: OnboardingStatus;
  currentStep?: string;
  policySyncStatus?: string;
  userProvisioningStatus?: string;
  integrationSetupStatus?: string;
  updatedAt?: string;
}
