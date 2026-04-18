export type KtgCaseStatus =
  | "suggested"
  | "draft"
  | "submitted"
  | "in_review"
  | "benefit_active"
  | "closed"
  | "rejected";

export type SubmissionReadinessStatus = "not_ready" | "ready" | "blocked";
export type CaseActorRole = "hr_manager" | "claims_handler" | "account_manager" | "system" | "api";
export type SubmissionValidationStatus = "valid" | "warning" | "blocked";
export type CorrespondenceChannel = "portal" | "email" | "api" | "claims_system";
export type DeadlineType =
  | "case_submission"
  | "certificate_renewal"
  | "reintegration_touchpoint"
  | "hr_follow_up"
  | "claims_reply"
  | "benefit_review";
export type DeadlineCountingMethod = "calendar_days" | "working_days";
export type DeadlineEscalationStatus = "not_escalated" | "escalated" | "resolved";
export type TaskType =
  | "submit_case"
  | "request_certificate"
  | "review_claims_reply"
  | "prepare_return_to_work"
  | "follow_up_employer"
  | "manual";
export type TaskStatus = "open" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type NoteVisibility = "shared_hr_claims" | "elips_internal" | "system_internal";
export type DecisionStatus = "accepted" | "partially_accepted" | "rejected" | "suspended" | "closed_without_payment";
export type CaseStatusEventType =
  | "suggested"
  | "drafted"
  | "submitted"
  | "submission_blocked"
  | "in_review"
  | "benefit_activated"
  | "closed"
  | "rejected"
  | "corrected"
  | "relapse_linked";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentDate extends TransparentValue<string> {
  effectiveAt: string;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface KtgCase {
  id: string;
  tenantId: string;
  caseNumber: string;
  employeeId: string;
  policyId: string;
  status: KtgCaseStatus;
  submissionReadinessStatus: SubmissionReadinessStatus;
  benefitStartDate?: string;
  claimsSystemCaseId?: string;
  relapseOfCaseId?: string;
}

export interface KtgCaseAbsenceLink {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  absenceEpisodeId: string;
  isOriginatingEpisode: boolean;
  linkedAt: string;
}

export interface KtgCaseCoverageSnapshot {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  policyId: string;
  coveragePercentage: number;
  wartezeitDays: number;
  leistungsdauerDays: number;
  lohnfortzahlungDays: number;
  salaryFormulaVersion: string;
  insuredSalarySnapshotId?: string;
  insuredSalaryAmountChf?: number;
  insuredSalaryFormula?: string;
  insuredSalaryInputs?: Record<string, unknown>;
  firstDayOfIncapacity: string;
  capturedAt: string;
}

export interface KtgCaseSubmission {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  submittedAt: string;
  submittedBy?: string;
  validationResult: SubmissionValidationStatus;
  externalClaimsSystemId?: string;
  correspondenceChannel: CorrespondenceChannel;
  payloadSnapshot: Record<string, unknown>;
}

export interface KtgDeadline {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  deadlineType: DeadlineType;
  dueAt: string;
  countingMethod: DeadlineCountingMethod;
  responsibleRole: CaseActorRole;
  escalationStatus: DeadlineEscalationStatus;
  completedAt?: string;
}

export interface KtgTask {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  deadlineId?: string;
  taskType: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  dueAt?: string;
  completedAt?: string;
  description?: string;
}

export interface KtgCaseNote {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  authorId?: string;
  authorRole: CaseActorRole;
  visibility: NoteVisibility;
  message: string;
  createdAt: string;
}

export interface KtgCaseDecision {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  decisionStatus: DecisionStatus;
  reasonCode?: string;
  reasonText?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  decisionAt: string;
  dailyAllowanceAmountChf: number;
  paymentRunId?: string;
}

export interface KtgCaseStatusEvent {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  fromStatus?: KtgCaseStatus;
  toStatus: KtgCaseStatus;
  eventType: CaseStatusEventType;
  eventAt: string;
  actorId?: string;
  actorRole: CaseActorRole;
  correlationId?: string;
  payload?: Record<string, unknown>;
}

export interface KtgCaseSuggestion {
  employeeId: string;
  absenceEpisodeId: string;
  policyId: string;
  shouldSuggestCase: TransparentBoolean;
  firstPayableDay?: TransparentDate;
}

export interface KtgCaseDetail extends KtgCase {
  absenceLinks: KtgCaseAbsenceLink[];
  coverageSnapshot?: KtgCaseCoverageSnapshot;
  submissions: KtgCaseSubmission[];
  deadlines: KtgDeadline[];
  tasks: KtgTask[];
  notes: KtgCaseNote[];
  decisions: KtgCaseDecision[];
  statusEvents: KtgCaseStatusEvent[];
  firstPayableDay?: TransparentDate;
  submissionReadiness: TransparentBoolean;
}

export interface UpdateKtgCasePatch {
  submissionReadinessStatus?: SubmissionReadinessStatus;
  benefitStartDate?: string;
  claimsSystemCaseId?: string;
  relapseOfCaseId?: string;
}
