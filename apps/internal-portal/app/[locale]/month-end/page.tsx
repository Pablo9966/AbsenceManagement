import {
  EmptyState,
  ErrorState,
  MetricCards,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";

export default async function InternalMonthEndPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/payment-runs"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to month-end reconciliation." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Month-End Reconciliation" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalMonthEndReport({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    const report = response.data;

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Internal Portal"
          title="Month-End Reconciliation"
          description={`Payment run reconciliation overview — generated at ${report.reportGeneratedAt}`}
        />

        <MetricCards
          items={[
            { key: "total-runs", label: "Total Runs", value: report.totalRuns },
            { key: "confirmed", label: "Confirmed", value: report.confirmed },
            { key: "unresolved", label: "Unresolved", value: report.unresolved },
            { key: "mismatches", label: "Mismatches", value: report.mismatches },
          ]}
        />

        <SectionCard title={`Total Net Amount: CHF ${report.totalNetAmountChf.toFixed(2)}`}>
          {report.entries.length === 0 ? (
            <EmptyState title="No runs" message="No payment runs found for this period." />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>Run Number</th>
                  <th>Status</th>
                  <th>Net CHF</th>
                  <th>Reconciliation</th>
                  <th>Exported</th>
                  <th>Booking Reference</th>
                  <th>Mismatch</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((entry) => (
                  <tr key={entry.runId} style={entry.mismatch ? { background: "#fff3cd" } : undefined}>
                    <td><a href={`/${runtime.locale}/payment-runs/${entry.runId}`}>{entry.runNumber}</a></td>
                    <td>{entry.runStatus}</td>
                    <td>CHF {entry.totalNetAmountChf.toFixed(2)}</td>
                    <td>{entry.reconciliationStatus}</td>
                    <td>{entry.exportedAt ?? "—"}</td>
                    <td>{entry.bookingReference ?? "—"}</td>
                    <td>{entry.mismatch ? "⚠ Mismatch" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Month-end report unavailable" message={error instanceof Error ? error.message : "Unable to load month-end reconciliation report."} />;
  }
}
