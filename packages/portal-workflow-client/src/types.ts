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

// Phase 2E: UVG Native Flow

export type WorkflowUvgCaseType = "bu" | "nbu";
export type WorkflowUvgCaseStatus =
  | "reported"
  | "intake_in_progress"
  | "under_review"
  | "awaiting_documents"
  | "coordinating"
  | "approved"
  | "rejected"
  | "closed";
export type WorkflowUvgCoordinationStatus = "not_required" | "open" | "in_review" | "resolved";

export interface EmployerUvgCaseListItem {
  caseId: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  uvgCaseType: WorkflowUvgCaseType;
  caseStatus: WorkflowUvgCaseStatus;
  accidentDate: string;
  incidentLocation: string;
  coordinationStatus: WorkflowUvgCoordinationStatus;
  linkedKtgCaseId?: string;
  reportArtifactCount: number;
}

export interface EmployerUvgCaseDetail extends EmployerUvgCaseListItem {
  incidentSummary: string;
  reportedAt: string;
  accidentDescription?: string;
  witnessDetails?: string;
  policeInvolvedFlag?: boolean;
  linkedDocumentIds: string[];
  reportArtifacts: Array<{
    artifactId: string;
    fileName: string;
    reportType: string;
    generatedAt: string;
  }>;
}

export interface EmployerUvgAccidentReportResult {
  caseId: string;
  caseNumber: string;
  caseStatus: WorkflowUvgCaseStatus;
  uvgCaseType: WorkflowUvgCaseType;
  reportedAt: string;
}

export interface EmployerUvgReportArtifactResult {
  artifactId: string;
  caseId: string;
  fileName: string;
  storageReference: string;
  generatedAt: string;
  pdfSizeBytes: number;
}

export interface InternalUvgCaseListItem {
  caseId: string;
  caseNumber: string;
  employeeId: string;
  employeeName: string;
  uvgCaseType: WorkflowUvgCaseType;
  caseStatus: WorkflowUvgCaseStatus;
  accidentDate: string;
  coordinationStatus: WorkflowUvgCoordinationStatus;
  linkedKtgCaseId?: string;
  injuryCount: number;
  decisionStatus?: string;
}

export interface InternalUvgCaseDetail extends InternalUvgCaseListItem {
  policyId: string;
  incidentLocation: string;
  incidentSummary: string;
  intake?: {
    reporterRole: string;
    employerReference?: string;
    accidentTime?: string;
    accidentPlace: string;
    occupationalContext: string;
    accidentDescription: string;
    witnessDetails?: string;
    policeInvolvedFlag: boolean;
    submittedAt: string;
  };
  injuries: Array<{
    id: string;
    injuryType: string;
    bodyPart: string;
    severity: string;
    medicalTreatmentFlag: boolean;
    hospitalizedFlag: boolean;
    notes?: string;
  }>;
  circumstances: Array<{
    id: string;
    causeCategory: string;
    activityContext: string;
    thirdPartyInvolvedFlag: boolean;
    vehicleInvolvedFlag: boolean;
    narrative: string;
    createdAt: string;
  }>;
  documentReferences: Array<{
    id: string;
    documentId: string;
    documentRole: string;
    linkedAt: string;
  }>;
  coordinationRecords: Array<{
    id: string;
    coordinationType: string;
    relatedKtgCaseId?: string;
    overlapStart?: string;
    overlapEnd?: string;
    coordinationStatus: WorkflowUvgCoordinationStatus;
    benefitOverlapFlag: boolean;
    notes?: string;
    updatedAt: string;
  }>;
  decisions: Array<{
    id: string;
    decisionStatus: string;
    decisionReason: string;
    effectiveFrom: string;
    effectiveTo?: string;
    decidedAt: string;
    decidedBy: string;
  }>;
  reportArtifacts: Array<{
    artifactId: string;
    fileName: string;
    reportType: string;
    generatedAt: string;
    storageReference: string;
  }>;
  auditEvents: Array<{
    eventId: string;
    eventType: string;
    occurredAt: string;
    actorId: string;
    actorRole: string;
    payload?: Record<string, unknown>;
  }>;
}

// Phase 2F: Premium Reconciliation

export interface EmployerPremiumDashboard {
  periodId: string;
  periodLabel: string;
  reportingStatus: string;
  salaryMassStatus: string;
  insuredSalaryMassChf: number;
  claimsRatio: number;
  expectedPremiumChf: number;
  adjustmentDeltaChf: number;
  adjustmentType?: string;
  openInstallmentAmountChf: number;
  latestReportId?: string;
  latestCalculationId?: string;
  installmentPlanIds: string[];
}

export interface EmployerSalaryMassReportResult {
  reportId: string;
  periodId: string;
  reportStatus: string;
  insuredSalaryMassChf: number;
  employeeCount: number;
}

export interface EmployerPremiumAdjustmentResult {
  calculationId: string;
  periodId: string;
  reportId: string;
  priorPremiumChf: number;
  recalculatedPremiumChf: number;
  deltaAmountChf: number;
  adjustmentType: string;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface EmployerPremiumSettlementResult {
  recommendationId: string;
  calculationId: string;
  recommendationType: string;
  grossAmountChf: number;
  netAmountChf: number;
  settlementReason: string;
  installmentEligibleFlag: boolean;
}

export interface EmployerPremiumInstallmentPlanSummary {
  planId: string;
  periodId: string;
  planStatus: string;
  installmentCount: number;
  totalAmountChf: number;
  openAmountChf: number;
  items: Array<{
    itemId: string;
    dueDate: string;
    amountChf: number;
    installmentStatus: string;
    reference?: string;
  }>;
}

// Phase 2G: Employer Client Analytics

export type EmployerAnalyticsGranularity = "monthly" | "weekly";

export interface EmployerAnalyticsTrendPoint {
  bucket: string;
  absenceVolume: number;
  caseVolume: number;
  averageDurationDays: number;
  totalCostChf: number;
}

export interface EmployerAnalyticsCausePoint {
  causeCategory: string;
  count: number;
  share: number;
}

export interface EmployerAnalyticsHeatmapCell {
  bucket: string;
  causeCategory: string;
  count: number;
}

export interface EmployerAnalyticsDashboard {
  dashboardKey: string;
  roleScope: string;
  periodStart: string;
  periodEnd: string;
  granularity: EmployerAnalyticsGranularity;
  refreshedAt: string;
  refreshJobId?: string;
  metricDefinitions: Record<string, string>;
  summary: {
    absenceVolume: number;
    totalCostChf: number;
    averageDurationDays: number;
    medianDurationDays: number;
    returnToWorkSuccessRate: number;
    longDurationCaseCount: number;
  };
  trends: EmployerAnalyticsTrendPoint[];
  causes: EmployerAnalyticsCausePoint[];
  heatmap: EmployerAnalyticsHeatmapCell[];
  costByCaseType: Array<{ caseType: string; amountChf: number }>;
  duration: {
    averageDurationDays: number;
    medianDurationDays: number;
    totalDurationDays: number;
    longDurationCaseCount: number;
    openCaseCount: number;
    closedCaseCount: number;
  };
  returnToWork: {
    completionRate: number;
    completed: number;
    total: number;
    withinThirtyDays: number;
  };
}

export interface EmployerAnalyticsRefreshResult {
  refreshJobId: string;
  jobStatus: string;
  refreshedAt: string;
  dashboard: EmployerAnalyticsDashboard;
}
