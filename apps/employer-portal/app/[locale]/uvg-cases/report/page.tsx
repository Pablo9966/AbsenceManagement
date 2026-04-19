import {
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";
import { submitUvgAccidentReport } from "./actions.js";

export default async function EmployerUvgReportPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const t = (key: string): string => runtime.messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/uvg-cases/report"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("uvg.access.employerReport")} />;
  }
  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.uvgReport.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={t("shell.employerPortal")}
          title={t("page.uvgReport.title")}
          description={t("uvg.description.report")}
        />
        <SectionCard title={t("uvg.section.intake")}>
          <form action={submitUvgAccidentReport}>
            <input type="hidden" name="locale" value={runtime.locale} />
            <p><label>{t("uvg.field.employee")}<br /><input name="employeeId" defaultValue="employee-0001" required /></label></p>
            <p><label>{t("uvg.field.policy")}<br /><input name="policyId" defaultValue="policy-uvg-001" required /></label></p>
            <p><label>{t("uvg.field.type")}<br /><select name="uvgCaseType" defaultValue="bu"><option value="bu">BU</option><option value="nbu">NBU</option></select></label></p>
            <p><label>{t("uvg.field.occupationalContext")}<br /><select name="occupationalContext" defaultValue="occupational"><option value="occupational">occupational</option><option value="non_occupational">non_occupational</option><option value="unknown">unknown</option></select></label></p>
            <p><label>{t("uvg.field.accidentDate")}<br /><input name="accidentDate" type="date" required /></label></p>
            <p><label>{t("uvg.field.accidentTime")}<br /><input name="accidentTime" type="time" /></label></p>
            <p><label>{t("uvg.field.location")}<br /><input name="accidentPlace" required /></label></p>
            <p><label>{t("uvg.field.description")}<br /><textarea name="accidentDescription" required /></label></p>
            <p><label>{t("uvg.field.witness")}<br /><textarea name="witnessDetails" /></label></p>
            <p><label>{t("uvg.field.ktgCase")}<br /><input name="ktgCaseId" placeholder="case-2001" /></label></p>
            <p><label><input name="policeInvolvedFlag" type="checkbox" /> {t("uvg.field.police")}</label></p>
            <button type="submit">{t("uvg.cta.submit")}</button>
          </form>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("page.uvgReport.title")} message={error instanceof Error ? error.message : t("uvg.error.cases")} />;
  }
}
