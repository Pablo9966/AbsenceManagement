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

export default async function InternalIntakePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/intake"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to the intake queue." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Intake Queue" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listInternalIntake({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No intake workspaces" message="There are no intake items waiting for review." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Claims Intake Queue" description="Claims-intake workspaces with handler assignment, blockers, and urgency visibility." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Workspace</th>
              <th>KTG case</th>
              <th>Status</th>
              <th>Handler</th>
              <th>Blockers</th>
              <th>Overdue</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((workspace) => (
              <tr key={workspace.workspaceId}>
                <td><a href={`/${runtime.locale}/intake/${workspace.workspaceId}`}>{workspace.workspaceId}</a></td>
                <td><a href={`/${runtime.locale}/ktg-cases/${workspace.ktgCaseId}`}>{workspace.ktgCaseId}</a></td>
                <td>{workspace.status}</td>
                <td>{workspace.assignedHandler}</td>
                <td>{workspace.blockerCount}</td>
                <td>{workspace.overdue ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Intake unavailable" message={error instanceof Error ? error.message : "Unable to load the intake queue."} />;
  }
}
