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
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerCasesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/cases"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to KTG cases." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="KTG Cases" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerCases({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No KTG cases" message="There are no employer-visible KTG cases yet." />;
    }

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Employer Portal"
          title="KTG Cases"
          description="Employer-visible KTG cases with status, deadlines, and linked absence references."
        />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Case number</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Deadline</th>
              <th>Linked absences</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((ktgCase) => (
              <tr key={ktgCase.caseId}>
                <td>{ktgCase.caseNumber}</td>
                <td>{ktgCase.employeeName}</td>
                <td>{ktgCase.status}</td>
                <td>{ktgCase.deadlineAt ?? "-"}</td>
                <td>{ktgCase.linkedEpisodeIds.join(", ")}</td>
                <td><a href={`/${runtime.locale}/cases/${ktgCase.caseId}`}>Open</a></td>
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
