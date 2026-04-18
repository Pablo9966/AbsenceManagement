export type RunStatus = "draft" | "ready_for_export" | "exported" | "awaiting_reconciliation" | "reconciled" | "completed" | "cancelled";
export type RunType = "scheduled" | "manual" | "correction";
export type ItemStatus = "included" | "excluded" | "exported" | "reconciled";
export type ExportFormat = "pain_001" | "csv" | "json";
export type ExportStatus = "pending" | "generated" | "failed";
export type ReconciliationStatus = "not_started" | "in_progress" | "matched" | "mismatch" | "confirmed";
export type StatementType = "payment_statement" | "taggelddispositiv" | "settlement_summary";
export type SettlementStatus = "open" | "partially_paid" | "fully_paid" | "overpaid";
export type PaymentActorRole = "finance_operator" | "team_lead" | "system" | "api";
export interface PaymentRun {
    id: string;
    tenantId: string;
    runNumber: string;
    runType: RunType;
    runStatus: RunStatus;
    createdAt: string;
    createdBy: string;
    scheduledExecutionAt?: string;
    exportedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    currency: "CHF";
    totalGrossAmountChf: number;
    totalNetAmountChf: number;
    instructionCount: number;
    reconciliationStatus: ReconciliationStatus;
    notes?: string;
}
export interface PaymentRunItem {
    id: string;
    tenantId: string;
    paymentRunId: string;
    paymentInstructionId: string;
    ktgCaseId: string;
    payeeType: "employer" | "employee";
    payeeReference: string;
    paymentPeriodStart: string;
    paymentPeriodEnd: string;
    grossAmountChf: number;
    netAmountChf: number;
    itemStatus: ItemStatus;
    includedAt: string;
    excludedReason?: string;
}
export interface PaymentExportPackage {
    id: string;
    tenantId: string;
    paymentRunId: string;
    exportFormat: ExportFormat;
    fileName: string;
    storageReference: string;
    checksum: string;
    generatedAt: string;
    generatedBy: string;
    exportStatus: ExportStatus;
}
export interface PaymentStatement {
    id: string;
    tenantId: string;
    paymentRunId: string;
    paymentInstructionId?: string;
    ktgCaseId: string;
    statementType: StatementType;
    statementPeriodStart: string;
    statementPeriodEnd: string;
    fileName: string;
    storageReference: string;
    pdfSizeBytes: number;
    generatedAt: string;
}
export interface CaseSettlementSummary {
    id: string;
    tenantId: string;
    ktgCaseId: string;
    latestPaymentRunId?: string;
    totalGrossPaidChf: number;
    totalNetPaidChf: number;
    totalPayableDays: number;
    lastStatementAt?: string;
    settlementStatus: SettlementStatus;
    updatedAt: string;
}
export interface PaymentReconciliationRecord {
    id: string;
    tenantId: string;
    paymentRunId: string;
    reconciliationStatus: ReconciliationStatus;
    reconciledAt?: string;
    reconciledBy?: string;
    mismatchReason?: string;
    payrollBookingReference?: string;
    confirmationReceivedAt?: string;
}
export interface PayrollBookingConfirmation {
    id: string;
    tenantId: string;
    paymentRunId: string;
    confirmationReference: string;
    confirmedAt: string;
    confirmedBy: string;
    bookingPayloadJson: Record<string, unknown>;
}
export interface PaymentOperationsAuditEvent {
    id: string;
    tenantId: string;
    paymentRunId?: string;
    paymentInstructionId?: string;
    eventType: string;
    occurredAt: string;
    actorId: string;
    actorRole: PaymentActorRole;
    correlationId?: string;
    payload?: Record<string, unknown>;
}
export interface PaymentRunDetail extends PaymentRun {
    items: PaymentRunItem[];
    exportPackages: PaymentExportPackage[];
    statements: PaymentStatement[];
    reconciliationRecord?: PaymentReconciliationRecord;
    bookingConfirmation?: PayrollBookingConfirmation;
    auditEvents: PaymentOperationsAuditEvent[];
}
export interface PaymentInstructionRef {
    id: string;
    ktgCaseId: string;
    payeeType: "employer" | "employee";
    payeeReference: string;
    paymentPeriodStart: string;
    paymentPeriodEnd: string;
    grossAmountChf: number;
    netAmountChf: number;
}
export interface TaggelddispositivData {
    ktgCaseId: string;
    paymentInstructionId: string;
    statementPeriodStart: string;
    statementPeriodEnd: string;
    totalClaimedDays: number;
    totalPayableDays: number;
    totalAmountChf: number;
    grossAmountChf: number;
    netAmountChf: number;
    payeeReference: string;
    runNumber: string;
}
