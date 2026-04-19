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

export default async function EmployerUvgCasesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const t = (key: string): string => runtime.messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/uvg-cases"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("uvg.access.employerList")} />;
  }
  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.uvgCases.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerUvgCases({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={t("shell.employerPortal")}
          title={t("page.uvgCases.title")}
          description={t("uvg.description.employerList")}
        />
        <p><a href={`/${runtime.locale}/uvg-cases/report`}>{t("uvg.cta.report")}</a></p>
        {response.data.length === 0 ? (
          <EmptyState title={t("common.empty")} message={t("uvg.empty.cases")} />
        ) : (
          <WorkflowTable>
            <thead>
              <tr>
                <th>{t("uvg.field.caseNumber")}</th>
                <th>{t("uvg.field.employee")}</th>
                <th>{t("uvg.field.type")}</th>
                <th>{t("uvg.field.status")}</th>
                <th>{t("uvg.field.accidentDate")}</th>
                <th>{t("uvg.field.coordination")}</th>
              </tr>
            </thead>
            <tbody>
              {response.data.map((uvgCase) => (
                <tr key={uvgCase.caseId}>
                  <td><a href={`/${runtime.locale}/uvg-cases/${uvgCase.caseId}`}>{uvgCase.caseNumber}</a></td>
                  <td>{uvgCase.employeeName}</td>
                  <td>{uvgCase.uvgCaseType.toUpperCase()}</td>
                  <td>{uvgCase.caseStatus}</td>
                  <td>{uvgCase.accidentDate}</td>
                  <td>{uvgCase.coordinationStatus}</td>
                </tr>
              ))}
            </tbody>
          </WorkflowTable>
        )}
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("page.uvgCases.title")} message={error instanceof Error ? error.message : t("uvg.error.cases")} />;
  }
}
