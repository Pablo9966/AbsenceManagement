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

export default async function InternalPaymentRunsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/payment-runs"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to payment runs." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Payment Runs" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listInternalPaymentRuns({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No payment runs" message="There are no payment runs available yet." />;
    }

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Internal Portal"
          title="Payment Runs"
          description="Payment run list with status, instruction count, net amounts, and reconciliation state."
        />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Run Number</th>
              <th>Type</th>
              <th>Status</th>
              <th>Instructions</th>
              <th>Net Amount CHF</th>
              <th>Reconciliation</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((run) => (
              <tr key={run.runId}>
                <td><a href={`/${runtime.locale}/payment-runs/${run.runId}`}>{run.runNumber}</a></td>
                <td>{run.runType}</td>
                <td>{run.runStatus}</td>
                <td>{run.instructionCount}</td>
                <td>CHF {run.totalNetAmountChf.toFixed(2)}</td>
                <td>{run.reconciliationStatus}</td>
                <td>{run.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Payment runs unavailable" message={error instanceof Error ? error.message : "Unable to load payment runs."} />;
  }
}
