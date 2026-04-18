export const calculateResolvedLocale = (input) => {
    const value = input.routeLocale ??
        input.userPreferredLanguage ??
        input.tenantDefaultLanguage ??
        "de-CH";
    return {
        value,
        effectiveAt: input.effectiveAt,
        formula: "route_locale ?? user_preferred_language ?? tenant_default_language ?? de-CH",
        inputs: {
            routeLocale: input.routeLocale,
            userPreferredLanguage: input.userPreferredLanguage,
            tenantDefaultLanguage: input.tenantDefaultLanguage,
        },
    };
};
export const calculateEffectivePermissionAllowed = (input) => {
    const activePolicySets = input.policySets.filter((policySet) => policySet.activeFlag);
    const activePolicySetIds = new Set(activePolicySets.map((policySet) => policySet.id));
    const activeRoleCodes = new Set(input.roleAssignments
        .filter((assignment) => !assignment.revokedAt)
        .map((assignment) => assignment.roleCode));
    const matchingGrants = input.grants.filter((grant) => activePolicySetIds.has(grant.policySetId) &&
        activeRoleCodes.has(grant.roleCode) &&
        grant.resourceType === input.resourceType &&
        grant.action === input.action);
    const matchedAllowGrants = matchingGrants.filter((grant) => grant.effect === "allow");
    const matchedDenyGrants = matchingGrants.filter((grant) => grant.effect === "deny");
    const value = matchedAllowGrants.length > 0 && matchedDenyGrants.length === 0;
    return {
        allowed: {
            value,
            effectiveAt: input.effectiveAt,
            formula: "any(active allow grant) and no matching deny grant",
            inputs: {
                roleCodes: [...activeRoleCodes],
                resourceType: input.resourceType,
                action: input.action,
                matchedAllowGrantIds: matchedAllowGrants.map((grant) => grant.id),
                matchedDenyGrantIds: matchedDenyGrants.map((grant) => grant.id),
                activePolicyVersions: activePolicySets.map((policySet) => ({
                    policyCode: policySet.policyCode,
                    policyVersion: policySet.policyVersion,
                })),
            },
        },
        matchedAllowGrants,
        matchedDenyGrants,
        activePolicySets,
    };
};
export const calculateOnboardingReadyForGoLive = (input) => {
    const value = input.status === "ready" &&
        input.policySyncStatus === "complete" &&
        input.userProvisioningStatus === "complete" &&
        input.integrationSetupStatus === "complete";
    return {
        value,
        effectiveAt: input.effectiveAt,
        formula: "status = ready and all onboarding sub-statuses = complete",
        inputs: {
            status: input.status,
            policySyncStatus: input.policySyncStatus,
            userProvisioningStatus: input.userProvisioningStatus,
            integrationSetupStatus: input.integrationSetupStatus,
        },
    };
};
//# sourceMappingURL=formulas.js.map