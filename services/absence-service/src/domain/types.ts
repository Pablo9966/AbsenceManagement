export type AbsenceType =
  | "ktg_sickness"
  | "uvg_bu"
  | "uvg_nbu"
  | "eo_maternity"
  | "eo_military"
  | "other_leave";

export type AbsenceStatus =
  | "reported"
  | "acknowledged"
  | "in_progress"
  | "partially_returned"
  | "closed"
  | "cancelled";

export type AbsenceSource =
  | "employee_portal"
  | "hr_portal"
  | "line_manager"
  | "integration"
  | "api"
  | "batch";

export type AbsenceActorRole =
  | "employee"
  | "hr_manager"
  | "payroll_manager"
  | "line_manager"
  | "system";

export type CommentVisibility =
  | "hr_internal"
  | "manager_visible"
  | "employee_visible"
  | "system_internal";

export type RecurrenceLinkBasis = "same_condition_reported" | "manual_linked" | "claims_linked";
export type RecurrenceStatus = "open" | "closed";
export type StatusEventType =
  | "reported"
  | "acknowledged"
  | "started"
  | "partially_returned"
  | "closed"
  | "cancelled"
  | "reopened"
  | "relapse_linked"
  | "corrected";

export type WorkingTimeModel = "fixed_schedule" | "annualized_hours" | "shift" | "irregular";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface AbsenceEpisode {
  id: string;
  tenantId: string;
  employeeId: string;
  primaryAbsenceType: AbsenceType;
  source: AbsenceSource;
  reportedAt: string;
  reportedByUserId?: string;
  reportedByRole: AbsenceActorRole;
  startDate: string;
  firstDayOfIncapacity?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
  status: AbsenceStatus;
  reasonCategory?: string;
  reasonSubcategory?: string;
  lineManagerAckRequired: boolean;
  lineManagerAcknowledgedAt?: string;
  recurrenceGroupId?: string;
}

export interface AbsenceContractImpact {
  id: string;
  tenantId: string;
  episodeId: string;
  employmentContractId: string;
  affectedEmploymentPercentage: number;
  employmentPercentageSnapshot: number;
  workingTimeModel: WorkingTimeModel;
  scheduledHoursPerWeekSnapshot?: number;
}

export interface AbsenceDailyRecord {
  id: string;
  tenantId: string;
  episodeId: string;
  contractImpactId: string;
  employeeId: string;
  employmentContractId: string;
  absenceDate: string;
  incapacityPercentage: number;
  partialDayPercentage: number;
  scheduledWorkMinutes?: number;
  lostWorkMinutes?: number;
  certifiedFlag: boolean;
  certificateReferenceId?: string;
  returnToWorkFlag: boolean;
  coordinatedOverlapFlag: boolean;
}

export interface AbsenceRecurrenceGroup {
  id: string;
  tenantId: string;
  recurrenceBasis: RecurrenceLinkBasis;
  initialEpisodeId?: string;
  status: RecurrenceStatus;
}

export interface AbsenceStatusEvent {
  id: string;
  tenantId: string;
  episodeId: string;
  fromStatus?: AbsenceStatus;
  toStatus: AbsenceStatus;
  eventType: StatusEventType;
  eventAt: string;
  actorId?: string;
  actorRole: AbsenceActorRole;
  correlationId?: string;
  payload?: Record<string, unknown>;
}

export interface AbsenceComment {
  id: string;
  tenantId: string;
  episodeId: string;
  authorId?: string;
  authorRole: AbsenceActorRole;
  visibility: CommentVisibility;
  message: string;
  createdAt: string;
}

export interface AbsenceDailyRecordView extends AbsenceDailyRecord {
  absenceDayEquivalent: AbsenceDayEquivalent;
}

export interface AbsenceEpisodeDetail {
  episode: AbsenceEpisode;
  contractImpacts: AbsenceContractImpact[];
  dailyRecords: AbsenceDailyRecordView[];
  comments: AbsenceComment[];
  statusEvents: AbsenceStatusEvent[];
}

export interface AbsenceDayEquivalent extends TransparentValue<number> {
  effectiveAt: string;
  method: "minutes" | "percentages";
}

export interface BradfordFactor extends TransparentValue<number> {
  windowStart: string;
  windowEnd: string;
}

export interface AbsenceTimelineItem {
  episodeId: string;
  employeeId: string;
  primaryAbsenceType: AbsenceType;
  status: AbsenceStatus;
  startDate: string;
  endDate?: string;
  dayEquivalents: number;
  recurrenceGroupId?: string;
}

export interface UpdateAbsenceEpisodePatch {
  expectedEndDate?: string;
  actualEndDate?: string;
  reasonCategory?: string;
  reasonSubcategory?: string;
  lineManagerAckRequired?: boolean;
}
