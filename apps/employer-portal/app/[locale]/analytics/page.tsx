import {
  EmptyState,
  ErrorState,
  MetricCards,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  WorkflowTable,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function AnalyticsDashboardPage(props: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    periodStart?: string;
    periodEnd?: string;
    granularity?: "monthly" | "weekly";
    cause?: string;
    status?: string;
    caseType?: string;
    refresh?: string;
  }>;
}) {
  const { locale } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const runtime = await getEmployerPortalRuntime(locale);
  const messages = runtime.messages;
  const t = (key: string) => messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/analytics"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("analytics.access.denied")} />;
  }

  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.analytics.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const query = {
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      periodStart: searchParams?.periodStart,
      periodEnd: searchParams?.periodEnd,
      granularity: searchParams?.granularity === "weekly" ? "weekly" as const : "monthly" as const,
      cause: searchParams?.cause || undefined,
      status: searchParams?.status || undefined,
      caseType: searchParams?.caseType || undefined,
    };
    const response = searchParams?.refresh === "1"
      ? (await runtime.workflowClient.refreshEmployerAnalytics({
          ...query,
          userId: runtime.userContext.userId,
        })).data.dashboard
      : (await runtime.workflowClient.getEmployerAnalyticsDashboard(query)).data;

    if (response.trends.length === 0 && response.summary.absenceVolume === 0) {
      return <EmptyState title={t("common.empty")} message={t("analytics.empty")} />;
    }

    const refreshParams = new URLSearchParams({
      periodStart: response.periodStart,
      periodEnd: response.periodEnd,
      granularity: response.granularity,
      refresh: "1",
    });
    if (searchParams?.cause) refreshParams.set("cause", searchParams.cause);
    if (searchParams?.status) refreshParams.set("status", searchParams.status);
    if (searchParams?.caseType) refreshParams.set("caseType", searchParams.caseType);

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.shell.portalTitle}
          title={t("page.analytics.title")}
          description={t("analytics.description")}
          actions={<a className="btn-primary" href={`/${runtime.locale}/analytics?${refreshParams.toString()}`}>{t("analytics.cta.refresh")}</a>}
        />

        <form className="surface-card" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          <label>
            {t("analytics.field.periodStart")}
            <input name="periodStart" type="date" defaultValue={response.periodStart} />
          </label>
          <label>
            {t("analytics.field.periodEnd")}
            <input name="periodEnd" type="date" defaultValue={response.periodEnd} />
          </label>
          <label>
            {t("analytics.field.granularity")}
            <select name="granularity" defaultValue={response.granularity}>
              <option value="monthly">{t("analytics.option.monthly")}</option>
              <option value="weekly">{t("analytics.option.weekly")}</option>
            </select>
          </label>
          <label>
            {t("analytics.field.cause")}
            <input name="cause" defaultValue={searchParams?.cause ?? ""} placeholder={t("analytics.placeholder.cause")} />
          </label>
          <label>
            {t("analytics.field.status")}
            <input name="status" defaultValue={searchParams?.status ?? ""} placeholder={t("analytics.placeholder.status")} />
          </label>
          <label>
            {t("analytics.field.caseType")}
            <input name="caseType" defaultValue={searchParams?.caseType ?? ""} placeholder={t("analytics.placeholder.caseType")} />
          </label>
          <button className="btn-primary" type="submit" style={{ gridColumn: "1 / span 2" }}>{t("analytics.cta.applyFilters")}</button>
        </form>

        <MetricCards items={[
          { key: "absence-volume", label: t("analytics.metric.absenceVolume"), value: response.summary.absenceVolume },
          { key: "total-cost", label: t("analytics.metric.totalCost"), value: `CHF ${response.summary.totalCostChf.toLocaleString("de-CH")}` },
          { key: "average-duration", label: t("analytics.metric.averageDuration"), value: `${response.summary.averageDurationDays}d` },
          { key: "rtw", label: t("analytics.metric.rtwSuccess"), value: `${Math.round(response.summary.returnToWorkSuccessRate * 100)}%` },
          { key: "long-duration", label: t("analytics.metric.longDuration"), value: response.summary.longDurationCaseCount },
        ]} />

        <section style={{ marginTop: "2rem" }}>
          <h2>{t("analytics.section.trends")}</h2>
          <WorkflowTable>
            <thead>
              <tr><th>{t("analytics.label.bucket")}</th><th>{t("analytics.metric.absenceVolume")}</th><th>{t("analytics.label.cases")}</th><th>{t("analytics.metric.averageDuration")}</th><th>{t("analytics.metric.totalCost")}</th></tr>
            </thead>
            <tbody>
              {response.trends.map((point) => (
                <tr key={point.bucket}>
                  <td>{point.bucket}</td>
                  <td>{point.absenceVolume}</td>
                  <td>{point.caseVolume}</td>
                  <td>{point.averageDurationDays}d</td>
                  <td>CHF {point.totalCostChf.toLocaleString("de-CH")}</td>
                </tr>
              ))}
            </tbody>
          </WorkflowTable>
        </section>

        <div className="dashboard-grid" style={{ marginTop: "2rem" }}>
          <section className="surface-card">
            <h2>{t("analytics.section.causes")}</h2>
            <WorkflowTable>
              <tbody>
                {response.causes.map((cause) => (
                  <tr key={cause.causeCategory}><td>{cause.causeCategory}</td><td>{cause.count}</td><td>{Math.round(cause.share * 100)}%</td></tr>
                ))}
              </tbody>
            </WorkflowTable>
          </section>
          <section className="surface-card">
            <h2>{t("analytics.section.cost")}</h2>
            <WorkflowTable>
              <tbody>
                {response.costByCaseType.map((item) => (
                  <tr key={item.caseType}><td>{item.caseType}</td><td>CHF {item.amountChf.toLocaleString("de-CH")}</td></tr>
                ))}
              </tbody>
            </WorkflowTable>
          </section>
        </div>

        <div className="dashboard-grid" style={{ marginTop: "2rem" }}>
          <section className="surface-card">
            <h2>{t("analytics.section.duration")}</h2>
            <p>{t("analytics.metric.averageDuration")}: {response.duration.averageDurationDays}d</p>
            <p>{t("analytics.label.median")}: {response.duration.medianDurationDays}d</p>
            <p>{t("analytics.label.openClosed")}: {response.duration.openCaseCount} / {response.duration.closedCaseCount}</p>
          </section>
          <section className="surface-card">
            <h2>{t("analytics.section.heatmap")}</h2>
            <WorkflowTable>
              <tbody>
                {response.heatmap.slice(0, 8).map((cell) => (
                  <tr key={`${cell.bucket}-${cell.causeCategory}`}><td>{cell.bucket}</td><td>{cell.causeCategory}</td><td>{cell.count}</td></tr>
                ))}
              </tbody>
            </WorkflowTable>
          </section>
        </div>

        <section style={{ marginTop: "2rem" }}>
          <h2>{t("analytics.section.definitions")}</h2>
          <ul>
            {Object.entries(response.metricDefinitions).map(([key, definition]) => (
              <li key={key}><strong>{key}</strong>: {definition}</li>
            ))}
          </ul>
          <p>{t("analytics.label.refreshed")}: {response.refreshedAt}</p>
        </section>
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("analytics.error")} message={error instanceof Error ? error.message : t("analytics.error")} />;
  }
}
