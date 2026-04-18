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

export default async function EmployerCaseDetailPage(props: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/cases/[caseId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to this case detail." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Case Detail" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getEmployerCaseDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      caseId,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Employer Portal" title="Case Detail" description="Coverage, deadlines, linked absences, documents, and payment visibility." />
        <SectionCard title="Header">
          <DetailList items={[
            { label: "Case", value: response.data.caseNumber },
            { label: "Employee", value: response.data.employeeName },
            { label: "Status", value: response.data.status },
            { label: "Coverage", value: response.data.coverageSummary },
          ]} />
        </SectionCard>
        <SectionCard title="Deadlines">
          <ul>{response.data.deadlineSummary.map((item) => <li key={item}>{item}</li>)}</ul>
        </SectionCard>
        <SectionCard title="Cross-links">
          <p>Absences: {response.data.linkedEpisodeIds.map((id) => <a key={id} href={`/${runtime.locale}/absences/${id}`}>{id}</a>)}</p>
          <p>Documents: {response.data.linkedDocumentIds.join(", ") || "none"}</p>
          <p>Payments: {response.data.paymentSummaryIds.join(", ") || "none"}</p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Case detail unavailable" message={error instanceof Error ? error.message : "Unable to load the case detail."} />;
  }
}
