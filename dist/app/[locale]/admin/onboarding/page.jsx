import { PermissionDeniedState, RedirectDashboardState, resolveRouteAccess, } from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";
export default async function EmployerAdminOnboardingPage(props) {
    const runtime = await getEmployerPortalRuntime(props.params.locale);
    const access = resolveRouteAccess(runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/admin/onboarding"), runtime.userContext);
    if (access === "permission_denied") {
        return <PermissionDeniedState title="Access denied" message="You do not have access to onboarding."/>;
    }
    if (access === "redirect_dashboard") {
        return <RedirectDashboardState title="Onboarding" dashboardHref={`/${runtime.locale}/dashboard`}/>;
    }
    const workspace = await runtime.client.getOnboardingWorkspace(runtime.sessionToken, runtime.tenantContext.tenantId);
    return (<section>
      <p>Employer Portal</p>
      <h1>Onboarding</h1>
      <p>The onboarding workspace is now sourced from the identity-access service demo context.</p>
      <dl>
        <dt>Tenant</dt>
        <dd>{runtime.tenantContext.tenantName}</dd>
        <dt>Status</dt>
        <dd>{workspace?.status ?? "missing"}</dd>
        <dt>Current step</dt>
        <dd>{workspace?.currentStep ?? "missing"}</dd>
        <dt>Policy sync</dt>
        <dd>{workspace?.policySyncStatus ?? "missing"}</dd>
        <dt>User provisioning</dt>
        <dd>{workspace?.userProvisioningStatus ?? "missing"}</dd>
        <dt>Integration setup</dt>
        <dd>{workspace?.integrationSetupStatus ?? "missing"}</dd>
        <dt>Go-live readiness</dt>
        <dd>{runtime.bootstrap.onboardingReadiness.value ? "Ready" : "Not ready"}</dd>
      </dl>
    </section>);
}
//# sourceMappingURL=page.jsx.map