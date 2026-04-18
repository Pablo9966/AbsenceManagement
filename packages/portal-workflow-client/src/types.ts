export type PortalLocale = "de-CH" | "en-CH" | "fr-CH" | "it-CH";

export interface WorkflowPermission {
  resourceType: string;
  action: string;
  allowed: boolean;
}

export interface WorkflowLink {
  label: string;
  href: string;
  relatedId?: string;
}

export interface WorkflowMeta {
  tenantId: string;
  locale: PortalLocale;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  appliedFilters?: Record<string, string>;
}

export interface WorkflowListQuery {
  page?: number;
  pageSize?: number;
}

export interface WorkflowResponse<T> {
  data: T;
  meta: WorkflowMeta;
  permissions: WorkflowPermission[];
  links: WorkflowLink[];
}

export interface EmployeeDashboardSummary {
  employeeId: string;
  employeeName: string;
  activeAbsenceCount: number;
  recentDocumentCount: number;
  pendingActionCount: number;
  currentStatus: string;
  activeAbsences: EmployeeAbsenceListItem[];
  recentDocuments: EmployeeDocumentListItem[];
  pendingActions: Array<{
    key: string;
    label: string;
    href: string;
  }>;
  returnToWorkPrompt?: EmployeeReturnToWorkState;
}

export interface EmployeeAbsenceListItem {
  episodeId: string;
  employeeId: string;
  periodLabel: string;
  displayStatus: string;
  status: string;
  source: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  certificateDocumentIds: string[];
}

export interface EmployeeAbsenceDetail {
  episodeId: string;
  employeeId: string;
  periodLabel: string;
  displayStatus: string;
  status: string;
  source: string;
  startDate: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  timeline: Array<{
    date: string;
    label: string;
    type: "status" | "daily_record";
  }>;
  documents: Array<{
    documentId: string;
    title: string;
    status: string;
  }>;
}

export interface EmployeeDocumentListItem {
  documentId: string;
  employeeId: string;
  title: string;
  documentType: string;
  status: string;
  uploadedAt: string;
  linkedEpisodeId?: string;
  certificateStatus?: string;
}

export interface EmployeeDocumentDetail {
  documentId: string;
  employeeId: string;
  title: string;
  documentType: string;
  status: string;
  uploadedAt: string;
  linkedEpisodeId?: string;
  certificateStatus?: string;
  coverageLabel?: string;
}

export interface EmployeeStatusSummary {
  employeeId: string;
  employeeName: string;
  activeAbsences: EmployeeAbsenceListItem[];
  documents: EmployeeDocumentListItem[];
  currentStatus: string;
}

export interface EmployeeReturnToWorkState {
  episodeId: string;
  periodLabel: string;
  currentStatus: string;
  suggestedReturnDate?: string;
}

export interface EmployeeAbsenceSubmissionResult {
  episodeId: string;
  status: string;
  createdAt: string;
}

export interface EmployeeCertificateUploadResult {
  documentId: string;
  status: string;
  linkedEpisodeId?: string;
  uploadedAt: string;
}

export interface EmployeeReturnToWorkResult {
  episodeId: string;
  status: string;
  actualEndDate: string;
}

export interface EmployerDashboardSummary {
  cards: Array<{
    key: "open_absences" | "open_cases" | "pending_certificates" | "tasks_deadlines";
    label: string;
    value: number;
    href: string;
  }>;
}

export interface EmployerAbsenceListItem {
  episodeId: string;
  employeeId: string;
  employeeName: string;
  periodLabel: string;
  status: string;
  incapacityPercent: number;
  linkedCaseId?: string;
}

export interface EmployerAbsenceDetail {
  episodeId: string;
  employeeId: string;
  employeeName: string;
  status: string;
  timeline: Array<{
    date: string;
    label: string;
    type: "status" | "comment" | "daily_record";
  }>;
  certificateDocumentIds: string[];
  linkedCaseIds: string[];
}

export interface EmployerCaseListItem {
  caseId: string;
  caseNumber: string;
  employeeName: string;
  status: string;
  deadlineAt?: string;
  linkedEpisodeIds: string[];
}

export interface EmployerCaseDetail {
  caseId: string;
  caseNumber: string;
  employeeName: string;
  status: string;
  coverageSummary: string;
  deadlineSummary: string[];
  linkedEpisodeIds: string[];
  linkedDocumentIds: string[];
  decisionSummary: string[];
  paymentSummaryIds: string[];
}

export interface EmployerDocumentListItem {
  documentId: string;
  title: string;
  employeeName: string;
  status: string;
  linkedEpisodeId?: string;
  linkedCaseId?: string;
}

export interface EmployerTaskListItem {
  taskId: string;
  title: string;
  status: string;
  dueAt?: string;
  href: string;
}

export interface EmployerPaymentSummary {
  paymentSummaryId: string;
  caseId: string;
  caseNumber: string;
  amountChf: number;
  periodLabel: string;
  status: string;
}

export interface InternalDashboardSummary {
  cards: Array<{
    key: "intake_workload" | "pending_review" | "calculation_review" | "compliance_alerts";
    label: string;
    value: number;
    href: string;
  }>;
}

export interface InternalIntakeListItem {
  workspaceId: string;
  ktgCaseId: string;
  status: string;
  assignedHandler: string;
  blockerCount: number;
  overdue: boolean;
}

export interface InternalIntakeDetail {
  workspaceId: string;
  ktgCaseId: string;
  status: string;
  checklistItems: Array<{ id: string; label: string; status: string; blocking: boolean }>;
  missingInformationRequests: Array<{ id: string; requestedFrom: string; status: string }>;
  notes: Array<{ id: string; author: string; body: string }>;
  evidenceReferences: Array<{ id: string; label: string; referenceId: string }>;
  activityHistory: Array<{ id: string; occurredAt: string; label: string }>;
}

export interface InternalCaseListItem {
  caseId: string;
  caseNumber: string;
  employeeName: string;
  status: string;
  assignedTeam?: string;
  deadlineAt?: string;
}

export interface InternalCaseDetail {
  caseId: string;
  caseNumber: string;
  employeeName: string;
  status: string;
  submissions: string[];
  deadlines: string[];
  decisions: string[];
  linkedEpisodeIds: string[];
  linkedDocumentIds: string[];
  linkedCalculationIds: string[];
}

export interface InternalBenefitListItem {
  calculationId: string;
  ktgCaseId: string;
  status: string;
  referenceDate: string;
  periodCount: number;
}

export interface InternalBenefitDetail {
  calculationId: string;
  ktgCaseId: string;
  status: string;
  entitlementPeriods: Array<{ id: string; label: string; payableAmountChf: number }>;
  adjustmentSummary: string[];
  paymentInstructionSummary: Array<{ id: string; routing: string; amountChf: number }>;
}

// Phase 2C: Payment Operations types

export interface InternalPaymentRunListItem {
  runId: string;
  runNumber: string;
  runType: string;
  runStatus: string;
  instructionCount: number;
  totalNetAmountChf: number;
  reconciliationStatus: string;
  createdAt: string;
}

export interface InternalPaymentRunItemSummary {
  runItemId: string;
  paymentInstructionId: string;
  ktgCaseId: string;
  payeeReference: string;
  periodLabel: string;
  netAmountChf: number;
  itemStatus: string;
}

export interface InternalExportPackageSummary {
  exportId: string;
  exportFormat: string;
  fileName: string;
  exportStatus: string;
  generatedAt: string;
  generatedBy: string;
}

export interface InternalStatementSummary {
  statementId: string;
  statementType: string;
  ktgCaseId: string;
  periodLabel: string;
  fileName: string;
  pdfSizeBytes: number;
  generatedAt: string;
}

export interface InternalReconciliationRecord {
  reconciliationId: string;
  paymentRunId: string;
  reconciliationStatus: string;
  reconciledAt?: string;
  reconciledBy?: string;
  mismatchReason?: string;
  payrollBookingReference?: string;
  confirmationReceivedAt?: string;
}

export interface InternalPaymentRunDetail {
  runId: string;
  runNumber: string;
  runType: string;
  runStatus: string;
  instructionCount: number;
  totalGrossAmountChf: number;
  totalNetAmountChf: number;
  reconciliationStatus: string;
  createdAt: string;
  createdBy: string;
  scheduledExecutionAt?: string;
  exportedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  notes?: string;
  items: InternalPaymentRunItemSummary[];
  exportPackages: InternalExportPackageSummary[];
  statements: InternalStatementSummary[];
  reconciliation?: InternalReconciliationRecord;
  bookingReference?: string;
}

export interface InternalSettlementSummary {
  summaryId: string;
  ktgCaseId: string;
  latestPaymentRunId?: string;
  totalGrossPaidChf: number;
  totalNetPaidChf: number;
  totalPayableDays: number;
  lastStatementAt?: string;
  settlementStatus: string;
  updatedAt: string;
}

export interface InternalMonthEndReportEntry {
  runId: string;
  runNumber: string;
  runStatus: string;
  totalNetAmountChf: number;
  reconciliationStatus: string;
  exportedAt?: string;
  completedAt?: string;
  mismatch: boolean;
  bookingReference?: string;
}

export interface InternalMonthEndReport {
  reportGeneratedAt: string;
  totalRuns: number;
  totalNetAmountChf: number;
  confirmed: number;
  unresolved: number;
  mismatches: number;
  entries: InternalMonthEndReportEntry[];
}

export interface InternalPaymentAuditEventItem {
  eventId: string;
  paymentRunId?: string;
  eventType: string;
  occurredAt: string;
  actorId: string;
  actorRole: string;
  payload?: Record<string, unknown>;
}

export interface EmployerPaymentRunSummary {
  runId: string;
  runNumber: string;
  totalNetAmountChf: number;
  instructionCount: number;
  runStatus: string;
  createdAt: string;
}
