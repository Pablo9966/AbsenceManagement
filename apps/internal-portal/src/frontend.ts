export {
  GuardedPortalPage,
  PermissionDeniedState,
  PortalLayout,
  RedirectDashboardState,
} from "../../../packages/frontend-platform/src/shell/components.js";
export {
  resolveRouteAccess,
  filterVisibleNavigation,
  type PortalTenantContext,
  type PortalUserContext,
} from "../../../packages/frontend-platform/src/access/guards.js";
export {
  createPortalShellModel,
} from "../../../packages/frontend-platform/src/shell/model.js";
export {
  internalNavigation,
  internalRouteAccessRules,
} from "../../../packages/frontend-platform/src/navigation/internal.js";
export {
  loadCatalog,
} from "../../../packages/frontend-platform/src/i18n/load-catalog.js";
export {
  resolveLocale,
} from "../../../packages/frontend-platform/src/i18n/resolve-locale.js";
export type {
  LocaleCode,
} from "../../../packages/frontend-platform/src/i18n/types.js";
