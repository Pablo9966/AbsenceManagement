import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";

export default async function InternalKtgCasesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/ktg-cases"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to internal KTG cases." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="KTG Review" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listInternalCases({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No KTG cases" message="There are no internal KTG cases available for review." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="KTG Review Workspace" description="Internal KTG case review with richer internal context than the employer portal." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Case</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Assigned team</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((ktgCase) => (
              <tr key={ktgCase.caseId}>
                <td><a href={`/${runtime.locale}/ktg-cases/${ktgCase.caseId}`}>{ktgCase.caseNumber}</a></td>
                <td>{ktgCase.employeeName}</td>
                <td>{ktgCase.status}</td>
                <td>{ktgCase.assignedTeam ?? "-"}</td>
                <td>{ktgCase.deadlineAt ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="KTG cases unavailable" message={error instanceof Error ? error.message : "Unable to load KTG cases."} />;
  }
}
