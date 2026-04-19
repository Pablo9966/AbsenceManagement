import { resolveRouteAccess, type PortalTenantContext, type PortalUserContext } from "../access/guards.js";
import type { MessageCatalog } from "../i18n/types.js";
import type { RouteAccessRule } from "../navigation/types.js";
import type { PortalShellModel } from "./model.js";

export interface PortalLayoutProps {
  shell: PortalShellModel;
  messages: MessageCatalog;
  children?: any;
}

export const PortalLayout = (props: PortalLayoutProps) => (
  <div className="portal-layout">
    <a href="#main-content" className="skip-link">
      {props.messages["shell.skipToContent"] ?? "Skip to content"}
    </a>
    <TopBar shell={props.shell} messages={props.messages} />
    <div className="portal-body">
      <SidebarNav shell={props.shell} />
      <main id="main-content" className="portal-main" tabIndex={-1}>
        {props.children}
      </main>
    </div>
  </div>
);

export const TopBar = (props: {
  shell: PortalShellModel;
  messages: MessageCatalog;
}) => (
  <header className="portal-header">
    <div className="portal-header-brand">
      <strong className="portal-header-title">{props.shell.appName}</strong>
      <span className="portal-header-subtitle">{props.shell.portalTitle}</span>
    </div>
    <div className="portal-header-actions">
      <LanguageSwitcher locale={props.shell.locale} label={props.messages["shell.language"] ?? "Language"} />
      <TenantSwitcher tenantName={props.shell.tenantName} label={props.messages["shell.tenant"] ?? "Tenant"} />
    </div>
  </header>
);

export const SidebarNav = (props: {
  shell: PortalShellModel;
}) => (
  <aside className="portal-sidebar">
    <nav aria-label={`${props.shell.portalTitle} navigation`}>
      <ul>
        {props.shell.navigation.map((item) => (
          <li key={item.key}>
            <a href={item.href} aria-label={item.label}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export const LanguageSwitcher = (props: {
  locale: string;
  label: string;
}) => (
  <div className="header-action-item">
    {props.label}: <strong>{props.locale}</strong>
  </div>
);

export const TenantSwitcher = (props: {
  tenantName: string;
  label: string;
}) => (
  <div className="header-action-item">
    {props.label}: <strong>{props.tenantName}</strong>
  </div>
);

export const PermissionDeniedState = (props: {
  title: string;
  message?: string;
}) => (
  <section className="surface-card" style={{ padding: "2rem" }} role="alert" aria-live="polite">
    <h1>{props.title}</h1>
    <p>{props.message ?? "You do not have access to this route."}</p>
  </section>
);

export const RedirectDashboardState = (props: {
  title: string;
  message?: string;
  dashboardHref?: string;
}) => (
  <section>
    <h1>{props.title}</h1>
    <p>{props.message ?? "This route redirects to the dashboard for your role."}</p>
    {props.dashboardHref ? <p>Dashboard: {props.dashboardHref}</p> : null}
  </section>
);

export const PlaceholderPageState = (props: {
  eyebrow: string;
  title: string;
  description: string;
  identifier?: string;
}) => (
  <section className="surface-card" aria-labelledby="placeholder-page-title">
    <p className="page-eyebrow">{props.eyebrow}</p>
    <h1 id="placeholder-page-title" className="page-title">{props.title}</h1>
    <p className="page-description">{props.description}</p>
    {props.identifier ? <p>Reference: <code>{props.identifier}</code></p> : null}
  </section>
);

export const GuardedPortalPage = (props: {
  routePattern: string;
  rules: RouteAccessRule[];
  userContext: PortalUserContext;
  messages: MessageCatalog;
  eyebrow: string;
  title: string;
  description: string;
  identifier?: string;
}) => {
  const rule = props.rules.find((candidate) => candidate.routePattern === props.routePattern);
  const access = resolveRouteAccess(rule, props.userContext);

  if (access === "permission_denied") {
    return (
      <PermissionDeniedState
        title={props.messages["common.permissionDenied"] ?? "Access denied"}
        message={props.messages["common.permissionDenied"] ?? "Access denied"}
      />
    );
  }

  if (access === "redirect_dashboard") {
    return (
      <RedirectDashboardState
        title={props.messages["common.permissionDenied"] ?? "Access denied"}
        message="This route is configured to redirect to the dashboard."
        dashboardHref={`/${props.userContext.locale}/dashboard`}
      />
    );
  }

  return (
    <PlaceholderPageState
      eyebrow={props.eyebrow}
      title={props.title}
      description={props.description}
      identifier={props.identifier}
    />
  );
};

export interface PortalRuntimeSnapshot {
  tenantContext: PortalTenantContext;
  userContext: PortalUserContext;
}
