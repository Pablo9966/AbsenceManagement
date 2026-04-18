export type WorkspaceStatus =
  | "new"
  | "intake_in_progress"
  | "waiting_for_information"
  | "ready_for_review"
  | "decision_pending"
  | "completed";

export type ChecklistItemStatus = "open" | "satisfied" | "waived";
export type SourceService = "ktg_case_service" | "document_service" | "absence_service" | "people_service" | "manual";
export type RequestPartyType = "hr_manager" | "employee" | "claims_handler" | "document_review" | "external_partner";
export type RequestChannelPolicy = "portal_only" | "portal_and_email" | "internal_only";
export type MissingInformationRequestStatus = "open" | "answered" | "cancelled" | "overdue";
export type QueueType = "new_submissions" | "missing_information_follow_up" | "ready_for_review" | "decision_pending";
export type QueueEntryStatus = "entered" | "in_progress" | "paused" | "exited";
export type NoteVisibility = "internal_claims_only" | "internal_claims_team";
export type NoteType = "triage_note" | "medical_review_note" | "operations_note" | "system_note";
export type RecommendationType = "request_more_information" | "ready_for_decision" | "medical_review_needed" | "escalate";
export type ActorRole = "claims_handler" | "team_lead" | "medical_reviewer" | "system";
export type EvidenceReferenceType = "document_id" | "certificate_reference_id";
export type DocumentRole = "primary_certificate" | "supporting_medical_evidence" | "claims_attachment" | "reference_only";
export type LinkSource = "manual" | "inferred_from_ktg_case" | "inferred_from_document_service";
export type WorkspaceActivityEventType =
  | "workspace_created"
  | "workspace_updated"
  | "workspace_status_changed"
  | "checklist_item_created"
  | "checklist_item_updated"
  | "missing_information_requested"
  | "missing_information_resolved"
  | "missing_information_updated"
  | "queue_entered"
  | "queue_status_changed"
  | "queue_exited"
  | "note_created"
  | "recommendation_created"
  | "evidence_reference_linked";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface IntakeCaseWorkspace {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  employeeId: string;
  policyId: string;
  workspaceStatus: WorkspaceStatus;
  assignedHandlerId?: string;
  assignedTeam?: string;
  submittedAt: string;
  lastActivityAt: string;
  closedAt?: string;
}

export interface IntakeChecklistItem {
  id: string;
  tenantId: string;
  workspaceId: string;
  checkType: string;
  blockerCode?: string;
  sourceService: SourceService;
  blockingFlag: boolean;
  status: ChecklistItemStatus;
  requiredFlag: boolean;
  satisfiedByReferenceType?: EvidenceReferenceType;
  satisfiedByReferenceId?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface MissingInformationRequest {
  id: string;
  tenantId: string;
  workspaceId: string;
  requestReasonCode: string;
  requestDetails?: string;
  requestedFromPartyType: RequestPartyType;
  requestedFromUserId?: string;
  requestedFromRole?: string;
  requestChannelPolicy: RequestChannelPolicy;
  relatedReferenceType?: string;
  relatedReferenceId?: string;
  status: MissingInformationRequestStatus;
  requestedAt: string;
  dueAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface HandlerWorkQueueEntry {
  id: string;
  tenantId: string;
  workspaceId: string;
  queueType: QueueType;
  queueStatus: QueueEntryStatus;
  slaDueAt?: string;
  sortScore?: number;
  enteredAt: string;
  exitedAt?: string;
  exitReason?: string;
}

export interface HandlerWorkQueueEntryDetail extends HandlerWorkQueueEntry {
  overdue: TransparentBoolean;
}

export interface WorkspaceNote {
  id: string;
  tenantId: string;
  workspaceId: string;
  authorId?: string;
  authorRole: ActorRole;
  visibility: NoteVisibility;
  noteType: NoteType;
  message: string;
  createdAt: string;
}

export interface IntakeDecisionRecommendation {
  id: string;
  tenantId: string;
  workspaceId: string;
  recommendationType: RecommendationType;
  confidence?: number;
  reasonCodes?: string[] | Record<string, unknown>;
  summary: string;
  generatedAt: string;
  acceptedBy?: string;
  acceptedAt?: string;
}

export interface WorkspaceActivityEvent {
  id: string;
  tenantId: string;
  workspaceId: string;
  eventType: WorkspaceActivityEventType;
  actorId?: string;
  actorRole: ActorRole;
  occurredAt: string;
  correlationId?: string;
  payload?: Record<string, unknown>;
}

export interface WorkspaceEvidenceReference {
  id: string;
  tenantId: string;
  workspaceId: string;
  documentRole: DocumentRole;
  documentId?: string;
  certificateReferenceId?: string;
  linkSource: LinkSource;
  linkConfidence?: number;
  linkedAt: string;
}

export interface IntakeCaseWorkspaceDetail extends IntakeCaseWorkspace {
  checklistItems: IntakeChecklistItem[];
  missingInformationRequests: MissingInformationRequest[];
  queueEntries: HandlerWorkQueueEntryDetail[];
  notes: WorkspaceNote[];
  recommendations: IntakeDecisionRecommendation[];
  activityEvents: WorkspaceActivityEvent[];
  evidenceReferences: WorkspaceEvidenceReference[];
  readyForReview: TransparentBoolean;
  blocked: TransparentBoolean;
}

export interface UpdateIntakeCaseWorkspacePatch {
  workspaceStatus?: WorkspaceStatus;
  assignedHandlerId?: string;
  assignedTeam?: string;
  lastActivityAt?: string;
  closedAt?: string;
}

export interface UpdateChecklistItemPatch {
  status?: ChecklistItemStatus;
  satisfiedByReferenceType?: EvidenceReferenceType;
  satisfiedByReferenceId?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface UpdateMissingInformationRequestPatch {
  status?: MissingInformationRequestStatus;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface UpdateHandlerWorkQueueEntryPatch {
  queueStatus?: QueueEntryStatus;
  exitedAt?: string;
  exitReason?: string;
}
