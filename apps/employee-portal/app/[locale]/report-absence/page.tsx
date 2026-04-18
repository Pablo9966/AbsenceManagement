import {
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
  SectionCard,
} from "../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../src/runtime.js";
import { submitEmployeeAbsenceAction } from "../actions.js";

export default async function ReportAbsencePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/report-absence"),
      runtime.userContext,
    );

    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeReportAbsence.title"] ?? "Report Absence"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeReportAbsence.title"] ?? "Report Absence"}
          description={runtime.messages["employee.reportAbsence.description"] ?? "Report a sickness absence for yourself."}
        />
        <SectionCard title={runtime.messages["page.employeeReportAbsence.title"] ?? "Report Absence"}>
          <form action={submitEmployeeAbsenceAction.bind(null, runtime.locale)} style={{ display: "grid", gap: "1rem", maxWidth: "42rem" }}>
            <label>
              <div>{runtime.messages["employee.field.absenceType"] ?? "Absence type"}</div>
              <select name="absenceType" defaultValue="ktg_sickness">
                <option value="ktg_sickness">{runtime.messages["employee.option.sickness"] ?? "Sickness"}</option>
              </select>
            </label>
            <label>
              <div>{runtime.messages["employee.field.startDate"] ?? "Start date"}</div>
              <input type="date" name="startDate" required />
            </label>
            <label>
              <div>{runtime.messages["employee.field.expectedEndDate"] ?? "Expected end date"}</div>
              <input type="date" name="expectedEndDate" />
            </label>
            <label>
              <div>{runtime.messages["employee.field.comment"] ?? "Comment"}</div>
              <textarea name="comment" rows={4} />
            </label>
            <button type="submit" className="btn-primary">{runtime.messages["employee.cta.submitAbsence"] ?? "Submit absence"}</button>
          </form>
        </SectionCard>
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.reportAbsence.title"] ?? "Report absence unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.reportAbsence.message"] ?? "Unable to load self-service form."}
      />
    );
  }
}
