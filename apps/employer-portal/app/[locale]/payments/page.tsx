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

export default async function EmployerPaymentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/payments"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to payment visibility." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Payments" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.listEmployerPayments({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    if (response.data.length === 0) {
      return <EmptyState title="No payment summaries" message="There are no read-only payment summaries available yet." />;
    }

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Employer Portal" title="Payments" description="Read-only payment visibility without payment-run orchestration or operational controls." />
        <WorkflowTable>
          <thead>
            <tr>
              <th>Case</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {response.data.map((payment) => (
              <tr key={payment.paymentSummaryId}>
                <td><a href={`/${runtime.locale}/cases/${payment.caseId}`}>{payment.caseNumber}</a></td>
                <td>{payment.periodLabel}</td>
                <td>CHF {payment.amountChf.toFixed(2)}</td>
                <td>{payment.status}</td>
              </tr>
            ))}
          </tbody>
        </WorkflowTable>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Payments unavailable" message={error instanceof Error ? error.message : "Unable to load payment visibility."} />;
  }
}
