import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { resolveRouteAccess } from "../packages/frontend-platform/src/access/guards.js";
import { employerRouteAccessRules } from "../packages/frontend-platform/src/navigation/employer.js";

const executePremium = async (requestPath, options) => {
  const { executePremiumReconciliationRequest } = await import("../services/premium-reconciliation-service/src/server.ts");
  return executePremiumReconciliationRequest(requestPath, options);
};

const executeWorkflow = async (requestPath, options) => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");
  return executePortalWorkflowRequest(requestPath, options);
};

const actorHeaders = { "x-actor-id": "finance-user", "x-actor-role": "employer_finance" };

test("premium-reconciliation-service runtime supports salary mass through dashboard", { concurrency: false }, async () => {
  const period = await executePremium("/v1/premium/periods", {
    method: "POST",
    headers: actorHeaders,
    body: {
      tenantId: "tenant-premium-runtime",
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      reportingYear: 2026,
      periodType: "annual",
    },
  });
  assert.equal(period.statusCode, 200);
  const periodId = period.body.id;

  const report = await executePremium("/v1/premium/salary-mass-reports", {
    method: "POST",
    headers: actorHeaders,
    body: {
      tenantId: "tenant-premium-runtime",
      premiumReportingPeriodId: periodId,
      annualSalaryMassChf: 12000000,
      insuredSalaryMassChf: 10500000,
      employeeCount: 120,
      submissionSource: "employer_portal",
      submittedBy: "finance-user",
    },
  });
  assert.equal(report.statusCode, 200);
  const reportId = report.body.id;

  const submitted = await executePremium(`/v1/premium/salary-mass-reports/${reportId}/submit?tenantId=tenant-premium-runtime`, {
    method: "POST",
    headers: actorHeaders,
  });
  assert.equal(submitted.statusCode, 200);
  assert.equal(submitted.body.reportStatus, "submitted");

  const additionalInvoice = await executePremium("/v1/premium/adjustments/calculate", {
    method: "POST",
    headers: actorHeaders,
    body: {
      tenantId: "tenant-premium-runtime",
      premiumReportingPeriodId: periodId,
      salaryMassReportId: reportId,
      priorPremiumChf: 185000,
      premiumRate: 0.018,
      claimsPaidChf: 82000,
      claimsReservedChf: 18000,
      exposureBasis: "benefit-engine-payment-instructions",
    },
  });
  assert.equal(additionalInvoice.statusCode, 200);
  assert.equal(additionalInvoice.body.adjustmentType, "additional_invoice");
  assert.equal(additionalInvoice.body.deltaAmountChf, 4000);
  assert.equal(additionalInvoice.body.formula, "delta_amount_chf = insured_salary_mass_chf * premium_rate - prior_premium_chf");

  const recommendation = await executePremium(`/v1/premium/adjustments/${additionalInvoice.body.id}/recommendation?tenantId=tenant-premium-runtime`, {
    method: "POST",
    headers: actorHeaders,
  });
  assert.equal(recommendation.statusCode, 200);
  assert.equal(recommendation.body.recommendationType, "invoice");

  const plan = await executePremium("/v1/premium/installment-plans", {
    method: "POST",
    headers: actorHeaders,
    body: {
      tenantId: "tenant-premium-runtime",
      premiumReportingPeriodId: periodId,
      totalAmountChf: 12000,
      installmentCount: 3,
      startDate: "2026-05-01",
    },
  });
  assert.equal(plan.statusCode, 200);
  assert.equal(plan.body.items.length, 3);

  const dashboard = await executePremium(`/v1/premium/dashboard?tenantId=tenant-premium-runtime&periodId=${periodId}`);
  assert.equal(dashboard.statusCode, 200);
  assert.equal(dashboard.body.period.id, periodId);
  assert.equal(dashboard.body.snapshot.adjustmentDeltaChf, 4000);
  assert.ok(dashboard.body.snapshot.claimsRatio > 0);
});

test("premium file-backed repository persists across service instances", { concurrency: false }, async () => {
  const {
    PremiumReconciliationFileRepository,
    PremiumReconciliationService,
  } = await import("../services/premium-reconciliation-service/src/index.ts");
  const tempDir = await mkdtemp(join(tmpdir(), "premium-reconciliation-"));
  const stateFile = join(tempDir, "state.json");
  const tenantId = "tenant-premium-file-repository";
  const actor = {
    actorId: "finance-user",
    actorRole: "employer_finance",
    effectiveAt: "2026-04-19T10:00:00.000Z",
    correlationId: "phase-2f-file-repository-smoke",
  };

  try {
    const writer = new PremiumReconciliationService(new PremiumReconciliationFileRepository(stateFile));
    const period = await writer.createReportingPeriod({
      tenantId,
      periodStart: "2026-01-01",
      periodEnd: "2026-12-31",
      reportingYear: 2026,
      periodType: "annual",
    }, actor);
    await writer.createDraftSalaryMassReport({
      tenantId,
      premiumReportingPeriodId: period.id,
      annualSalaryMassChf: 7000000,
      insuredSalaryMassChf: 6500000,
      employeeCount: 70,
      submissionSource: "file_repository_smoke",
      submittedBy: "finance-user",
    }, actor);

    const reader = new PremiumReconciliationService(new PremiumReconciliationFileRepository(stateFile));
    const periods = await reader.listReportingPeriods(tenantId);
    const reports = await reader.listSalaryMassReports(tenantId, period.id);

    assert.equal(periods.length, 1);
    assert.equal(periods[0].id, period.id);
    assert.equal(reports.length, 1);
    assert.equal(reports[0].insuredSalaryMassChf, 6500000);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("premium adjustment distinguishes refund and no adjustment", { concurrency: false }, async () => {
  const period = await executePremium("/v1/premium/periods", {
    method: "POST",
    headers: actorHeaders,
    body: { tenantId: "tenant-premium-logic", periodStart: "2026-01-01", periodEnd: "2026-12-31", reportingYear: 2026, periodType: "annual" },
  });
  const periodId = period.body.id;
  const report = await executePremium("/v1/premium/salary-mass-reports", {
    method: "POST",
    headers: actorHeaders,
    body: { tenantId: "tenant-premium-logic", premiumReportingPeriodId: periodId, annualSalaryMassChf: 10000000, insuredSalaryMassChf: 9000000, employeeCount: 90, submissionSource: "test", submittedBy: "finance-user" },
  });
  const reportId = report.body.id;

  const refund = await executePremium("/v1/premium/adjustments/calculate", {
    method: "POST",
    headers: actorHeaders,
    body: { tenantId: "tenant-premium-logic", premiumReportingPeriodId: periodId, salaryMassReportId: reportId, priorPremiumChf: 170000, premiumRate: 0.018, claimsPaidChf: 1, exposureBasis: "test" },
  });
  assert.equal(refund.body.adjustmentType, "refund");
  assert.equal(refund.body.deltaAmountChf, -8000);

  const none = await executePremium("/v1/premium/adjustments/calculate", {
    method: "POST",
    headers: actorHeaders,
    body: { tenantId: "tenant-premium-logic", premiumReportingPeriodId: periodId, salaryMassReportId: reportId, priorPremiumChf: 162000, premiumRate: 0.018, claimsPaidChf: 1, exposureBasis: "test" },
  });
  assert.equal(none.body.adjustmentType, "no_adjustment");
  assert.equal(none.body.deltaAmountChf, 0);
});

test("employer workflow exposes premium dashboard and finance commands", { concurrency: false }, async () => {
  const initialDashboard = await executeWorkflow("/v1/employer/premium/dashboard?tenantId=tenant-employer-demo&locale=de-CH");
  assert.equal(initialDashboard.statusCode, 200);
  assert.equal(initialDashboard.body.meta.locale, "de-CH");
  assert.equal(initialDashboard.body.data.reportingStatus, "draft");

  const report = await executeWorkflow("/v1/employer/premium/salary-mass-report", {
    method: "POST",
    body: { tenantId: "tenant-employer-demo", locale: "en-CH", userId: "user-employer-admin", annualSalaryMassChf: 12000000, insuredSalaryMassChf: 10500000, employeeCount: 120 },
  });
  assert.equal(report.statusCode, 200);
  assert.equal(report.body.meta.locale, "en-CH");
  assert.equal(report.body.data.reportStatus, "submitted");

  const calculation = await executeWorkflow("/v1/employer/premium/adjustment", {
    method: "POST",
    body: { tenantId: "tenant-employer-demo", locale: "de-CH", userId: "user-employer-admin", reportId: report.body.data.reportId, priorPremiumChf: 185000, premiumRate: 0.018, claimsPaidChf: 82000, claimsReservedChf: 18000 },
  });
  assert.equal(calculation.statusCode, 200);
  assert.equal(calculation.body.data.adjustmentType, "additional_invoice");

  const settlement = await executeWorkflow("/v1/employer/premium/settlement", {
    method: "POST",
    body: { tenantId: "tenant-employer-demo", locale: "de-CH", userId: "user-employer-admin", calculationId: calculation.body.data.calculationId },
  });
  assert.equal(settlement.statusCode, 200);
  assert.equal(settlement.body.data.recommendationType, "invoice");

  const installment = await executeWorkflow("/v1/employer/premium/installment-plan", {
    method: "POST",
    body: { tenantId: "tenant-employer-demo", locale: "de-CH", userId: "user-employer-admin", periodId: report.body.data.periodId, totalAmountChf: 12000, installmentCount: 3, startDate: "2026-05-01" },
  });
  assert.equal(installment.statusCode, 200);
  assert.equal(installment.body.data.items.length, 3);

  const forbidden = await executeWorkflow("/v1/employer/premium/dashboard?tenantId=tenant-internal-demo&locale=de-CH");
  assert.equal(forbidden.statusCode, 403);
});

test("premium route guard allows employer finance users and blocks users without premium permission", () => {
  const rule = employerRouteAccessRules.find((item) => item.routePattern === "/[locale]/premium");
  assert.equal(resolveRouteAccess(rule, {
    userId: "finance",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["payroll_specialist"],
    effectivePermissions: [{ resourceType: "premium", action: "read", allowed: true }],
  }), "allow");
  assert.equal(resolveRouteAccess(rule, {
    userId: "employee",
    tenantId: "tenant-employer-demo",
    locale: "de-CH",
    roleCodes: ["employee_self_service"],
    effectivePermissions: [],
  }), "permission_denied");
});
