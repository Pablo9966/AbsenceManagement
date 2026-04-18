import { type PortalTenantContext, type PortalUserContext } from "../access/guards.js";
import type { MessageCatalog } from "../i18n/types.js";
import type { RouteAccessRule } from "../navigation/types.js";
import type { PortalShellModel } from "./model.js";
export interface PortalLayoutProps {
    shell: PortalShellModel;
    messages: MessageCatalog;
    children?: unknown;
}
export declare const PortalLayout: (props: PortalLayoutProps) => any;
export declare const TopBar: (props: {
    shell: PortalShellModel;
    messages: MessageCatalog;
}) => any;
export declare const SidebarNav: (props: {
    shell: PortalShellModel;
}) => any;
export declare const LanguageSwitcher: (props: {
    locale: string;
    label: string;
}) => any;
export declare const TenantSwitcher: (props: {
    tenantName: string;
    label: string;
}) => any;
export declare const PermissionDeniedState: (props: {
    title: string;
    message?: string;
}) => any;
export declare const RedirectDashboardState: (props: {
    title: string;
    message?: string;
    dashboardHref?: string;
}) => any;
export declare const PlaceholderPageState: (props: {
    eyebrow: string;
    title: string;
    description: string;
    identifier?: string;
}) => any;
export declare const GuardedPortalPage: (props: {
    routePattern: string;
    rules: RouteAccessRule[];
    userContext: PortalUserContext;
    messages: MessageCatalog;
    eyebrow: string;
    title: string;
    description: string;
    identifier?: string;
}) => any;
export interface PortalRuntimeSnapshot {
    tenantContext: PortalTenantContext;
    userContext: PortalUserContext;
}
