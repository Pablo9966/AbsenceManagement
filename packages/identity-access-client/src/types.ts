export type LocaleCode = "de-CH" | "en-CH" | "fr-CH" | "it-CH";
export type LawfulBasis = "consent" | "contract" | "legal_obligation" | "insurance_claim_handling";

export interface TransparentBoolean {
  value: boolean;
  formula: string;
  inputs: Record<string, unknown>;
  effectiveAt: string;
}

export interface TransparentLocale {
  value: LocaleCode;
  formula: string;
  inputs: Record<string, unknown>;
  effectiveAt: string;
}

export interface PlatformUserDto {
  id: string;
  email: string;
  preferredLanguage: LocaleCode;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TenantMembershipDto {
  id: string;
  tenantId: string;
  userId: string;
  membershipStatus: string;
  joinedAt: string;
  leftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoleAssignmentDto {
  id: string;
  tenantId: string;
  userId: string;
  roleCode: string;
  scopeType: string;
  scopeReference?: string;
  assignedAt: string;
  revokedAt?: string;
}

export interface PermissionCheck {
  resourceType: string;
  action: string;
}

export interface EffectivePermissionSnapshotDto extends PermissionCheck {
  allowed: boolean;
}

export interface AuditAccessPolicyDto {
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

export interface OnboardingWorkspaceDto {
  id: string;
  tenantId: string;
  status: string;
  currentStep: string;
  policySyncStatus: string;
  userProvisioningStatus: string;
  integrationSetupStatus: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisioningInviteDto {
  id: string;
  tenantId: string;
  email: string;
  targetRoleCode: string;
  inviteStatus: string;
  expiresAt: string;
  acceptedAt?: string;
  createdAt: string;
}

export interface AccessPurposeRecordDto {
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

export interface AccessAuditEventDto {
  id: string;
  tenantId: string;
  userId?: string;
  actorId?: string;
  actorRole: string;
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

export type AccessEnforcementMode =
  | "role_permission_only"
  | "role_permission_and_lawful_basis"
  | "role_permission_and_audit_policy";

export interface AccessEvaluationRequest extends PermissionCheck {
  employeeId?: string;
  purposeCode?: string;
  requiredLawfulBasis?: LawfulBasis[];
  auditAccessRequired?: boolean;
}

export interface AccessEvaluationResponse {
  allowed: boolean;
  enforcementMode: AccessEnforcementMode;
  reasons: string[];
}

export interface PortalBootstrapDto {
  user: PlatformUserDto;
  profile: UserProfileDto | null;
  membership: TenantMembershipDto | null;
  locale: TransparentLocale;
  roleAssignments: RoleAssignmentDto[];
  effectivePermissions: EffectivePermissionSnapshotDto[];
  auditAccessPolicies: AuditAccessPolicyDto[];
  onboardingReadiness: TransparentBoolean;
}

export interface SignInRequest {
  email: string;
  tenantId: string;
}

export interface SignInResponse {
  sessionToken: string;
  tenantId: string;
  userId: string;
}

export interface SessionBootstrapRequest {
  permissions: PermissionCheck[];
  routeLocale?: LocaleCode;
}

export interface AuditEventQuery {
  userId?: string;
  role?: string;
  resource?: string;
  lawfulBasis?: LawfulBasis;
  result?: string;
  from?: string;
  to?: string;
}
