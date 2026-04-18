import {
  ErrorState,
  PermissionDeniedState,
  RedirectDashboardState,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import type {
  AccessAuditEventDto,
  AccessPurposeRecordDto,
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

  try {
    const [auditEvents, purposeRecords] = await Promise.all([
      runtime.client.listAuditEvents(runtime.sessionToken, runtime.tenantContext.tenantId, { resource: "access_control" }),
      runtime.client.listAccessPurposeRecords(runtime.sessionToken, runtime.tenantContext.tenantId),
    ]);

    return (
      <div className="surface-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <p className="page-eyebrow">Internal Operations</p>
            <h1 className="page-title">Compliance & Audit Logs</h1>
            <p className="page-description">Backend-driven audit events and purpose records from the identity-access service.</p>
          </div>
        </div>
        <h2>Audit events</h2>
        <WorkflowTable>
          <thead>
            <tr>
              <th>Event</th>
              <th>At</th>
              <th>User</th>
              <th>Resource</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {auditEvents.map((event: AccessAuditEventDto) => (
              <tr key={event.id}>
                <td>{event.action}</td>
                <td>{event.occurredAt}</td>
                <td>{event.userId ?? event.actorId ?? "-"}</td>
                <td>{event.resourceType}</td>
                <td>{event.result}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
        <h2>Purpose records</h2>
        <WorkflowTable>
          <thead>
            <tr>
              <th>Purpose</th>
              <th>User</th>
              <th>Employee</th>
              <th>Lawful basis</th>
            </tr>
          </thead>
          <tbody>
            {purposeRecords.map((record: AccessPurposeRecordDto) => (
              <tr key={record.id}>
                <td>{record.purposeCode}</td>
                <td>{record.userId}</td>
                <td>{record.employeeId ?? "-"}</td>
                <td>{record.lawfulBasis}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Compliance unavailable" message={error instanceof Error ? error.message : "Unable to load compliance data."} />;
  }
}
