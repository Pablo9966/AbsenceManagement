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

export default async function EmployerAbsenceDetailPage(props: {
  params: Promise<{ locale: string; episodeId: string }>;
}) {
  const { locale, episodeId } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/absences/[episodeId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to this absence detail." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Absence Detail" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getEmployerAbsenceDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      episodeId,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Employer Portal"
          title="Absence Detail"
          description="Employee summary, timeline, certificates, and linked KTG case references."
        />
        <SectionCard title="Summary">
          <DetailList items={[
            { label: "Employee", value: response.data.employeeName },
            { label: "Status", value: response.data.status },
            { label: "Episode", value: response.data.episodeId },
          ]} />
        </SectionCard>
        <SectionCard title="Timeline">
          <ul>
            {response.data.timeline.map((entry) => (
              <li key={`${entry.date}-${entry.label}`}>{entry.date}: {entry.label}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Cross-links">
          <p>Certificates: {response.data.certificateDocumentIds.join(", ") || "none"}</p>
          <p>Linked cases: {response.data.linkedCaseIds.map((caseId) => <a key={caseId} href={`/${runtime.locale}/cases/${caseId}`}>{caseId}</a>)}</p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Absence detail unavailable" message={error instanceof Error ? error.message : "Unable to load the absence detail."} />;
  }
}
