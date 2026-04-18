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
} from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalPaymentRunDetailPage(props: {
  params: Promise<{ locale: string; runId: string }>;
}) {
  const { locale, runId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/payment-runs"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to payment run details." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Payment Run Detail" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalPaymentRunDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      runId,
    });

    const run = response.data;

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow="Internal Portal"
          title={run.runNumber}
          description={`Payment run detail — ${run.runType} / ${run.runStatus}`}
        />

        <SectionCard title="Run Summary">
          <dl>
            <dt>Status</dt><dd>{run.runStatus}</dd>
            <dt>Type</dt><dd>{run.runType}</dd>
            <dt>Created</dt><dd>{run.createdAt} by {run.createdBy}</dd>
            <dt>Instruction count</dt><dd>{run.instructionCount}</dd>
            <dt>Gross CHF</dt><dd>{run.totalGrossAmountChf.toFixed(2)}</dd>
            <dt>Net CHF</dt><dd>{run.totalNetAmountChf.toFixed(2)}</dd>
            <dt>Reconciliation</dt><dd>{run.reconciliationStatus}</dd>
            {run.exportedAt && <><dt>Exported at</dt><dd>{run.exportedAt}</dd></>}
            {run.completedAt && <><dt>Completed at</dt><dd>{run.completedAt}</dd></>}
            {run.cancelledAt && <><dt>Cancelled at</dt><dd>{run.cancelledAt}</dd></>}
            {run.notes && <><dt>Notes</dt><dd>{run.notes}</dd></>}
          </dl>
        </SectionCard>

        <SectionCard title="Run Items">
          {run.items.length === 0 ? (
            <EmptyState title="No items" message="This run has no payment instructions." />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>Instruction ID</th>
                  <th>Case</th>
                  <th>Payee</th>
                  <th>Period</th>
                  <th>Net CHF</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {run.items.map((item) => (
                  <tr key={item.runItemId}>
                    <td>{item.paymentInstructionId}</td>
                    <td><a href={`/${runtime.locale}/ktg-cases/${item.ktgCaseId}`}>{item.ktgCaseId}</a></td>
                    <td>{item.payeeReference}</td>
                    <td>{item.periodLabel}</td>
                    <td>CHF {item.netAmountChf.toFixed(2)}</td>
                    <td>{item.itemStatus}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>

        <SectionCard title="Export Packages">
          {run.exportPackages.length === 0 ? (
            <EmptyState title="No exports" message="No export packages have been generated for this run." />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>Format</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Generated</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {run.exportPackages.map((pkg) => (
                  <tr key={pkg.exportId}>
                    <td>{pkg.exportFormat}</td>
                    <td>{pkg.fileName}</td>
                    <td>{pkg.exportStatus}</td>
                    <td>{pkg.generatedAt}</td>
                    <td>{pkg.generatedBy}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>

        <SectionCard title="Statements">
          {run.statements.length === 0 ? (
            <EmptyState title="No statements" message="No statement PDFs have been generated for this run." />
          ) : (
            <WorkflowTable>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Case</th>
                  <th>Period</th>
                  <th>File</th>
                  <th>Size (bytes)</th>
                  <th>Generated</th>
                </tr>
              </thead>
              <tbody>
                {run.statements.map((stmt) => (
                  <tr key={stmt.statementId}>
                    <td>{stmt.statementType}</td>
                    <td>{stmt.ktgCaseId}</td>
                    <td>{stmt.periodLabel}</td>
                    <td>{stmt.fileName}</td>
                    <td>{stmt.pdfSizeBytes}</td>
                    <td>{stmt.generatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </WorkflowTable>
          )}
        </SectionCard>

        <SectionCard title="Reconciliation">
          {!run.reconciliation ? (
            <EmptyState title="No reconciliation record" message="Reconciliation tracking starts after export." />
          ) : (
            <dl>
              <dt>Status</dt><dd>{run.reconciliation.reconciliationStatus}</dd>
              {run.reconciliation.reconciledAt && <><dt>Reconciled at</dt><dd>{run.reconciliation.reconciledAt}</dd></>}
              {run.reconciliation.reconciledBy && <><dt>Reconciled by</dt><dd>{run.reconciliation.reconciledBy}</dd></>}
              {run.reconciliation.payrollBookingReference && <><dt>Booking reference</dt><dd>{run.reconciliation.payrollBookingReference}</dd></>}
              {run.reconciliation.confirmationReceivedAt && <><dt>Confirmation received</dt><dd>{run.reconciliation.confirmationReceivedAt}</dd></>}
              {run.reconciliation.mismatchReason && <><dt>Mismatch reason</dt><dd>{run.reconciliation.mismatchReason}</dd></>}
            </dl>
          )}
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Payment run unavailable" message={error instanceof Error ? error.message : "Unable to load payment run detail."} />;
  }
}
