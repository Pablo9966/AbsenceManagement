import type { CaseSettlementSummary, ExportFormat, PaymentExportPackage, PaymentInstructionRef, PaymentOperationsAuditEvent, PaymentReconciliationRecord, PaymentRun, PaymentRunDetail, PaymentRunItem, PaymentStatement, PaymentActorRole, PayrollBookingConfirmation, ReconciliationStatus, StatementType, TaggelddispositivData } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
export interface CommandResult<T> {
    data?: T;
    issues: ValidationIssue[];
}
export interface ActorContext {
    actorId: string;
    actorRole: PaymentActorRole;
    correlationId?: string;
    effectiveAt: string;
}
export interface PaymentOperationsRepositoryContext {
    createPaymentRun(run: PaymentRun): Promise<PaymentRun>;
    getPaymentRunById(tenantId: string, runId: string): Promise<PaymentRun | null>;
    updatePaymentRun(run: PaymentRun): Promise<PaymentRun>;
    listPaymentRuns(tenantId: string, filters?: {
        runStatus?: string;
        runType?: string;
    }): Promise<PaymentRun[]>;
    createPaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem>;
    listPaymentRunItemsByRun(tenantId: string, runId: string): Promise<PaymentRunItem[]>;
    updatePaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem>;
    findActiveRunItemByInstruction(tenantId: string, paymentInstructionId: string): Promise<PaymentRunItem | null>;
    createExportPackage(pkg: PaymentExportPackage): Promise<PaymentExportPackage>;
    listExportPackagesByRun(tenantId: string, runId: string): Promise<PaymentExportPackage[]>;
    createPaymentStatement(stmt: PaymentStatement): Promise<PaymentStatement>;
    listStatementsByRun(tenantId: string, runId: string): Promise<PaymentStatement[]>;
    listStatementsByCase(tenantId: string, ktgCaseId: string): Promise<PaymentStatement[]>;
    upsertSettlementSummary(summary: CaseSettlementSummary): Promise<CaseSettlementSummary>;
    getSettlementSummaryByCase(tenantId: string, ktgCaseId: string): Promise<CaseSettlementSummary | null>;
    listSettlementSummaries(tenantId: string): Promise<CaseSettlementSummary[]>;
    createReconciliationRecord(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord>;
    getReconciliationRecordByRun(tenantId: string, runId: string): Promise<PaymentReconciliationRecord | null>;
    updateReconciliationRecord(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord>;
    listReconciliationRecords(tenantId: string, filters?: {
        reconciliationStatus?: string;
    }): Promise<PaymentReconciliationRecord[]>;
    createPayrollBookingConfirmation(conf: PayrollBookingConfirmation): Promise<PayrollBookingConfirmation>;
    getPayrollBookingConfirmationByRun(tenantId: string, runId: string): Promise<PayrollBookingConfirmation | null>;
    createAuditEvent(event: PaymentOperationsAuditEvent): Promise<PaymentOperationsAuditEvent>;
    listAuditEventsByRun(tenantId: string, runId: string): Promise<PaymentOperationsAuditEvent[]>;
    listAuditEvents(tenantId: string, filters?: {
        runId?: string;
    }): Promise<PaymentOperationsAuditEvent[]>;
}
export interface PaymentOperationsRepository extends PaymentOperationsRepositoryContext {
    withTransaction<T>(operation: (repo: PaymentOperationsRepositoryContext) => Promise<T>): Promise<T>;
}
export declare class PaymentOperationsService {
    private readonly repository;
    constructor(repository: PaymentOperationsRepository);
    private appendAuditEvent;
    createPaymentRun(input: {
        tenantId: string;
        runType: PaymentRun["runType"];
        scheduledExecutionAt?: string;
        notes?: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentRun>>;
    addInstructionToRun(params: {
        tenantId: string;
        runId: string;
        paymentInstruction: PaymentInstructionRef;
    }, actor: ActorContext): Promise<CommandResult<PaymentRunItem>>;
    removeInstructionFromRun(params: {
        tenantId: string;
        runId: string;
        runItemId: string;
        reason: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentRunItem>>;
    markReadyForExport(params: {
        tenantId: string;
        runId: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentRun>>;
    cancelPaymentRun(params: {
        tenantId: string;
        runId: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentRun>>;
    generateExportPackage(params: {
        tenantId: string;
        runId: string;
        format: ExportFormat;
        generatedBy: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentExportPackage>>;
    generateStatement(params: {
        tenantId: string;
        runId: string;
        paymentInstructionId?: string;
        ktgCaseId: string;
        statementType: StatementType;
        taggelddispositivData?: TaggelddispositivData;
    }, actor: ActorContext): Promise<CommandResult<PaymentStatement>>;
    updateReconciliationStatus(params: {
        tenantId: string;
        runId: string;
        status: ReconciliationStatus;
        reconciledBy?: string;
        mismatchReason?: string;
        payrollBookingReference?: string;
    }, actor: ActorContext): Promise<CommandResult<PaymentReconciliationRecord>>;
    recordPayrollBookingConfirmation(params: {
        tenantId: string;
        runId: string;
        confirmationReference: string;
        confirmedBy: string;
        bookingPayload: Record<string, unknown>;
    }, actor: ActorContext): Promise<CommandResult<PayrollBookingConfirmation>>;
    getPaymentRunDetail(tenantId: string, runId: string): Promise<PaymentRunDetail | null>;
    listPaymentRuns(tenantId: string, filters?: {
        runStatus?: string;
        runType?: string;
    }): Promise<PaymentRun[]>;
    getSettlementSummaryByCase(tenantId: string, ktgCaseId: string): Promise<CaseSettlementSummary | null>;
    listSettlementSummaries(tenantId: string): Promise<CaseSettlementSummary[]>;
    listReconciliationRecords(tenantId: string, filters?: {
        reconciliationStatus?: string;
    }): Promise<PaymentReconciliationRecord[]>;
    listAuditEvents(tenantId: string, filters?: {
        runId?: string;
    }): Promise<PaymentOperationsAuditEvent[]>;
}
