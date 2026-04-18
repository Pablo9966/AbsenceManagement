import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../packages/frontend-platform/src/navigation/types.js";
import type { ProvisioningInviteDto } from "@elipslife/identity-access-client";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerAdminPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
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

  const invites = await runtime.client.listProvisioningInvites(runtime.sessionToken, runtime.tenantContext.tenantId);

  return (
    <section>
      <p>Employer Portal</p>
      <h1>Admin</h1>
      <p>
        Tenant <strong>{runtime.tenantContext.tenantName}</strong> is now loading administration data from the
        identity-access service backend instead of page-local permission fixtures.
      </p>
      <dl>
        <dt>Resolved locale</dt>
        <dd>{runtime.bootstrap.locale.value}</dd>
        <dt>Current role set</dt>
        <dd>{runtime.userContext.roleCodes.join(", ")}</dd>
        <dt>Onboarding ready for go-live</dt>
        <dd>{runtime.bootstrap.onboardingReadiness.value ? "Yes" : "No"}</dd>
        <dt>Open invites</dt>
        <dd>{invites.filter((invite: ProvisioningInviteDto) => invite.inviteStatus === "pending").length}</dd>
      </dl>
    </section>
  );
}
