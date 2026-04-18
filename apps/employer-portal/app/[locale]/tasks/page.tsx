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

export default async function EmployerTasksPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/tasks"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to tasks and deadlines." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Tasks" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerTasks({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No tasks" message="There are no open tasks or deadlines for this tenant." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Employer Portal" title="Tasks & Deadlines" description="Read-only operational tasks with direct links to downstream workflow screens." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Task</th>
              <th>Status</th>
              <th>Due</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((task) => (
              <tr key={task.taskId}>
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>{task.dueAt ?? "-"}</td>
                <td><a href={task.href}>Open</a></td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Tasks unavailable" message={error instanceof Error ? error.message : "Unable to load tasks."} />;
  }
}
