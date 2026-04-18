export const hasPermission = (userContext, permission) => {
    if (!permission) {
        return true;
    }
    return userContext.effectivePermissions.some((candidate) => candidate.resourceType === permission.resourceType &&
        candidate.action === permission.action &&
        candidate.allowed);
};
export const filterVisibleNavigation = (navigation, userContext) => navigation.filter((item) => hasPermission(userContext, item.requiredPermission));
export const resolveRouteAccess = (rule, userContext) => {
    if (!rule) {
        return "allow";
    }
    return hasPermission(userContext, { resourceType: rule.resourceType, action: rule.action })
        ? "allow"
        : rule.fallbackBehavior;
};
//# sourceMappingURL=guards.js.map