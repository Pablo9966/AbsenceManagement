import {
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalKtgCaseDetailPage(props: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/ktg-cases/[caseId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to this case." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Case Detail" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalCaseDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      caseId,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Case Detail" description="Internal decision, deadline, submission, and relation context." />
        <SectionCard title="Decisions">
          <ul>{response.data.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
        </SectionCard>
        <SectionCard title="Deadlines">
          <ul>{response.data.deadlines.map((deadline) => <li key={deadline}>{deadline}</li>)}</ul>
        </SectionCard>
        <SectionCard title="Cross-links">
          <p>Absences: {response.data.linkedEpisodeIds.join(", ")}</p>
          <p>Documents: {response.data.linkedDocumentIds.join(", ")}</p>
          <p>Benefits: {response.data.linkedCalculationIds.map((id) => <a key={id} href={`/${runtime.locale}/benefits/${id}`}>{id}</a>)}</p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Case detail unavailable" message={error instanceof Error ? error.message : "Unable to load the case detail."} />;
  }
}
