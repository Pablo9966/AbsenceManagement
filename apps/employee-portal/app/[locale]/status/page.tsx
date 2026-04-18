import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  WorkflowTable,
  resolveRouteAccess,
} from "../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../src/runtime.js";

export default async function EmployeeStatusPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/status"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeStatus.title"] ?? "My Status"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const status = await runtime.workflowClient.getEmployeeStatusSummary({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeStatus.title"] ?? "My Status"}
          description={runtime.messages["employee.status.description"] ?? "Only your own absences and documents are visible here."}
        />

        <SectionCard title={runtime.messages["employee.section.activeAbsences"] ?? "Active absences"}>
          {status.data.activeAbsences.length === 0 ? (
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
                {status.data.activeAbsences.map((absence) => (
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
          {status.data.documents.length === 0 ? (
            <EmptyState title={runtime.messages["employee.section.recentDocuments"] ?? "Recent documents"} message={runtime.messages["employee.empty.documents"] ?? "No documents found."} />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>{runtime.messages["employee.field.documentType"] ?? "Document type"}</th>
                  <th>{runtime.messages["employee.field.status"] ?? "Status"}</th>
                  <th>{runtime.messages["employee.field.linkedEpisode"] ?? "Linked absence"}</th>
                </tr>
              </thead>
              <tbody>
                {status.data.documents.map((document) => (
                  <tr key={document.documentId}>
                    <td><a href={`/${runtime.locale}/documents/${document.documentId}`}>{document.title}</a></td>
                    <td>{document.status}</td>
                    <td>{document.linkedEpisodeId ?? "—"}</td>
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
        title={runtime.messages["employee.error.status.title"] ?? "Status unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.status.message"] ?? "Unable to load employee status."}
      />
    );
  }
}
