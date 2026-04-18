import {
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import type { RouteAccessRule } from "../../../../../packages/frontend-platform/src/navigation/types.js";
import type {
  AccessAuditEvent,
  AccessPurposeRecord,
  AuditAccessPolicy,
} from "../../../../../services/identity-access-service/src/domain/types.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";

export default async function InternalCompliancePage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale, viewer: "compliance" });
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
    runtime.demoService.listAccessAuditEvents(runtime.tenantContext.tenantId),
    runtime.demoService.listAccessPurposeRecords(runtime.tenantContext.tenantId),
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
        <dd>{runtime.bootstrap.auditAccessPolicies.some((policy: AuditAccessPolicy) => policy.canExportAuditFlag) ? "Yes" : "No"}</dd>
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
          {auditEvents.map((event: AccessAuditEvent) => (
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
          {purposeRecords.map((record: AccessPurposeRecord) => (
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
