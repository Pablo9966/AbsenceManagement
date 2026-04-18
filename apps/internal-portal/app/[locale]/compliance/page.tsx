import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../packages/frontend-platform/src/navigation/types.js";
import type {
  AccessAuditEventDto,
  AccessPurposeRecordDto,
  AuditAccessPolicyDto,
} from "@elipslife/identity-access-client";
import { getInternalPortalRuntime } from "../../../src/runtime.js";

export default async function InternalCompliancePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale, viewer: "compliance" });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/compliance"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to audit visibility." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Compliance" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  const [auditEvents, purposeRecords] = await Promise.all([
    runtime.client.listAuditEvents(runtime.sessionToken, runtime.tenantContext.tenantId, {
      resource: "access_control",
    }),
    runtime.client.listAccessPurposeRecords(runtime.sessionToken, runtime.tenantContext.tenantId),
  ]);

  return (
    <section>
      <p>Internal Portal</p>
      <h1>Compliance</h1>
      <p>The compliance view now reads audit events and purpose records from the identity-access service demo repository.</p>
      <dl>
        <dt>Viewer</dt>
        <dd>{runtime.bootstrap.profile?.displayName ?? runtime.bootstrap.user.email}</dd>
        <dt>Audit policy count</dt>
        <dd>{runtime.bootstrap.auditAccessPolicies.length}</dd>
        <dt>Export allowed</dt>
        <dd>{runtime.bootstrap.auditAccessPolicies.some((policy: AuditAccessPolicyDto) => policy.canExportAuditFlag) ? "Yes" : "No"}</dd>
      </dl>
      <h2>Recent Audit Events</h2>
      <table>
        <thead>
          <tr>
            <th>Occurred At</th>
            <th>Resource</th>
            <th>Action</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {auditEvents.map((event: AccessAuditEventDto) => (
            <tr key={event.id}>
              <td>{event.occurredAt}</td>
              <td>{event.resourceType}</td>
              <td>{event.action}</td>
              <td>{event.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Access Purpose Records</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Lawful Basis</th>
            <th>User</th>
            <th>Employee</th>
          </tr>
        </thead>
        <tbody>
          {purposeRecords.map((record: AccessPurposeRecordDto) => (
            <tr key={record.id}>
              <td>{record.purposeCode}</td>
              <td>{record.lawfulBasis}</td>
              <td>{record.userId ?? "-"}</td>
              <td>{record.employeeId ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
