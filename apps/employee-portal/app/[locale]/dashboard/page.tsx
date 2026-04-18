import {
  EmptyState,
  ErrorState,
  MetricCards,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  WorkflowTable,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../src/runtime.js";

export default async function EmployeeDashboardRoutePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/dashboard"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeDashboard.title"] ?? "My Dashboard"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const summary = await runtime.workflowClient.getEmployeeDashboard({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeDashboard.title"] ?? "My Dashboard"}
          description={runtime.messages["employee.dashboard.description"] ?? "See your active absences, documents, and next steps."}
        />

        <MetricCards items={[
          { key: "active-absences", label: runtime.messages["employee.metric.activeAbsences"] ?? "Active absences", value: summary.data.activeAbsenceCount, href: `/${runtime.locale}/status` },
          { key: "recent-documents", label: runtime.messages["employee.metric.recentDocuments"] ?? "Recent documents", value: summary.data.recentDocumentCount, href: `/${runtime.locale}/status` },
          { key: "pending-actions", label: runtime.messages["employee.metric.pendingActions"] ?? "Pending actions", value: summary.data.pendingActionCount, href: `/${runtime.locale}/return-to-work` },
        ]} />

        <SectionCard title={runtime.messages["employee.section.pendingActions"] ?? "Pending actions"}>
          {summary.data.pendingActions.length === 0 ? (
            <EmptyState title={runtime.messages["employee.section.pendingActions"] ?? "Pending actions"} message={runtime.messages["common.empty"] ?? "No data available"} />
          ) : (
            <ul>
              {summary.data.pendingActions.map((action) => (
                <li key={action.key}><a href={action.href}>{action.label}</a></li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title={runtime.messages["employee.section.activeAbsences"] ?? "Active absences"}>
          {summary.data.activeAbsences.length === 0 ? (
            <EmptyState title={runtime.messages["employee.section.activeAbsences"] ?? "Active absences"} message={runtime.messages["employee.empty.absences"] ?? "No absences found."} />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>{runtime.messages["employee.field.period"] ?? "Period"}</th>
                  <th>{runtime.messages["employee.field.status"] ?? "Status"}</th>
                  <th>{runtime.messages["employee.field.source"] ?? "Source"}</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.activeAbsences.map((absence) => (
                  <tr key={absence.episodeId}>
                    <td><a href={`/${runtime.locale}/absences/${absence.episodeId}`}>{absence.periodLabel}</a></td>
                    <td>{absence.displayStatus}</td>
                    <td>{absence.source}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>

        <SectionCard title={runtime.messages["employee.section.recentDocuments"] ?? "Recent documents"}>
          {summary.data.recentDocuments.length === 0 ? (
            <EmptyState title={runtime.messages["employee.section.recentDocuments"] ?? "Recent documents"} message={runtime.messages["employee.empty.documents"] ?? "No documents found."} />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>{runtime.messages["employee.field.documentType"] ?? "Document type"}</th>
                  <th>{runtime.messages["employee.field.status"] ?? "Status"}</th>
                  <th>{runtime.messages["employee.field.uploadedAt"] ?? "Uploaded"}</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.recentDocuments.map((document) => (
                  <tr key={document.documentId}>
                    <td><a href={`/${runtime.locale}/documents/${document.documentId}`}>{document.title}</a></td>
                    <td>{document.status}</td>
                    <td>{document.uploadedAt}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.dashboard.title"] ?? "Employee dashboard unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.dashboard.message"] ?? "Unable to load employee dashboard."}
      />
    );
  }
}
