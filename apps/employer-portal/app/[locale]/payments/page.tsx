import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
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
    const [paymentsResponse, runsResponse] = await Promise.all([
      runtime.workflowClient.listEmployerPayments({
        tenantId: runtime.tenantContext.tenantId,
        locale: runtime.locale,
      }),
      runtime.workflowClient.listEmployerPaymentRunSummaries({
        tenantId: runtime.tenantContext.tenantId,
        locale: runtime.locale,
      }),
    ]);

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Employer Portal"
          title="Payments"
          description="Read-only payment visibility — payment instructions and payment run summaries."
        />

        <SectionCard title="Payment Instructions">
          {paymentsResponse.data.length === 0 ? (
            <EmptyState title="No payment summaries" message="There are no payment instruction summaries available yet." />
          ) : (
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
                {paymentsResponse.data.map((payment) => (
                  <tr key={payment.paymentSummaryId}>
                    <td><a href={`/${runtime.locale}/cases/${payment.caseId}`}>{payment.caseNumber}</a></td>
                    <td>{payment.periodLabel}</td>
                    <td>CHF {payment.amountChf.toFixed(2)}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>

        <SectionCard title="Payment Runs">
          {runsResponse.data.length === 0 ? (
            <EmptyState title="No payment runs" message="No payment runs have been processed yet." />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>Run Number</th>
                  <th>Instructions</th>
                  <th>Net Amount CHF</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {runsResponse.data.map((run) => (
                  <tr key={run.runId}>
                    <td>{run.runNumber}</td>
                    <td>{run.instructionCount}</td>
                    <td>CHF {run.totalNetAmountChf.toFixed(2)}</td>
                    <td>{run.runStatus}</td>
                    <td>{run.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Payments unavailable" message={error instanceof Error ? error.message : "Unable to load payment visibility."} />;
  }
}
