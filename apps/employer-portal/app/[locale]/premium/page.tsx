import {
  DetailList,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";
import { calculateAdjustment, createInstallmentPlan, generateSettlement, submitSalaryMass } from "./actions.js";

export default async function EmployerPremiumPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const t = (key: string): string => runtime.messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/premium"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("premium.access.denied")} />;
  }
  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.premium.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getEmployerPremiumDashboard({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });
    const dashboard = response.data;
    const hidden = (
      <>
        <input type="hidden" name="locale" value={runtime.locale} />
        <input type="hidden" name="periodId" value={dashboard.periodId} />
      </>
    );

    return (
      <div className="surface-card">
        <PageHeader eyebrow={t("shell.employerPortal")} title={t("page.premium.title")} description={t("premium.description")} />
        <SectionCard title={t("premium.section.dashboard")}>
          <DetailList items={[
            { label: t("premium.field.period"), value: dashboard.periodLabel },
            { label: t("premium.field.reportingStatus"), value: dashboard.reportingStatus },
            { label: t("premium.field.salaryMassStatus"), value: dashboard.salaryMassStatus },
            { label: t("premium.field.insuredSalaryMass"), value: `${dashboard.insuredSalaryMassChf} CHF` },
            { label: t("premium.field.claimsRatio"), value: `${Math.round(dashboard.claimsRatio * 10000) / 100}%` },
            { label: t("premium.field.expectedPremium"), value: `${dashboard.expectedPremiumChf} CHF` },
            { label: t("premium.field.adjustmentDelta"), value: `${dashboard.adjustmentDeltaChf} CHF` },
            { label: t("premium.field.adjustmentType"), value: dashboard.adjustmentType ?? "-" },
            { label: t("premium.field.openInstallments"), value: `${dashboard.openInstallmentAmountChf} CHF` },
          ]} />
        </SectionCard>
        <SectionCard title={t("premium.section.salaryMass")}>
          <form action={submitSalaryMass}>
            {hidden}
            <p><label>{t("premium.field.annualSalaryMass")}<br /><input name="annualSalaryMassChf" type="number" defaultValue="12000000" required /></label></p>
            <p><label>{t("premium.field.insuredSalaryMass")}<br /><input name="insuredSalaryMassChf" type="number" defaultValue="10500000" required /></label></p>
            <p><label>{t("premium.field.employeeCount")}<br /><input name="employeeCount" type="number" defaultValue="120" required /></label></p>
            <p><label>{t("premium.field.notes")}<br /><input name="notes" /></label></p>
            <button type="submit">{t("premium.cta.submitSalaryMass")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("premium.section.adjustment")}>
          <form action={calculateAdjustment}>
            {hidden}
            <input type="hidden" name="reportId" value={dashboard.latestReportId ?? ""} />
            <p><label>{t("premium.field.priorPremium")}<br /><input name="priorPremiumChf" type="number" defaultValue="185000" required /></label></p>
            <p><label>{t("premium.field.premiumRate")}<br /><input name="premiumRate" type="number" step="0.0001" defaultValue="0.018" required /></label></p>
            <p><label>{t("premium.field.claimsPaid")}<br /><input name="claimsPaidChf" type="number" defaultValue="82000" required /></label></p>
            <p><label>{t("premium.field.claimsReserved")}<br /><input name="claimsReservedChf" type="number" defaultValue="18000" /></label></p>
            <button type="submit" disabled={!dashboard.latestReportId}>{t("premium.cta.calculateAdjustment")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("premium.section.settlement")}>
          <form action={generateSettlement}>
            {hidden}
            <input type="hidden" name="calculationId" value={dashboard.latestCalculationId ?? ""} />
            <button type="submit" disabled={!dashboard.latestCalculationId}>{t("premium.cta.generateSettlement")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("premium.section.installments")}>
          <form action={createInstallmentPlan}>
            {hidden}
            <p><label>{t("premium.field.totalAmount")}<br /><input name="totalAmountChf" type="number" defaultValue={Math.max(0, dashboard.adjustmentDeltaChf)} required /></label></p>
            <p><label>{t("premium.field.installmentCount")}<br /><input name="installmentCount" type="number" defaultValue="3" required /></label></p>
            <p><label>{t("premium.field.startDate")}<br /><input name="startDate" type="date" defaultValue="2026-05-01" required /></label></p>
            <button type="submit">{t("premium.cta.createInstallmentPlan")}</button>
          </form>
          <p>{t("premium.field.installmentPlans")}: {dashboard.installmentPlanIds.join(", ") || "-"}</p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("page.premium.title")} message={error instanceof Error ? error.message : t("premium.error.dashboard")} />;
  }
}
