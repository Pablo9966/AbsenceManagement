import type {
  CaseSettlementSummary,
  PaymentExportPackage,
  PaymentOperationsAuditEvent,
  PaymentReconciliationRecord,
  PaymentRun,
  PaymentRunItem,
  PaymentStatement,
  PayrollBookingConfirmation,
} from "../domain/types.js";
import type { PaymentOperationsRepositorySnapshot } from "../testing/in-memory-repository.js";

export const INTERNAL_TENANT_ID = "tenant-internal-demo";
export const REFERENCE_EFFECTIVE_AT = "2026-04-18T14:30:00.000Z";

export interface Phase2CReferenceData extends PaymentOperationsRepositorySnapshot {}

export const createPhase2CReferenceData = (): Phase2CReferenceData => {
  const runs: PaymentRun[] = [
    {
      id: "run-001",
      tenantId: INTERNAL_TENANT_ID,
      runNumber: "RUN-2026-001",
      runType: "scheduled",
      runStatus: "reconciled",
      createdAt: "2026-04-18T08:15:00.000Z",
      createdBy: "claims-handler-1",
      scheduledExecutionAt: "2026-04-18T10:00:00.000Z",
      exportedAt: "2026-04-18T10:05:00.000Z",
      completedAt: "2026-04-18T14:00:00.000Z",
      currency: "CHF",
      totalGrossAmountChf: 1480.25,
      totalNetAmountChf: 1480.25,
      instructionCount: 1,
      reconciliationStatus: "confirmed",
      notes: "April 2026 scheduled payment run",
    },
  ];

  const runItems: PaymentRunItem[] = [
    {
      id: "run-item-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      paymentInstructionId: "payment-5001",
      ktgCaseId: "case-2001",
      payeeType: "employer",
      payeeReference: "employer-demo",
      paymentPeriodStart: "2026-04-05",
      paymentPeriodEnd: "2026-04-18",
      grossAmountChf: 1480.25,
      netAmountChf: 1480.25,
      itemStatus: "reconciled",
      includedAt: "2026-04-18T08:16:00.000Z",
    },
  ];

  const exportPackages: PaymentExportPackage[] = [
    {
      id: "export-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      exportFormat: "pain_001",
      fileName: "RUN-2026-001.xml",
      storageReference: "memory://exports/run-001.xml",
      checksum: "a3f8b2c1",
      generatedAt: "2026-04-18T10:05:00.000Z",
      generatedBy: "claims-handler-1",
      exportStatus: "generated",
    },
  ];

  const statements: PaymentStatement[] = [
    {
      id: "stmt-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      paymentInstructionId: "payment-5001",
      ktgCaseId: "case-2001",
      statementType: "taggelddispositiv",
      statementPeriodStart: "2026-04-05",
      statementPeriodEnd: "2026-04-18",
      fileName: "taggelddispositiv-stmt-001.pdf",
      storageReference: "memory://statements/stmt-001.pdf",
      pdfSizeBytes: 1152,
      generatedAt: "2026-04-18T10:07:00.000Z",
    },
  ];

  const settlementSummaries: CaseSettlementSummary[] = [
    {
      id: "settlement-001",
      tenantId: INTERNAL_TENANT_ID,
      ktgCaseId: "case-2001",
      latestPaymentRunId: "run-001",
      totalGrossPaidChf: 1480.25,
      totalNetPaidChf: 1480.25,
      totalPayableDays: 14,
      lastStatementAt: "2026-04-18T10:07:00.000Z",
      settlementStatus: "fully_paid",
      updatedAt: "2026-04-18T14:00:00.000Z",
    },
  ];

  const reconciliationRecords: PaymentReconciliationRecord[] = [
    {
      id: "recon-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      reconciliationStatus: "confirmed",
      reconciledAt: "2026-04-18T13:30:00.000Z",
      reconciledBy: "finance-operator-1",
      payrollBookingReference: "BOOK-2026-001",
      confirmationReceivedAt: "2026-04-18T13:30:00.000Z",
    },
  ];

  const bookingConfirmations: PayrollBookingConfirmation[] = [
    {
      id: "booking-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      confirmationReference: "BOOK-2026-001",
      confirmedAt: "2026-04-18T13:30:00.000Z",
      confirmedBy: "finance-operator-1",
      bookingPayloadJson: { system: "SAP", journalEntry: "JE-20260418-001", amount: 1480.25 },
    },
  ];

  const auditEvents: PaymentOperationsAuditEvent[] = [
    {
      id: "pay-audit-001",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      eventType: "run_created",
      occurredAt: "2026-04-18T08:15:00.000Z",
      actorId: "claims-handler-1",
      actorRole: "finance_operator",
      payload: { runNumber: "RUN-2026-001", runType: "scheduled" },
    },
    {
      id: "pay-audit-002",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      paymentInstructionId: "payment-5001",
      eventType: "instruction_added_to_run",
      occurredAt: "2026-04-18T08:16:00.000Z",
      actorId: "claims-handler-1",
      actorRole: "finance_operator",
      payload: { paymentInstructionId: "payment-5001", netAmountChf: 1480.25 },
    },
    {
      id: "pay-audit-003",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      eventType: "export_package_generated",
      occurredAt: "2026-04-18T10:05:00.000Z",
      actorId: "claims-handler-1",
      actorRole: "finance_operator",
      payload: { exportFormat: "pain_001", fileName: "RUN-2026-001.xml" },
    },
    {
      id: "pay-audit-004",
      tenantId: INTERNAL_TENANT_ID,
      paymentRunId: "run-001",
      eventType: "reconciliation_status_updated",
      occurredAt: "2026-04-18T13:30:00.000Z",
      actorId: "finance-operator-1",
      actorRole: "finance_operator",
      payload: { status: "confirmed", payrollBookingReference: "BOOK-2026-001" },
    },
  ];

  return {
    runs,
    runItems,
    exportPackages,
    statements,
    settlementSummaries,
    reconciliationRecords,
    bookingConfirmations,
    auditEvents,
  };
};
