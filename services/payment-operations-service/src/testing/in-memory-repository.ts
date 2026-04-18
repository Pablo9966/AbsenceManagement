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
import type {
  PaymentOperationsRepository,
  PaymentOperationsRepositoryContext,
} from "../application/payment-operations.service.js";

export interface PaymentOperationsRepositorySnapshot {
  runs: PaymentRun[];
  runItems: PaymentRunItem[];
  exportPackages: PaymentExportPackage[];
  statements: PaymentStatement[];
  settlementSummaries: CaseSettlementSummary[];
  reconciliationRecords: PaymentReconciliationRecord[];
  bookingConfirmations: PayrollBookingConfirmation[];
  auditEvents: PaymentOperationsAuditEvent[];
}

const replaceById = <T extends { id: string }>(items: T[], next: T): T[] => {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    items.push(next);
    return items;
  }
  items[index] = next;
  return items;
};

const append = <T extends { tenantId?: string }>(items: T[], value: T): T => {
  items.push(value);
  return value;
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class InMemoryPaymentOperationsRepository implements PaymentOperationsRepository {
  private runs: PaymentRun[] = [];
  private runItems: PaymentRunItem[] = [];
  private exportPackages: PaymentExportPackage[] = [];
  private statements: PaymentStatement[] = [];
  private settlementSummaries: CaseSettlementSummary[] = [];
  private reconciliationRecords: PaymentReconciliationRecord[] = [];
  private bookingConfirmations: PayrollBookingConfirmation[] = [];
  private auditEvents: PaymentOperationsAuditEvent[] = [];

  loadSnapshot(snapshot: PaymentOperationsRepositorySnapshot): void {
    this.runs = clone(snapshot.runs);
    this.runItems = clone(snapshot.runItems);
    this.exportPackages = clone(snapshot.exportPackages);
    this.statements = clone(snapshot.statements);
    this.settlementSummaries = clone(snapshot.settlementSummaries);
    this.reconciliationRecords = clone(snapshot.reconciliationRecords);
    this.bookingConfirmations = clone(snapshot.bookingConfirmations);
    this.auditEvents = clone(snapshot.auditEvents);
  }

  exportSnapshot(): PaymentOperationsRepositorySnapshot {
    return {
      runs: clone(this.runs),
      runItems: clone(this.runItems),
      exportPackages: clone(this.exportPackages),
      statements: clone(this.statements),
      settlementSummaries: clone(this.settlementSummaries),
      reconciliationRecords: clone(this.reconciliationRecords),
      bookingConfirmations: clone(this.bookingConfirmations),
      auditEvents: clone(this.auditEvents),
    };
  }

  async withTransaction<T>(operation: (repo: PaymentOperationsRepositoryContext) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createPaymentRun(run: PaymentRun): Promise<PaymentRun> {
    return append(this.runs, run);
  }

  async getPaymentRunById(tenantId: string, runId: string): Promise<PaymentRun | null> {
    return this.runs.find((run) => run.tenantId === tenantId && run.id === runId) ?? null;
  }

  async updatePaymentRun(run: PaymentRun): Promise<PaymentRun> {
    replaceById(this.runs, run);
    return run;
  }

  async listPaymentRuns(tenantId: string, filters?: { runStatus?: string; runType?: string }): Promise<PaymentRun[]> {
    return this.runs.filter(
      (run) =>
        run.tenantId === tenantId &&
        (!filters?.runStatus || run.runStatus === filters.runStatus) &&
        (!filters?.runType || run.runType === filters.runType),
    );
  }

  async createPaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem> {
    return append(this.runItems, item);
  }

  async listPaymentRunItemsByRun(tenantId: string, runId: string): Promise<PaymentRunItem[]> {
    return this.runItems.filter((item) => item.tenantId === tenantId && item.paymentRunId === runId);
  }

  async updatePaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem> {
    replaceById(this.runItems, item);
    return item;
  }

  async findActiveRunItemByInstruction(tenantId: string, paymentInstructionId: string): Promise<PaymentRunItem | null> {
    return this.runItems.find(
      (item) =>
        item.tenantId === tenantId &&
        item.paymentInstructionId === paymentInstructionId &&
        (item.itemStatus === "included" || item.itemStatus === "exported"),
    ) ?? null;
  }

  async createExportPackage(pkg: PaymentExportPackage): Promise<PaymentExportPackage> {
    return append(this.exportPackages, pkg);
  }

  async listExportPackagesByRun(tenantId: string, runId: string): Promise<PaymentExportPackage[]> {
    return this.exportPackages.filter((pkg) => pkg.tenantId === tenantId && pkg.paymentRunId === runId);
  }

  async createPaymentStatement(stmt: PaymentStatement): Promise<PaymentStatement> {
    return append(this.statements, stmt);
  }

  async listStatementsByRun(tenantId: string, runId: string): Promise<PaymentStatement[]> {
    return this.statements.filter((statement) => statement.tenantId === tenantId && statement.paymentRunId === runId);
  }

  async listStatementsByCase(tenantId: string, ktgCaseId: string): Promise<PaymentStatement[]> {
    return this.statements.filter((statement) => statement.tenantId === tenantId && statement.ktgCaseId === ktgCaseId);
  }

  async upsertSettlementSummary(summary: CaseSettlementSummary): Promise<CaseSettlementSummary> {
    const index = this.settlementSummaries.findIndex(
      (candidate) => candidate.tenantId === summary.tenantId && candidate.ktgCaseId === summary.ktgCaseId,
    );
    if (index === -1) {
      this.settlementSummaries.push(summary);
    } else {
      this.settlementSummaries[index] = summary;
    }
    return summary;
  }

  async getSettlementSummaryByCase(tenantId: string, ktgCaseId: string): Promise<CaseSettlementSummary | null> {
    return this.settlementSummaries.find(
      (summary) => summary.tenantId === tenantId && summary.ktgCaseId === ktgCaseId,
    ) ?? null;
  }

  async listSettlementSummaries(tenantId: string): Promise<CaseSettlementSummary[]> {
    return this.settlementSummaries.filter((summary) => summary.tenantId === tenantId);
  }

  async createReconciliationRecord(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord> {
    return append(this.reconciliationRecords, record);
  }

  async getReconciliationRecordByRun(tenantId: string, runId: string): Promise<PaymentReconciliationRecord | null> {
    return this.reconciliationRecords.find(
      (record) => record.tenantId === tenantId && record.paymentRunId === runId,
    ) ?? null;
  }

  async updateReconciliationRecord(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord> {
    replaceById(this.reconciliationRecords, record);
    return record;
  }

  async listReconciliationRecords(
    tenantId: string,
    filters?: { reconciliationStatus?: string },
  ): Promise<PaymentReconciliationRecord[]> {
    return this.reconciliationRecords.filter(
      (record) =>
        record.tenantId === tenantId &&
        (!filters?.reconciliationStatus || record.reconciliationStatus === filters.reconciliationStatus),
    );
  }

  async createPayrollBookingConfirmation(
    confirmation: PayrollBookingConfirmation,
  ): Promise<PayrollBookingConfirmation> {
    return append(this.bookingConfirmations, confirmation);
  }

  async getPayrollBookingConfirmationByRun(
    tenantId: string,
    runId: string,
  ): Promise<PayrollBookingConfirmation | null> {
    return this.bookingConfirmations.find(
      (confirmation) => confirmation.tenantId === tenantId && confirmation.paymentRunId === runId,
    ) ?? null;
  }

  async createAuditEvent(event: PaymentOperationsAuditEvent): Promise<PaymentOperationsAuditEvent> {
    return append(this.auditEvents, event);
  }

  async listAuditEventsByRun(tenantId: string, runId: string): Promise<PaymentOperationsAuditEvent[]> {
    return this.auditEvents
      .filter((event) => event.tenantId === tenantId && event.paymentRunId === runId)
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }

  async listAuditEvents(
    tenantId: string,
    filters?: { runId?: string },
  ): Promise<PaymentOperationsAuditEvent[]> {
    return this.auditEvents
      .filter(
        (event) =>
          event.tenantId === tenantId &&
          (!filters?.runId || event.paymentRunId === filters.runId),
      )
      .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
  }
}
