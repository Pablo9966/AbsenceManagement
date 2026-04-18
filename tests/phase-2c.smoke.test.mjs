import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const withPaymentStateFile = async (fn) => {
  const tempDir = await mkdtemp(path.join(tmpdir(), "payment-ops-smoke-"));
  const previous = process.env.PAYMENT_OPERATIONS_STATE_FILE;
  process.env.PAYMENT_OPERATIONS_STATE_FILE = path.join(tempDir, "payment-operations-state.json");
  try {
    return await fn();
  } finally {
    if (previous === undefined) {
      delete process.env.PAYMENT_OPERATIONS_STATE_FILE;
    } else {
      process.env.PAYMENT_OPERATIONS_STATE_FILE = previous;
    }
    await rm(tempDir, { recursive: true, force: true });
  }
};

test("payment operations runtime supports run creation through reconciliation", { concurrency: false }, async () => {
  const { executePaymentOperationsRequest } = await import("../services/payment-operations-service/src/server.ts");

  await withPaymentStateFile(async () => {
    const createResponse = await executePaymentOperationsRequest("/v1/internal/payment-runs/create", {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        runType: "manual",
        scheduledExecutionAt: "2026-04-19T09:00:00.000Z",
        notes: "Manual April catch-up run",
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(createResponse.statusCode, 200);
    const runId = createResponse.body.data.id;

    const addItemResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/items`, {
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
          grossAmountChf: 820.5,
          netAmountChf: 820.5,
        },
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(addItemResponse.statusCode, 200);
    assert.equal(addItemResponse.body.data.paymentInstructionId, "payment-9001");

    const readyResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/ready`, {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(readyResponse.statusCode, 200);
    assert.equal(readyResponse.body.data.runStatus, "ready_for_export");

    const exportResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/export`, {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        format: "pain_001",
        generatedBy: "finance-operator-1",
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(exportResponse.statusCode, 200);
    assert.equal(exportResponse.body.data.exportFormat, "pain_001");

    const statementResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/statement`, {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        paymentInstructionId: "payment-9001",
        ktgCaseId: "case-2001",
        statementType: "payment_statement",
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(statementResponse.statusCode, 200);
    assert.equal(statementResponse.body.data.ktgCaseId, "case-2001");
    assert.ok(statementResponse.body.data.pdfSizeBytes > 0);

    const reconcileResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/reconcile`, {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        status: "confirmed",
        reconciledBy: "finance-operator-1",
        payrollBookingReference: "BOOK-2026-999",
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(reconcileResponse.statusCode, 200);
    assert.equal(reconcileResponse.body.data.reconciliationStatus, "confirmed");

    const bookingResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}/booking-confirmation`, {
      method: "POST",
      body: {
        tenantId: "tenant-internal-demo",
        confirmationReference: "BOOK-2026-999",
        confirmedBy: "finance-operator-1",
        bookingPayload: { system: "SAP", journalEntry: "JE-20260419-001" },
        actorId: "finance-operator-1",
        actorRole: "finance_operator",
      },
    });
    assert.equal(bookingResponse.statusCode, 200);
    assert.equal(bookingResponse.body.data.confirmationReference, "BOOK-2026-999");

    const detailResponse = await executePaymentOperationsRequest(`/v1/internal/payment-runs/${runId}?tenantId=tenant-internal-demo`);
    assert.equal(detailResponse.statusCode, 200);
    assert.equal(detailResponse.body.id, runId);
    assert.equal(detailResponse.body.runStatus, "reconciled");
    assert.equal(detailResponse.body.items.length, 1);
    assert.equal(detailResponse.body.exportPackages.length, 1);
    assert.equal(detailResponse.body.statements.length, 1);
    assert.equal(detailResponse.body.reconciliationRecord.reconciliationStatus, "confirmed");

    const monthEndResponse = await executePaymentOperationsRequest("/v1/internal/month-end?tenantId=tenant-internal-demo");
    assert.equal(monthEndResponse.statusCode, 200);
    assert.ok(monthEndResponse.body.totalRuns >= 2);

    const settlementResponse = await executePaymentOperationsRequest("/v1/internal/settlement/case-2001?tenantId=tenant-internal-demo");
    assert.equal(settlementResponse.statusCode, 200);
    assert.equal(settlementResponse.body.ktgCaseId, "case-2001");

    const auditResponse = await executePaymentOperationsRequest(`/v1/internal/payment-audit-events?tenantId=tenant-internal-demo&runId=${runId}`);
    assert.equal(auditResponse.statusCode, 200);
    assert.ok(auditResponse.body.length >= 5);
  });
});

test("payment workflow routes expose internal and employer payment views", async () => {
  const { executePortalWorkflowRequest } = await import("../services/portal-workflow-service/src/server.ts");

  const internalRuns = await executePortalWorkflowRequest(
    "/v1/internal/payment-runs?tenantId=tenant-internal-demo&locale=de-CH&runStatus=reconciled&page=1&pageSize=10",
  );
  assert.equal(internalRuns.statusCode, 200);
  assert.equal(internalRuns.body.meta.appliedFilters.runStatus, "reconciled");
  assert.ok(internalRuns.body.data.length >= 1);

  const internalRunDetail = await executePortalWorkflowRequest(
    "/v1/internal/payment-runs/run-001?tenantId=tenant-internal-demo&locale=de-CH",
  );
  assert.equal(internalRunDetail.statusCode, 200);
  assert.equal(internalRunDetail.body.data.runId, "run-001");
  assert.ok(Array.isArray(internalRunDetail.body.data.exportPackages));

  const monthEnd = await executePortalWorkflowRequest(
    "/v1/internal/month-end?tenantId=tenant-internal-demo&locale=de-CH",
  );
  assert.equal(monthEnd.statusCode, 200);
  assert.ok(monthEnd.body.data.totalRuns >= 1);

  const employerPaymentRuns = await executePortalWorkflowRequest(
    "/v1/employer/payment-runs?tenantId=tenant-employer-demo&locale=de-CH&page=1&pageSize=10",
  );
  assert.equal(employerPaymentRuns.statusCode, 200);
  assert.ok(employerPaymentRuns.body.data.length >= 1);
});
