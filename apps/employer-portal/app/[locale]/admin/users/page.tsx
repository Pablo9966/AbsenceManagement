import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../../packages/frontend-platform/src/navigation/types.js";
import type {
  ProvisioningInviteDto,
  TenantMembershipDto,
} from "@elipslife/identity-access-client";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export default async function EmployerAdminUsersPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
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
    runtime.client.listMemberships(runtime.sessionToken, runtime.tenantContext.tenantId),
    runtime.client.listProvisioningInvites(runtime.sessionToken, runtime.tenantContext.tenantId),
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
          {memberships.map((membership: TenantMembershipDto) => (
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
          {invites.map((invite: ProvisioningInviteDto) => (
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
