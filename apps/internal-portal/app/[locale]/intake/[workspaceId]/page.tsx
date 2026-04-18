import {
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalIntakeDetailPage(props: {
  params: Promise<{ locale: string; workspaceId: string }>;
}) {
  const { locale, workspaceId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/intake/[workspaceId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to this intake workspace." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Intake Workspace" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalIntakeDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      workspaceId,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Intake Workspace" description="Checklist items, missing information, evidence, and activity history." />
        <SectionCard title="Checklist">
          <WorkflowTable>
            <thead>
              <tr><th>Item</th><th>Status</th><th>Blocking</th></tr>
            </thead>
            <tbody>
              {response.data.checklistItems.map((item) => (
                <tr key={item.id}><td>{item.label}</td><td>{item.status}</td><td>{item.blocking ? "Yes" : "No"}</td></tr>
              ))}
            </tbody>
          </WorkflowTable>
        </SectionCard>
        <SectionCard title="Missing information">
          <ul>{response.data.missingInformationRequests.map((request) => <li key={request.id}>{request.requestedFrom}: {request.status}</li>)}</ul>
        </SectionCard>
        <SectionCard title="Cross-links">
          <p>Case: <a href={`/${runtime.locale}/ktg-cases/${response.data.ktgCaseId}`}>{response.data.ktgCaseId}</a></p>
          <p>Evidence references: {response.data.evidenceReferences.map((item) => item.referenceId).join(", ")}</p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Intake workspace unavailable" message={error instanceof Error ? error.message : "Unable to load the intake workspace."} />;
  }
}
