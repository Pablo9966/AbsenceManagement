import {
  ErrorState,
  MetricCards,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../src/frontend.js";
import { getInternalPortalRuntime } from "../../src/runtime.js";

export default async function InternalDashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/dashboard"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title="Access denied" message="You do not have access to the internal dashboard." />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title="Dashboard" dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const summary = await runtime.workflowClient.getInternalDashboard({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
    });

    return (
      <div className="surface-card">
        <PageHeader eyebrow="Internal Portal" title="Dashboard" description="Operational workload for intake, case review, benefit review, and compliance signals." />
        <MetricCards items={summary.data.cards} />
      </div>
    );
  } catch (error) {
    return <ErrorState title="Dashboard unavailable" message={error instanceof Error ? error.message : "Unable to load dashboard."} />;
  }
}
