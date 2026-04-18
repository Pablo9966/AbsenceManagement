import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../../packages/frontend-platform/src/navigation/types.js";
import type {
  ProvisioningInvite,
  TenantMembership,
} from "../../../../../../services/identity-access-service/src/domain/types.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export default async function EmployerAdminUsersPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/admin/users"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to user provisioning." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="User Administration" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  const [memberships, invites] = await Promise.all([
    runtime.demoService.listTenantMemberships(runtime.tenantContext.tenantId),
    runtime.demoService.listProvisioningInvites(runtime.tenantContext.tenantId),
  ]);

  return (
    <section>
      <p>Employer Portal</p>
      <h1>User Administration</h1>
      <p>Memberships and invites are coming from the identity-access service demo repository.</p>
      <h2>Memberships</h2>
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {memberships.map((membership: TenantMembership) => (
            <tr key={membership.id}>
              <td>{membership.userId}</td>
              <td>{membership.membershipStatus}</td>
              <td>{membership.joinedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Provisioning Invites</h2>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Expires</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((invite: ProvisioningInvite) => (
            <tr key={invite.id}>
              <td>{invite.email}</td>
              <td>{invite.targetRoleCode}</td>
              <td>{invite.inviteStatus}</td>
              <td>{invite.expiresAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
