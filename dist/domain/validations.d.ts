import type { AccessPurposeRecord, OnboardingStatus, OnboardingWorkspace, PermissionGrant, PermissionPolicySet, PlatformUser, PortalSessionPolicy, ProvisioningInvite, RoleAssignment, SsoConfiguration, TenantMembership, UpdateOnboardingWorkspacePatch, UpdatePlatformUserPatch, UpdateTenantMembershipPatch, UserEmployeeLink, UserProfile } from "./types.js";
export interface ValidationIssue {
    field: string;
    message: string;
    severity: "error" | "warning";
}
export declare const validatePlatformUser: (input: Pick<PlatformUser, "email" | "createdAt" | "updatedAt">) => ValidationIssue[];
export declare const validatePlatformUserPatch: (patch: UpdatePlatformUserPatch) => ValidationIssue[];
export declare const validateUserProfile: (input: Pick<UserProfile, "firstName" | "lastName" | "createdAt" | "updatedAt">) => ValidationIssue[];
export declare const validateTenantMembership: (input: Pick<TenantMembership, "userId" | "joinedAt" | "leftAt" | "updatedAt">) => ValidationIssue[];
export declare const validateTenantMembershipPatch: (patch: UpdateTenantMembershipPatch) => ValidationIssue[];
export declare const validateUserEmployeeLink: (input: Pick<UserEmployeeLink, "userId" | "employeeId" | "linkedAt" | "revokedAt">) => ValidationIssue[];
export declare const validateRoleAssignment: (input: Pick<RoleAssignment, "roleCode" | "scopeType" | "scopeReference" | "assignedAt" | "revokedAt">) => ValidationIssue[];
export declare const validatePermissionPolicySet: (input: Pick<PermissionPolicySet, "policyCode" | "policyVersion">) => ValidationIssue[];
export declare const validatePermissionGrant: (input: Pick<PermissionGrant, "policySetId" | "roleCode" | "resourceType" | "action">) => ValidationIssue[];
export declare const validatePortalSessionPolicy: (input: Pick<PortalSessionPolicy, "idleTimeoutMinutes">) => ValidationIssue[];
export declare const validateSsoConfiguration: (input: Pick<SsoConfiguration, "providerType" | "samlMetadataJson" | "oidcConfigJson">) => ValidationIssue[];
export declare const validateAccessPurposeRecord: (input: Pick<AccessPurposeRecord, "userId" | "employeeId" | "purposeCode" | "source" | "grantedAt" | "revokedAt">) => ValidationIssue[];
export declare const validateOnboardingWorkspace: (input: Pick<OnboardingWorkspace, "currentStep" | "policySyncStatus" | "userProvisioningStatus" | "integrationSetupStatus" | "createdAt" | "updatedAt">) => ValidationIssue[];
export declare const validateOnboardingWorkspacePatch: (currentStatus: OnboardingStatus, patch: UpdateOnboardingWorkspacePatch) => ValidationIssue[];
export declare const validateProvisioningInvite: (input: Pick<ProvisioningInvite, "email" | "targetRoleCode" | "expiresAt" | "acceptedAt" | "createdAt">) => ValidationIssue[];
export declare const hasBlockingIssues: (issues: ReadonlyArray<ValidationIssue>) => boolean;
