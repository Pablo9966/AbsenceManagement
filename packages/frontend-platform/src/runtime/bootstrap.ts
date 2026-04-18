import type {
  EffectivePermissionSnapshotDto,
  IdentityAccessClient,
  PermissionCheck,
  RoleAssignmentDto,
} from "@elipslife/identity-access-client";
import {
  createPortalShellModel,
} from "../shell/model.js";
import type { NavigationItemConfig, RouteAccessRule } from "../navigation/types.js";
import { filterVisibleNavigation, type PortalTenantContext, type PortalUserContext } from "../access/guards.js";
import { loadCatalog } from "../i18n/load-catalog.js";
import { resolveLocale } from "../i18n/resolve-locale.js";
import type { LocaleCode } from "../i18n/types.js";

export interface SharedPortalRuntimeConfig {
  tenantId: string;
  tenantName: string;
  defaultLocale: LocaleCode;
  signInEmail: string;
  featureFlags: string[];
  portalTitleKey: string;
  navigation: NavigationItemConfig[];
  routeRules: RouteAccessRule[];
  requestedPermissions: PermissionCheck[];
}

export const createPortalBootstrapRuntime = async <TWorkflowClient>(input: {
  identityAccessClient: IdentityAccessClient;
  workflowClient: TWorkflowClient;
  config: SharedPortalRuntimeConfig;
  routeLocale?: string;
}) => {
  const session = await input.identityAccessClient.signIn({
    email: input.config.signInEmail,
    tenantId: input.config.tenantId,
  });
  const bootstrap = await input.identityAccessClient.getPortalBootstrap(session.sessionToken, {
    routeLocale: input.routeLocale as LocaleCode | undefined,
    permissions: input.config.requestedPermissions,
  });
  const locale = resolveLocale({
    routeLocale: input.routeLocale as LocaleCode | undefined,
    userPreferredLanguage: bootstrap.user.preferredLanguage,
    tenantDefaultLanguage: input.config.defaultLocale,
  });
  const messages = loadCatalog(locale);
  const userContext: PortalUserContext = {
    userId: bootstrap.user.id,
    tenantId: input.config.tenantId,
    locale,
    roleCodes: bootstrap.roleAssignments
      .filter((assignment: RoleAssignmentDto) => !assignment.revokedAt)
      .map((assignment: RoleAssignmentDto) => assignment.roleCode),
    effectivePermissions: bootstrap.effectivePermissions.map((permission: EffectivePermissionSnapshotDto) => ({
      resourceType: permission.resourceType,
      action: permission.action,
      allowed: permission.allowed,
    })),
  };
  const tenantContext: PortalTenantContext = {
    tenantId: input.config.tenantId,
    tenantName: input.config.tenantName,
    defaultLocale: locale,
    featureFlags: input.config.featureFlags,
  };
  const navigation = filterVisibleNavigation(input.config.navigation, userContext);
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: input.config.portalTitleKey,
    messages,
    navigation,
    tenantContext,
    userContext,
  });

  return {
    locale,
    messages,
    userContext,
    tenantContext,
    shell,
    routeRules: input.config.routeRules,
    bootstrap,
    client: input.identityAccessClient,
    workflowClient: input.workflowClient,
    sessionToken: session.sessionToken,
  };
};
