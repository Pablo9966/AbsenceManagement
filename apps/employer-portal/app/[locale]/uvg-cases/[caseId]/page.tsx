import {
  DetailList,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";
import { generateUvgAccidentReport } from "./actions.js";

export default async function EmployerUvgCaseDetailPage(props: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const t = (key: string): string => runtime.messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/uvg-cases/[caseId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("uvg.access.employerDetail")} />;
  }
  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.uvgCaseDetail.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getEmployerUvgCaseDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      caseId,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow={t("shell.employerPortal")} title={t("page.uvgCaseDetail.title")} description={response.data.incidentSummary} />
        <SectionCard title={t("uvg.field.caseNumber")}>
          <DetailList items={[
            { label: t("uvg.field.caseNumber"), value: response.data.caseNumber },
            { label: t("uvg.field.employee"), value: response.data.employeeName },
            { label: t("uvg.field.type"), value: response.data.uvgCaseType.toUpperCase() },
            { label: t("uvg.field.status"), value: response.data.caseStatus },
            { label: t("uvg.field.accidentDate"), value: response.data.accidentDate },
            { label: t("uvg.field.location"), value: response.data.incidentLocation },
            { label: t("uvg.field.coordination"), value: response.data.coordinationStatus },
            { label: t("uvg.field.ktgCase"), value: response.data.linkedKtgCaseId ?? "-" },
          ]} />
        </SectionCard>
        <SectionCard title={t("uvg.section.documents")}>
          <p>{response.data.linkedDocumentIds.join(", ") || t("common.empty")}</p>
          <form action={generateUvgAccidentReport}>
            <input type="hidden" name="locale" value={runtime.locale} />
            <input type="hidden" name="caseId" value={response.data.caseId} />
            <button type="submit">{t("uvg.cta.generateReport")}</button>
          </form>
          <ul>{response.data.reportArtifacts.map((artifact) => <li key={artifact.artifactId}>{artifact.fileName} ({artifact.generatedAt})</li>)}</ul>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("page.uvgCaseDetail.title")} message={error instanceof Error ? error.message : t("uvg.error.cases")} />;
  }
}
