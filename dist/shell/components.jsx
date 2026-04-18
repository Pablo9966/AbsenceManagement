import { resolveRouteAccess } from "../access/guards.js";
export const PortalLayout = (props) => (<div className="portal-layout">
    <TopBar shell={props.shell} messages={props.messages}/>
    <div className="portal-body">
      <SidebarNav shell={props.shell}/>
      <main className="portal-main">{props.children}</main>
    </div>
  </div>);
export const TopBar = (props) => (<header className="portal-header">
    <div className="portal-header-brand">
      <strong className="portal-header-title">{props.shell.appName}</strong>
      <span className="portal-header-subtitle">{props.shell.portalTitle}</span>
    </div>
    <div className="portal-header-actions">
      <LanguageSwitcher locale={props.shell.locale} label={props.messages["shell.language"] ?? "Language"}/>
      <TenantSwitcher tenantName={props.shell.tenantName} label={props.messages["shell.tenant"] ?? "Tenant"}/>
    </div>
  </header>);
export const SidebarNav = (props) => (<aside className="portal-sidebar">
    <nav aria-label={`${props.shell.portalTitle} navigation`}>
      <ul>
        {props.shell.navigation.map((item) => (<li key={item.key}>
            <a href={item.href}>{item.label}</a>
          </li>))}
      </ul>
    </nav>
  </aside>);
export const LanguageSwitcher = (props) => (<div className="header-action-item">
    {props.label}: <strong>{props.locale}</strong>
  </div>);
export const TenantSwitcher = (props) => (<div className="header-action-item">
    {props.label}: <strong>{props.tenantName}</strong>
  </div>);
export const PermissionDeniedState = (props) => (<section>
    <h1>{props.title}</h1>
    <p>{props.message ?? "You do not have access to this route."}</p>
  </section>);
export const RedirectDashboardState = (props) => (<section>
    <h1>{props.title}</h1>
    <p>{props.message ?? "This route redirects to the dashboard for your role."}</p>
    {props.dashboardHref ? <p>Dashboard: {props.dashboardHref}</p> : null}
  </section>);
export const PlaceholderPageState = (props) => (<section className="surface-card">
    <p className="page-eyebrow">{props.eyebrow}</p>
    <h1 className="page-title">{props.title}</h1>
    <p className="page-description">{props.description}</p>
    {props.identifier ? <p>Reference: <code>{props.identifier}</code></p> : null}
  </section>);
export const GuardedPortalPage = (props) => {
    const rule = props.rules.find((candidate) => candidate.routePattern === props.routePattern);
    const access = resolveRouteAccess(rule, props.userContext);
    if (access === "permission_denied") {
        return (<PermissionDeniedState title={props.messages["common.permissionDenied"] ?? "Access denied"} message={props.messages["common.permissionDenied"] ?? "Access denied"}/>);
    }
    if (access === "redirect_dashboard") {
        return (<RedirectDashboardState title={props.messages["common.permissionDenied"] ?? "Access denied"} message="This route is configured to redirect to the dashboard." dashboardHref={`/${props.userContext.locale}/dashboard`}/>);
    }
    return (<PlaceholderPageState eyebrow={props.eyebrow} title={props.title} description={props.description} identifier={props.identifier}/>);
};
//# sourceMappingURL=components.jsx.map