import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../packages/frontend-platform/src/navigation/types.js";
import type { ProvisioningInvite } from "../../../../../services/identity-access-service/src/domain/types.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerAdminPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/admin"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to tenant administration." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Admin" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  const invites = await runtime.demoService.listProvisioningInvites(runtime.tenantContext.tenantId);

  return (
    <section>
      <p>Employer Portal</p>
      <h1>Admin</h1>
      <p>
        Tenant <strong>{runtime.tenantContext.tenantName}</strong> is now loading administration data from the
        identity-access service demo context instead of page-local permission fixtures.
      </p>
      <dl>
        <dt>Resolved locale</dt>
        <dd>{runtime.bootstrap.locale.value}</dd>
        <dt>Current role set</dt>
        <dd>{runtime.userContext.roleCodes.join(", ")}</dd>
        <dt>Onboarding ready for go-live</dt>
        <dd>{runtime.bootstrap.onboardingReadiness.value ? "Yes" : "No"}</dd>
        <dt>Open invites</dt>
        <dd>{invites.filter((invite: ProvisioningInvite) => invite.inviteStatus === "pending").length}</dd>
      </dl>
    </section>
  );
}
