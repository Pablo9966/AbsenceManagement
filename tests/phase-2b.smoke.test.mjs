import test from "node:test";
import assert from "node:assert/strict";

import { resolveRouteAccess } from "../packages/frontend-platform/src/access/guards.js";
import { employerRouteAccessRules } from "../packages/frontend-platform/src/navigation/employer.js";
import { internalRouteAccessRules } from "../packages/frontend-platform/src/navigation/internal.js";
const executeRequest = async (requestPath) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath);
};

test("employer absences list/detail route returns paginated workflow data", async () => {
  const listResponse = await executeRequest("/v1/employer/absences?tenantId=tenant-employer-demo&locale=de-CH&status=in_progress&page=1&pageSize=1");
  assert.equal(listResponse.statusCode, 200);
  assert.equal(listResponse.body.meta.totalCount, 1);
  assert.equal(listResponse.body.meta.page, 1);
  assert.equal(listResponse.body.meta.pageSize, 1);
  assert.equal(listResponse.body.meta.appliedFilters.status, "in_progress");
  assert.equal(listResponse.body.data.length, 1);

  const detailResponse = await executeRequest("/v1/employer/absences/episode-1001?tenantId=tenant-employer-demo&locale=de-CH");
  assert.equal(detailResponse.statusCode, 200);
  assert.equal(detailResponse.body.data.episodeId, "episode-1001");
  assert.ok(Array.isArray(detailResponse.body.data.timeline));
  assert.ok(detailResponse.body.data.timeline.length > 0);
});

test("internal intake and benefits routes return filtered workflow data", async () => {
  const intakeResponse = await executeRequest(
    "/v1/internal/intake?tenantId=tenant-internal-demo&locale=de-CH&status=intake_in_progress&assignedHandler=claims-handler&page=1&pageSize=10",
  );
  assert.equal(intakeResponse.statusCode, 200);
  assert.equal(intakeResponse.body.meta.totalCount, 1);
  assert.equal(intakeResponse.body.data[0].workspaceId, "workspace-6001");

  const benefitsResponse = await executeRequest(
    "/v1/internal/benefits?tenantId=tenant-internal-demo&locale=de-CH&status=calculated&caseId=case-2001",
  );
  assert.equal(benefitsResponse.statusCode, 200);
  assert.equal(benefitsResponse.body.meta.totalCount, 1);
  assert.equal(benefitsResponse.body.data[0].calculationId, "calculation-7001");
});

test("workflow detail endpoints return 404 for missing records", async () => {
  const response = await executeRequest("/v1/internal/ktg-cases/does-not-exist?tenantId=tenant-internal-demo&locale=de-CH");
  assert.equal(response.statusCode, 404);
});

test("route guards block employer users from internal routes and claims users from employer admin", () => {
  const employerUserContext = {
    userId: "user-hr-01",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["employer_hr"],
    effectivePermissions: [
      { resourceType: "dashboard", action: "read", allowed: true },
      { resourceType: "absence", action: "read", allowed: true },
    ],
  };
  const claimsUserContext = {
    userId: "claims-handler-1",
    tenantId: "tenant-internal-demo",
    locale: "de-CH",
    roleCodes: ["claims_handler"],
    effectivePermissions: [
      { resourceType: "dashboard", action: "read_internal", allowed: true },
      { resourceType: "claims_intake_workspace", action: "read", allowed: true },
      { resourceType: "ktg_case", action: "read_internal", allowed: true },
    ],
  };

  const internalIntakeRule = internalRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/intake");
  const employerAdminRule = employerRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/admin");

  assert.equal(resolveRouteAccess(internalIntakeRule, employerUserContext), "permission_denied");
  assert.equal(resolveRouteAccess(employerAdminRule, claimsUserContext), "redirect_dashboard");
});
