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

export default async function InternalBenefitDetailPage(props: {
  params: Promise<{ locale: string; calculationId: string }>;
}) {
  const { locale, calculationId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/benefits/[calculationId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to this calculation detail." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Calculation Detail" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalBenefitDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      calculationId,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Calculation Detail" description="Entitlement periods, adjustments, and payment instruction summary." />
        <SectionCard title="Entitlement periods">
          <WorkflowTable>
            <thead><tr><th>Period</th><th>Payable amount</th></tr></thead>
            <tbody>
              {response.data.entitlementPeriods.map((period) => (
                <tr key={period.id}>
                  <td>{period.label}</td>
                  <td>CHF {period.payableAmountChf.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </WorkflowTable>
        </SectionCard>
        <SectionCard title="Payment summary">
          <ul>{response.data.paymentInstructionSummary.map((item) => <li key={item.id}>{item.routing}: CHF {item.amountChf.toFixed(2)}</li>)}</ul>
          <p>Case: <a href={`/${runtime.locale}/ktg-cases/${response.data.ktgCaseId}`}>{response.data.ktgCaseId}</a></p>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title="Calculation detail unavailable" message={error instanceof Error ? error.message : "Unable to load the calculation detail."} />;
  }
}
