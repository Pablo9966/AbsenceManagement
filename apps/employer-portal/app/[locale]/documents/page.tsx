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

export default async function EmployerDocumentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/documents"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to employer documents." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Documents" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerDocuments({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No documents" message="There are no employer-visible documents right now." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Employer Portal" title="Document Inbox" description="Certificate and document visibility with links back to the related absence and KTG case." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Title</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Absence</th>
              <th>Case</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((document) => (
              <tr key={document.documentId}>
                <td>{document.title}</td>
                <td>{document.employeeName}</td>
                <td>{document.status}</td>
                <td>{document.linkedEpisodeId ? <a href={`/${runtime.locale}/absences/${document.linkedEpisodeId}`}>{document.linkedEpisodeId}</a> : "-"}</td>
                <td>{document.linkedCaseId ? <a href={`/${runtime.locale}/cases/${document.linkedCaseId}`}>{document.linkedCaseId}</a> : "-"}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Documents unavailable" message={error instanceof Error ? error.message : "Unable to load documents."} />;
  }
}
