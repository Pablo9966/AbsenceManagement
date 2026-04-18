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
