import test from "node:test";
import assert from "node:assert/strict";

const executeIdentity = async (requestPath, options) => {
  const { executeIdentityAccessRequest } = await import("../services/identity-access-service/src/server.ts");
  return executeIdentityAccessRequest(requestPath, options);
};

const executeWorkflow = async (requestPath, options) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath, options);
};

const executePayment = async (requestPath, options) => {
  const { executePaymentOperationsRequest } = await import("../services/payment-operations-service/src/server.ts");
  return executePaymentOperationsRequest(requestPath, options);
};

const executePremium = async (requestPath, options) => {
  const { executePremiumReconciliationRequest } = await import("../services/premium-reconciliation-service/src/server.ts");
  return executePremiumReconciliationRequest(requestPath, options);
};

const executeUvg = async (requestPath, options) => {
  const { executeUvgCaseRequest } = await import("../services/uvg-case-service/src/server.ts");
  return executeUvgCaseRequest(requestPath, options);
};

const executeDashboardProjection = async (requestPath, options) => {
  const { executeDashboardProjectionRequest } = await import("../services/dashboard-projection-service/src/server.ts");
  return executeDashboardProjectionRequest(requestPath, options);
};

test("service health endpoints expose release-readiness posture", async () => {
  const checks = await Promise.all([
    executeIdentity("/health"),
    executeWorkflow("/health"),
    executePayment("/health"),
    executePremium("/health"),
    executeUvg("/health"),
    executeDashboardProjection("/health"),
  ]);

  for (const response of checks) {
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, "ok");
    assert.ok(response.body.service);
    assert.ok(response.body.timestamp);
  }
});

test("identity session bootstrap works with a real session token", async () => {
  const signIn = await executeIdentity("/v1/session/sign-in", {
    method: "POST",
    body: {
      email: "hr.admin@demo.elipslife.ch",
      tenantId: "tenant-employer-demo",
    },
  });
  assert.equal(signIn.statusCode, 200);
  assert.ok(signIn.body.sessionToken);

  const bootstrap = await executeIdentity("/v1/session/bootstrap", {
    method: "POST",
    headers: {
      authorization: `Bearer ${signIn.body.sessionToken}`,
    },
    body: {
      routeLocale: "de-CH",
      permissions: [{ resourceType: "dashboard", action: "read" }],
    },
  });
  assert.equal(bootstrap.statusCode, 200);
  assert.equal(bootstrap.body.membership.tenantId, "tenant-employer-demo");
  assert.equal(bootstrap.body.locale.value, "de-CH");
});

test("employee self-service updates are visible through employee and employer workflow reads", { concurrency: false }, async () => {
  const absence = await executeWorkflow("/v1/employee/report-absence", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      userId: "user-employee-self",
      absenceType: "ktg_sickness",
      startDate: "2026-04-19",
      expectedEndDate: "2026-04-24",
      comment: "Release readiness integration test.",
    },
  });
  assert.equal(absence.statusCode, 200);
  const episodeId = absence.body.data.episodeId;

  const certificate = await executeWorkflow("/v1/employee/documents/upload", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      employeeId: "employee-0001",
      userId: "user-employee-self",
      documentType: "medical_certificate",
      fileName: "arztzeugnis-release-test.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 2048,
      absenceEpisodeId: episodeId,
      certificateStartDate: "2026-04-19",
      certificateEndDate: "2026-04-24",
      incapacityPercentage: 100,
      issuingProviderName: "Praxis Release",
    },
  });
  assert.equal(certificate.statusCode, 200);

  const employeeStatus = await executeWorkflow("/v1/employee/status?tenantId=tenant-employer-demo&locale=de-CH&employeeId=employee-0001");
  assert.equal(employeeStatus.statusCode, 200);
  assert.ok(employeeStatus.body.data.activeAbsences.some((item) => item.episodeId === episodeId));
  assert.ok(employeeStatus.body.data.documents.some((item) => item.documentId === certificate.body.data.documentId));

  const employerAbsences = await executeWorkflow("/v1/employer/absences?tenantId=tenant-employer-demo&locale=de-CH&page=1&pageSize=50");
  assert.equal(employerAbsences.statusCode, 200);
  assert.ok(employerAbsences.body.data.some((item) => item.episodeId === episodeId));
});

test("payment operations runtime supports create-ready-statement detail flow", { concurrency: false }, async () => {
  const run = await executePayment("/v1/internal/payment-runs/create", {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      runType: "manual",
      notes: "2H integration run",
    },
  });
  assert.equal(run.statusCode, 200);
  const runId = run.body.data.id;

  const addItem = await executePayment(`/v1/internal/payment-runs/${runId}/items`, {
    method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        paymentInstruction: {
          id: "payment-9001",
          ktgCaseId: "case-2001",
          payeeType: "employer",
          payeeReference: "employer-demo",
          paymentPeriodStart: "2026-04-19",
          paymentPeriodEnd: "2026-04-30",
          grossAmountChf: 1400,
          netAmountChf: 1400,
        },
      },
  });
  assert.equal(addItem.statusCode, 200);

  const ready = await executePayment(`/v1/internal/payment-runs/${runId}/ready`, {
    method: "POST",
    body: { tenantId: "tenant-internal-demo" },
  });
  assert.equal(ready.statusCode, 200);

  const exported = await executePayment(`/v1/internal/payment-runs/${runId}/export`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      format: "pain_001",
      generatedBy: "integration-test",
    },
  });
  assert.equal(exported.statusCode, 200);

  const statement = await executePayment(`/v1/internal/payment-runs/${runId}/statement`, {
    method: "POST",
    body: {
      tenantId: "tenant-internal-demo",
      paymentInstructionId: "payment-9001",
      ktgCaseId: "case-2001",
      statementType: "payment_statement",
    },
  });
  assert.equal(statement.statusCode, 200);
  assert.ok(statement.body.data.fileName.includes("RUN-"));
  assert.ok(statement.body.data.storageReference.includes("memory://statements/tenant-internal-demo/"));

  const detail = await executePayment(`/v1/internal/payment-runs/${runId}?tenantId=tenant-internal-demo`);
  assert.equal(detail.statusCode, 200);
  assert.ok(detail.body.statements.some((item) => item.id === statement.body.data.id));
});

test("UVG, premium, and analytics flows remain integration-usable", { concurrency: false }, async () => {
  const uvg = await executeUvg("/v1/uvg-cases", {
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
      accidentDate: "2026-04-22",
      accidentPlace: "Warehouse",
      occupationalContext: "occupational",
      accidentDescription: "Forklift collision avoided but hand injured.",
      policeInvolvedFlag: false,
    },
  });
  assert.equal(uvg.statusCode, 200);

  const period = await executePremium("/v1/premium/periods", {
    method: "POST",
    headers: { "x-actor-id": "finance-user", "x-actor-role": "employer_finance" },
    body: {
      tenantId: "tenant-release-integration",
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      reportingYear: 2026,
      periodType: "annual",
    },
  });
  assert.equal(period.statusCode, 200);

  const report = await executePremium("/v1/premium/salary-mass-reports", {
    method: "POST",
    headers: { "x-actor-id": "finance-user", "x-actor-role": "employer_finance" },
    body: {
      tenantId: "tenant-release-integration",
      premiumReportingPeriodId: period.body.id,
      annualSalaryMassChf: 12000000,
      insuredSalaryMassChf: 10500000,
      employeeCount: 120,
      submissionSource: "integration_test",
      submittedBy: "finance-user",
    },
  });
  assert.equal(report.statusCode, 200);

  const submitted = await executePremium(`/v1/premium/salary-mass-reports/${report.body.id}/submit?tenantId=tenant-release-integration`, {
    method: "POST",
    headers: { "x-actor-id": "finance-user", "x-actor-role": "employer_finance" },
  });
  assert.equal(submitted.statusCode, 200);

  const adjustment = await executePremium("/v1/premium/adjustments/calculate", {
    method: "POST",
    headers: { "x-actor-id": "finance-user", "x-actor-role": "employer_finance" },
    body: {
      tenantId: "tenant-release-integration",
      premiumReportingPeriodId: period.body.id,
      salaryMassReportId: report.body.id,
      priorPremiumChf: 180000,
      premiumRate: 0.018,
      claimsPaidChf: 82000,
      claimsReservedChf: 18000,
      exposureBasis: "integration_test",
    },
  });
  assert.equal(adjustment.statusCode, 200);

  const analyticsRefresh = await executeWorkflow("/v1/employer/analytics/refresh", {
    method: "POST",
    body: {
      tenantId: "tenant-employer-demo",
      locale: "de-CH",
      userId: "user-employer-admin",
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      granularity: "monthly",
    },
  });
  assert.equal(analyticsRefresh.statusCode, 200);

  const analyticsRead = await executeWorkflow("/v1/employer/analytics?tenantId=tenant-employer-demo&locale=de-CH&periodStart=2026-01-01&periodEnd=2026-12-31&granularity=monthly");
  assert.equal(analyticsRead.statusCode, 200);
  assert.equal(analyticsRead.body.data.latestRefresh.jobId, analyticsRefresh.body.data.refreshJobId);
  assert.ok(analyticsRead.body.data.summary.totalCostChf > 0);
});
