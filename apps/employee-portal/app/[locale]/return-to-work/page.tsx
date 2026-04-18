import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
  SectionCard,
} from "../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../src/runtime.js";
import { confirmReturnToWorkAction } from "../actions.js";

export default async function ReturnToWorkPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/return-to-work"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeReturnToWork.title"] ?? "Confirm Return to Work"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const state = await runtime.workflowClient.getEmployeeReturnToWorkState({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
    });

    if (state.data.length === 0) {
      return <EmptyState title={runtime.messages["page.employeeReturnToWork.title"] ?? "Confirm Return to Work"} message={runtime.messages["employee.empty.returnToWork"] ?? "No return-to-work confirmations pending."} />;
    }

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeReturnToWork.title"] ?? "Confirm Return to Work"}
          description={runtime.messages["employee.returnToWork.description"] ?? "Confirm your actual return-to-work date."}
        />
        <SectionCard title={runtime.messages["page.employeeReturnToWork.title"] ?? "Confirm Return to Work"}>
          <form action={confirmReturnToWorkAction.bind(null, runtime.locale)} style={{ display: "grid", gap: "1rem", maxWidth: "42rem" }}>
            <label>
              <div>{runtime.messages["employee.field.absence"] ?? "Absence"}</div>
              <select name="episodeId" required>
                {state.data.map((item) => (
                  <option key={item.episodeId} value={item.episodeId}>
                    {item.periodLabel} ({item.currentStatus})
                  </option>
                ))}
              </select>
            </label>
            <label>
              <div>{runtime.messages["employee.field.actualReturnDate"] ?? "Actual return date"}</div>
              <input type="date" name="actualReturnDate" required />
            </label>
            <button type="submit" className="btn-primary">{runtime.messages["employee.cta.confirmReturnToWork"] ?? "Confirm return to work"}</button>
          </form>
        </SectionCard>
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.returnToWork.title"] ?? "Return to work unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.returnToWork.message"] ?? "Unable to load return-to-work state."}
      />
    );
  }
}
