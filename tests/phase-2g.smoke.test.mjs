import test from "node:test";
import assert from "node:assert/strict";

import { resolveRouteAccess } from "../packages/frontend-platform/src/access/guards.js";
import { employerRouteAccessRules } from "../packages/frontend-platform/src/navigation/employer.js";

const executeWorkflow = async (requestPath, options) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath, options);
};

test("employer analytics dashboard returns trend, cause, cost, duration, RTW, and heatmap datasets", { concurrency: false }, async () => {
  const response = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-employer-demo&locale=de-CH&periodStart=2026-01-01&periodEnd=2026-12-31&granularity=monthly");
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.meta.locale, "de-CH");
  assert.equal(response.body.data.periodStart, "2026-01-01");
  assert.equal(response.body.data.periodEnd, "2026-12-31");
  assert.equal(response.body.data.granularity, "monthly");
  assert.ok(response.body.data.summary.absenceVolume >= 2);
  assert.ok(response.body.data.summary.totalCostChf > 0);
  assert.ok(response.body.data.trends.some((point) => point.bucket === "2026-04" && point.absenceVolume >= 2));
  assert.ok(response.body.data.causes.some((cause) => cause.causeCategory === "illness"));
  assert.ok(response.body.data.heatmap.some((cell) => cell.bucket === "2026-04"));
  assert.ok(response.body.data.metricDefinitions.totalCostChf.includes("cost"));
  assert.equal(response.body.data.latestRefresh.jobStatus, "completed");
  assert.ok(response.body.data.latestRefresh.triggeredAt);
});

test("employer analytics period filters change returned projection data", { concurrency: false }, async () => {
  const fullYear = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-employer-demo&locale=en-CH&periodStart=2026-01-01&periodEnd=2026-12-31&granularity=monthly");
  const march = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-employer-demo&locale=en-CH&periodStart=2026-03-01&periodEnd=2026-03-31&granularity=monthly");
  assert.equal(fullYear.statusCode, 200);
  assert.equal(march.statusCode, 200);
  assert.equal(march.body.meta.locale, "en-CH");
  assert.equal(march.body.data.periodStart, "2026-03-01");
  assert.notEqual(fullYear.body.data.summary.absenceVolume, march.body.data.summary.absenceVolume);
});

test("employer analytics refresh stores completed projection output", { concurrency: false }, async () => {
  const refreshed = await executeWorkflow("/v1/employer/analytics/refresh", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      userId: "user-employer-admin",
      periodStart: "2026-04-01",
      periodEnd: "2026-04-30",
      granularity: "weekly",
    },
  });
  assert.equal(refreshed.statusCode, 200);
  assert.equal(refreshed.body.data.jobStatus, "completed");
  assert.ok(refreshed.body.data.refreshJobId);
  assert.equal(refreshed.body.data.dashboard.granularity, "weekly");

  const read = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-employer-demo&locale=de-CH&periodStart=2026-04-01&periodEnd=2026-04-30&granularity=weekly");
  assert.equal(read.statusCode, 200);
  assert.equal(read.body.data.refreshedAt, refreshed.body.data.refreshedAt);
  assert.equal(read.body.data.refreshJobId, refreshed.body.data.refreshJobId);
  assert.equal(read.body.data.latestRefresh.jobStatus, "completed");
  assert.equal(read.body.data.latestRefresh.jobId, refreshed.body.data.refreshJobId);
  assert.equal(read.body.data.latestRefresh.triggeredBy, "user-employer-admin");
});

test("analytics access remains employer-management scoped", async () => {
  const forbidden = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-internal-demo&locale=de-CH");
  assert.equal(forbidden.statusCode, 403);

  const rule = employerRouteAccessRules.find((item) => item.routePattern === "/[locale]/analytics");
  assert.equal(resolveRouteAccess(rule, {
    userId: "hr-manager",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["hr_manager"],
    effectivePermissions: [{ resourceType: "dashboard", action: "read", allowed: true }],
  }), "allow");
  assert.equal(resolveRouteAccess(rule, {
    userId: "employee",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["employee_self_service"],
    effectivePermissions: [],
  }), "permission_denied");
});
