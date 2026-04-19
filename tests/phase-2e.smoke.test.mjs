import test from "node:test";
import assert from "node:assert/strict";

import { resolveRouteAccess } from "../packages/frontend-platform/src/access/guards.js";
import { employerRouteAccessRules } from "../packages/frontend-platform/src/navigation/employer.js";
import { internalRouteAccessRules } from "../packages/frontend-platform/src/navigation/internal.js";

const executeRequest = async (requestPath, options) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath, options);
};

const executeUvgRuntimeRequest = async (requestPath, options) => {
  const { executeUvgCaseRequest } = await import("../services/uvg-case-service/src/server.ts");
  return executeUvgCaseRequest(requestPath, options);
};

test("uvg-case-service runtime exposes direct case commands through artifact generation", { concurrency: false }, async () => {
  const createResponse = await executeUvgRuntimeRequest("/v1/uvg-cases", {
    method: "POST",
    headers: {
      "x-actor-id": "user-employer-admin",
      "x-actor-role": "employer_user",
    },
    body: {
      tenantId: "tenant-employer-demo",
      employeeId: "employee-0001",
      policyId: "policy-uvg-001",
      uvgCaseType: "bu",
      reporterRole: "employer",
      reporterUserId: "user-employer-admin",
      accidentDate: "2026-04-21",
      accidentTime: "10:30",
      accidentPlace: "Zurich office stairs",
      occupationalContext: "occupational",
      accidentDescription: "Employee slipped on office stairs during work.",
      policeInvolvedFlag: false,
      ktgCaseId: "case-2001",
    },
  });
  assert.equal(createResponse.statusCode, 200);
  assert.equal(createResponse.body.data.uvgCaseType, "bu");
  const caseId = createResponse.body.data.id;

  const statusResponse = await executeUvgRuntimeRequest(`/v1/uvg-cases/${caseId}/status?tenantId=tenant-employer-demo`, {
    method: "POST",
    headers: {
      "x-actor-id": "user-internal-claims",
      "x-actor-role": "claims_handler",
    },
    body: { caseStatus: "under_review" },
  });
  assert.equal(statusResponse.statusCode, 200);
  assert.equal(statusResponse.body.data.caseStatus, "under_review");

  const injuryResponse = await executeUvgRuntimeRequest(`/v1/uvg-cases/${caseId}/injuries`, {
    method: "POST",
    headers: {
      "x-actor-id": "user-internal-claims",
      "x-actor-role": "claims_handler",
    },
    body: {
      tenantId: "tenant-employer-demo",
      injuryType: "sprain",
      bodyPart: "ankle",
      severity: "moderate",
      medicalTreatmentFlag: true,
      hospitalizedFlag: false,
    },
  });
  assert.equal(injuryResponse.statusCode, 200);
  assert.equal(injuryResponse.body.data.bodyPart, "ankle");

  const coordinationResponse = await executeUvgRuntimeRequest(`/v1/uvg-cases/${caseId}/coordination`, {
    method: "POST",
    headers: {
      "x-actor-id": "user-internal-claims",
      "x-actor-role": "claims_handler",
    },
    body: {
      tenantId: "tenant-employer-demo",
      coordinationType: "ktg_overlap",
      relatedKtgCaseId: "case-2001",
      overlapStart: "2026-04-21",
      overlapEnd: "2026-04-30",
      coordinationStatus: "in_review",
      benefitOverlapFlag: true,
      notes: "Direct runtime overlap review.",
    },
  });
  assert.equal(coordinationResponse.statusCode, 200);
  assert.equal(coordinationResponse.body.data.coordinationStatus, "in_review");

  const artifactResponse = await executeUvgRuntimeRequest(`/v1/uvg-cases/${caseId}/report-artifact?tenantId=tenant-employer-demo`, {
    method: "POST",
    headers: {
      "x-actor-id": "user-internal-claims",
      "x-actor-role": "claims_handler",
    },
  });
  assert.equal(artifactResponse.statusCode, 200);
  assert.equal(artifactResponse.body.data.reportType, "accident_report_pdf");
  assert.ok(artifactResponse.body.data.pdfBase64.length > 0);
  assert.ok(artifactResponse.body.data.pdfSizeBytes > 0);

  const auditResponse = await executeUvgRuntimeRequest(`/v1/uvg-cases/${caseId}/audit-events?tenantId=tenant-employer-demo`);
  assert.equal(auditResponse.statusCode, 200);
  assert.ok(auditResponse.body.some((event) => event.eventType === "uvg_accident_report_generated"));
});

test("employer can submit BU and NBU UVG accident reports and view own UVG cases", { concurrency: false }, async () => {
  const buResponse = await executeRequest("/v1/employer/uvg-cases/report", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      policyId: "policy-uvg-001",
      userId: "user-employer-admin",
      uvgCaseType: "bu",
      accidentDate: "2026-04-19",
      accidentTime: "08:45",
      accidentPlace: "Zurich office",
      occupationalContext: "occupational",
      accidentDescription: "Employee fell on stairs during work.",
      witnessDetails: "Team lead witnessed the incident.",
      policeInvolvedFlag: false,
      ktgCaseId: "case-2001",
    },
  });
  assert.equal(buResponse.statusCode, 200);
  assert.equal(buResponse.body.data.uvgCaseType, "bu");

  const nbuResponse = await executeRequest("/v1/employer/uvg-cases/report", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "en-CH",
      employeeId: "employee-0002",
      policyId: "policy-uvg-001",
      userId: "user-employer-admin",
      uvgCaseType: "nbu",
      accidentDate: "2026-04-20",
      accidentPlace: "Private sports club",
      occupationalContext: "non_occupational",
      accidentDescription: "Employee injured ankle during private sports activity.",
      policeInvolvedFlag: false,
    },
  });
  assert.equal(nbuResponse.statusCode, 200);
  assert.equal(nbuResponse.body.meta.locale, "en-CH");
  assert.equal(nbuResponse.body.data.uvgCaseType, "nbu");

  const listResponse = await executeRequest(
    "/v1/employer/uvg-cases?tenantId=tenant-employer-demo&locale=de-CH&page=1&pageSize=20",
  );
  assert.equal(listResponse.statusCode, 200);
  assert.ok(listResponse.body.data.some((item) => item.caseId === buResponse.body.data.caseId));
  assert.ok(listResponse.body.data.some((item) => item.caseId === nbuResponse.body.data.caseId));

  const detailResponse = await executeRequest(
    `/v1/employer/uvg-cases/${buResponse.body.data.caseId}?tenantId=tenant-employer-demo&locale=de-CH`,
  );
  assert.equal(detailResponse.statusCode, 200);
  assert.equal(detailResponse.body.data.caseId, buResponse.body.data.caseId);
  assert.equal(detailResponse.body.data.linkedKtgCaseId, "case-2001");
  assert.equal(detailResponse.body.data.injuries, undefined);

  const artifactResponse = await executeRequest(`/v1/employer/uvg-cases/${buResponse.body.data.caseId}/report-artifact`, {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      userId: "user-employer-admin",
    },
  });
  assert.equal(artifactResponse.statusCode, 200);
  assert.ok(artifactResponse.body.data.pdfSizeBytes > 0);
});

test("internal teams can process UVG cases, record injury, circumstance, document linkage, coordination, and decision", { concurrency: false }, async () => {
  const listResponse = await executeRequest(
    "/v1/internal/uvg-cases?tenantId=tenant-internal-demo&locale=de-CH&page=1&pageSize=20",
  );
  assert.equal(listResponse.statusCode, 200);
  assert.ok(listResponse.body.data.length >= 1);
  const caseId = listResponse.body.data[0].caseId;

  const statusResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/status`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      caseStatus: "coordinating",
    },
  });
  assert.equal(statusResponse.statusCode, 200);
  assert.equal(statusResponse.body.data.caseStatus, "coordinating");

  const injuryResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/injuries`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      injuryType: "fracture",
      bodyPart: "wrist",
      severity: "moderate",
      medicalTreatmentFlag: true,
      hospitalizedFlag: false,
      notes: "X-ray pending.",
    },
  });
  assert.equal(injuryResponse.statusCode, 200);
  assert.ok(injuryResponse.body.data.injuries.some((injury) => injury.bodyPart === "wrist"));

  const circumstanceResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/circumstances`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      causeCategory: "fall",
      activityContext: "workplace_stairs",
      thirdPartyInvolvedFlag: false,
      vehicleInvolvedFlag: false,
      narrative: "Employee fell while using internal stairs.",
    },
  });
  assert.equal(circumstanceResponse.statusCode, 200);
  assert.ok(circumstanceResponse.body.data.circumstances.some((circumstance) => circumstance.causeCategory === "fall"));

  const documentResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/documents`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      documentId: "document-3001",
      documentRole: "medical_certificate",
    },
  });
  assert.equal(documentResponse.statusCode, 200);
  assert.ok(documentResponse.body.data.documentReferences.some((reference) => reference.documentId === "document-3001"));

  const coordinationResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/coordination`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      coordinationType: "ktg_overlap",
      relatedKtgCaseId: "case-2001",
      overlapStart: "2026-04-19",
      overlapEnd: "2026-04-30",
      coordinationStatus: "in_review",
      benefitOverlapFlag: true,
      notes: "Review KTG replacement period.",
    },
  });
  assert.equal(coordinationResponse.statusCode, 200);
  assert.ok(coordinationResponse.body.data.coordinationRecords.some((record) => record.coordinationStatus === "in_review"));

  const decisionResponse = await executeRequest(`/v1/internal/uvg-cases/${caseId}/decisions`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      locale: "de-CH",
      userId: "user-internal-claims",
      decisionStatus: "approved",
      decisionReason: "Accident coverage accepted.",
      effectiveFrom: "2026-04-19",
    },
  });
  assert.equal(decisionResponse.statusCode, 200);
  assert.ok(decisionResponse.body.data.decisions.some((decision) => decision.decisionStatus === "approved"));

  const forbiddenInternal = await executeRequest(
    `/v1/internal/uvg-cases/${caseId}?tenantId=tenant-employer-demo&locale=de-CH`,
  );
  assert.equal(forbiddenInternal.statusCode, 403);
});

test("UVG route guards expose employer and internal access separately", () => {
  const employerUserContext = {
    userId: "user-employer-admin",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["hr_manager"],
    effectivePermissions: [
      { resourceType: "uvg_case", action: "read", allowed: true },
      { resourceType: "uvg_case", action: "write", allowed: true },
    ],
  };
  const internalUserContext = {
    userId: "user-internal-claims",
    tenantId: "tenant-internal-demo",
    locale: "de-CH",
    roleCodes: ["claims_handler"],
    effectivePermissions: [
      { resourceType: "uvg_case", action: "read_internal", allowed: true },
      { resourceType: "uvg_case", action: "write_internal", allowed: true },
    ],
  };

  assert.equal(
    resolveRouteAccess(employerRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/uvg-cases"), employerUserContext),
    "allow",
  );
  assert.equal(
    resolveRouteAccess(internalRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/uvg-cases"), employerUserContext),
    "permission_denied",
  );
  assert.equal(
    resolveRouteAccess(internalRouteAccessRules.find((rule) => rule.routePattern === "/[locale]/uvg-cases"), internalUserContext),
    "allow",
  );
});
