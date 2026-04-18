import {
  EmptyState,
  ErrorState,
  MetricCards,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerAbsencesPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ status?: string; employee?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/absences"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to the absence inbox." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Absence Inbox" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerAbsences({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      status: searchParams?.status,
      employee: searchParams?.employee,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No absences found" message="Try adjusting the status or employee filters." />;
    }

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Employer Portal"
          title="Absence Inbox"
          description="Active and recent absences with employee, status, incapacity, and linked case visibility."
          actions={<a className="btn-primary" href={`/${runtime.locale}/absences?status=in_progress`}>Show active</a>}
        />
        <MetricCards items={[
          { key: "count", label: "Visible absences", value: response.meta.totalCount ?? response.data.length },
          { key: "filter-status", label: "Status filter", value: response.meta.appliedFilters?.status ?? "all" },
          { key: "filter-employee", label: "Employee filter", value: response.meta.appliedFilters?.employee ?? "all" },
        ]} />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Period</th>
              <th>Status</th>
              <th>Incapacity</th>
              <th>Linked case</th>
              <th>Detail</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((absence) => (
              <tr key={absence.episodeId}>
                <td>{absence.employeeName}</td>
                <td>{absence.periodLabel}</td>
                <td>{absence.status}</td>
                <td>{absence.incapacityPercent}%</td>
                <td>{absence.linkedCaseId ? "Yes" : "No"}</td>
                <td><a href={`/${runtime.locale}/absences/${absence.episodeId}`}>Open</a></td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Absence inbox unavailable" message={error instanceof Error ? error.message : "Unable to load absences."} />;
  }
}
