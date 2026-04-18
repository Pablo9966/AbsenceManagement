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
import { getInternalPortalRuntime } from "../../../src/runtime.js";

export default async function InternalBenefitsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/benefits"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to benefit calculations." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Benefit Review" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listInternalBenefits({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No calculations" message="There are no benefit calculations ready for review." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Benefit Review" description="Calculation review list with status, case reference, and entitlement period visibility." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Calculation</th>
              <th>Case</th>
              <th>Status</th>
              <th>Reference date</th>
              <th>Periods</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((calculation) => (
              <tr key={calculation.calculationId}>
                <td><a href={`/${runtime.locale}/benefits/${calculation.calculationId}`}>{calculation.calculationId}</a></td>
                <td><a href={`/${runtime.locale}/ktg-cases/${calculation.ktgCaseId}`}>{calculation.ktgCaseId}</a></td>
                <td>{calculation.status}</td>
                <td>{calculation.referenceDate}</td>
                <td>{calculation.periodCount}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Benefit review unavailable" message={error instanceof Error ? error.message : "Unable to load benefit calculations."} />;
  }
}
