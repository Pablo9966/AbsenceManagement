import {
  DetailList,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  WorkflowTable,
  resolveRouteAccess,
} from "../../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../../src/runtime.js";

export default async function EmployeeAbsenceDetailPage(props: {
  params: Promise<{ locale: string; episodeId: string }>;
}) {
  const { locale, episodeId } = await props.params;
  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/absences/[episodeId]"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeAbsenceDetail.title"] ?? "Absence Detail"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const detail = await runtime.workflowClient.getEmployeeAbsenceDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
      episodeId,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeAbsenceDetail.title"] ?? "Absence Detail"}
          description={detail.data.periodLabel}
        />
        <SectionCard title={runtime.messages["page.employeeAbsenceDetail.title"] ?? "Absence Detail"}>
          <DetailList items={[
            { label: runtime.messages["employee.field.status"] ?? "Status", value: detail.data.displayStatus },
            { label: runtime.messages["employee.field.source"] ?? "Source", value: detail.data.source },
            { label: runtime.messages["employee.field.startDate"] ?? "Start date", value: detail.data.startDate },
            { label: runtime.messages["employee.field.expectedEndDate"] ?? "Expected end date", value: detail.data.expectedEndDate ?? "—" },
            { label: runtime.messages["employee.field.actualEndDate"] ?? "Actual end date", value: detail.data.actualEndDate ?? "—" },
          ]} />
        </SectionCard>
        <SectionCard title={runtime.messages["employee.section.timeline"] ?? "Timeline"}>
          <WorkflowTable>
            <thead>
              <tr>
                <th>{runtime.messages["employee.field.date"] ?? "Date"}</th>
                <th>{runtime.messages["employee.field.event"] ?? "Event"}</th>
              </tr>
            </thead>
            <tbody>
              {detail.data.timeline.map((item, index) => (
                <tr key={`${item.date}-${index}`}>
                  <td>{item.date}</td>
                  <td>{item.label}</td>
                </tr>
              ))}
            </tbody>
          </WorkflowTable>
        </SectionCard>
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.absenceDetail.title"] ?? "Absence detail unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.absenceDetail.message"] ?? "Unable to load absence detail."}
      />
    );
  }
}
