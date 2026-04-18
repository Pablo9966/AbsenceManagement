import test from "node:test";
import assert from "node:assert/strict";

import { resolveRouteAccess } from "../packages/frontend-platform/src/access/guards.js";
import { employeeRouteAccessRules } from "../packages/frontend-platform/src/navigation/employee.js";
import { internalRouteAccessRules } from "../packages/frontend-platform/src/navigation/internal.js";

const executeRequest = async (requestPath, options) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath, options);
};

test("employee self-service routes expose own data only and support absence reporting, certificate upload, and return-to-work confirmation", { concurrency: false }, async () => {
  const dashboardResponse = await executeRequest(
    "/v1/employee/dashboard?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001",
  );
  assert.equal(dashboardResponse.statusCode, 200);
  assert.equal(dashboardResponse.body.data.employeeId, "employee-0001");
  assert.ok(Array.isArray(dashboardResponse.body.data.activeAbsences));
  assert.ok(dashboardResponse.body.data.activeAbsences.every((item) => item.employeeId === "employee-0001"));

  const englishStatusResponse = await executeRequest(
    "/v1/employee/status?tenantId=tenant-employer-demo&locale=en-CH&employeeId=employee-0001",
  );
  assert.equal(englishStatusResponse.statusCode, 200);
  assert.equal(englishStatusResponse.body.meta.locale, "en-CH");

  const foreignDetailResponse = await executeRequest(
    "/v1/employee/absences/episode-1002?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001",
  );
  assert.equal(foreignDetailResponse.statusCode, 404);

  const createAbsenceResponse = await executeRequest("/v1/employee/report-absence", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      userId: "user-employee-self",
      absenceType: "ktg_sickness",
      startDate: "2026-04-18",
      expectedEndDate: "2026-04-22",
      comment: "Fever and doctor appointment booked.",
    },
  });
  assert.equal(createAbsenceResponse.statusCode, 200);
  const episodeId = createAbsenceResponse.body.data.episodeId;

  const newAbsenceDetail = await executeRequest(
    `/v1/employee/absences/${episodeId}?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001`,
  );
  assert.equal(newAbsenceDetail.statusCode, 200);
  assert.equal(newAbsenceDetail.body.data.episodeId, episodeId);
  assert.equal(newAbsenceDetail.body.data.employeeId, "employee-0001");

  const uploadCertificateResponse = await executeRequest("/v1/employee/documents/upload", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      userId: "user-employee-self",
      documentType: "medical_certificate",
      fileName: "arztzeugnis-2026-04-18.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 1024,
      absenceEpisodeId: episodeId,
      certificateStartDate: "2026-04-18",
      certificateEndDate: "2026-04-22",
      incapacityPercentage: 100,
      issuingProviderName: "Praxis Dr. Muster",
    },
  });
  assert.equal(uploadCertificateResponse.statusCode, 200);
  const documentId = uploadCertificateResponse.body.data.documentId;

  const documentDetailResponse = await executeRequest(
    `/v1/employee/documents/${documentId}?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001`,
  );
  assert.equal(documentDetailResponse.statusCode, 200);
  assert.equal(documentDetailResponse.body.data.documentId, documentId);
  assert.equal(documentDetailResponse.body.data.linkedEpisodeId, episodeId);
  assert.equal(documentDetailResponse.body.data.employeeId, "employee-0001");

  const returnStateResponse = await executeRequest(
    "/v1/employee/return-to-work?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001",
  );
  assert.equal(returnStateResponse.statusCode, 200);
  assert.ok(returnStateResponse.body.data.some((item) => item.episodeId === episodeId));

  const returnToWorkResponse = await executeRequest("/v1/employee/return-to-work", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      userId: "user-employee-self",
      episodeId,
      actualReturnDate: "2026-04-21",
    },
  });
  assert.equal(returnToWorkResponse.statusCode, 200);
  assert.equal(returnToWorkResponse.body.data.status, "closed");
  assert.equal(returnToWorkResponse.body.data.actualEndDate, "2026-04-21");

  const closedAbsenceDetail = await executeRequest(
    `/v1/employee/absences/${episodeId}?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001`,
  );
  assert.equal(closedAbsenceDetail.statusCode, 200);
  assert.equal(closedAbsenceDetail.body.data.actualEndDate, "2026-04-21");
});

test("employee route guards block internal workflow access", () => {
  const employeeUserContext = {
    userId: "user-employee-self",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["employee_self_service"],
    effectivePermissions: [
      { resourceType: "dashboard", action: "read", allowed: true },
      { resourceType: "absence", action: "read", allowed: true },
      { resourceType: "absence", action: "write", allowed: true },
      { resourceType: "document", action: "read", allowed: true },
      { resourceType: "document", action: "write", allowed: true },
    ],
  };

  const employeeStatusRule = employeeRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/status");
  const internalIntakeRule = internalRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/intake");

  assert.equal(resolveRouteAccess(employeeStatusRule, employeeUserContext), "allow");
  assert.equal(resolveRouteAccess(internalIntakeRule, employeeUserContext), "permission_denied");
});
