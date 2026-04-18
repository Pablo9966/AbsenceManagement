import type { LocaleCode, PermissionGrant, PermissionPolicySet, RoleAssignment, TransparentBoolean, TransparentLocale } from "./types.js";
export declare const calculateResolvedLocale: (input: {
    routeLocale?: LocaleCode;
    userPreferredLanguage?: LocaleCode;
    tenantDefaultLanguage?: LocaleCode;
    effectiveAt: string;
}) => TransparentLocale;
export declare const calculateEffectivePermissionAllowed: (input: {
    roleAssignments: RoleAssignment[];
    policySets: PermissionPolicySet[];
    grants: PermissionGrant[];
    resourceType: string;
    action: string;
    effectiveAt: string;
}) => {
    allowed: TransparentBoolean;
    matchedAllowGrants: PermissionGrant[];
    matchedDenyGrants: PermissionGrant[];
    activePolicySets: PermissionPolicySet[];
};
export declare const calculateOnboardingReadyForGoLive: (input: {
    status: string;
    policySyncStatus: string;
    userProvisioningStatus: string;
    integrationSetupStatus: string;
    effectiveAt: string;
}) => TransparentBoolean;
