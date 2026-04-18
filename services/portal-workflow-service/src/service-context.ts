import type {
  EmployerAbsenceDetail,
  EmployerAbsenceListItem,
  EmployerCaseDetail,
  EmployerCaseListItem,
  EmployerDashboardSummary,
  EmployerDocumentListItem,
  EmployerPaymentSummary,
  EmployerTaskListItem,
  InternalBenefitDetail,
  InternalBenefitListItem,
  InternalCaseDetail,
  InternalCaseListItem,
  InternalDashboardSummary,
  InternalIntakeDetail,
  InternalIntakeListItem,
  PortalLocale,
  WorkflowLink,
  WorkflowPermission,
  WorkflowResponse,
} from "@elipslife/portal-workflow-client";
import {
  AbsenceRecordingService,
  type AbsenceRepository,
} from "../../absence-service/src/application/absence-recording.service.js";
import {
  BenefitEngineService,
  type BenefitEngineRepository,
} from "../../benefit-engine-service/src/application/benefit-engine.service.js";
import {
  ClaimsIntakeWorkspaceService,
  type ClaimsIntakeWorkspaceRepository,
} from "../../claims-intake-workspace-service/src/application/claims-intake-workspace.service.js";
import {
  DashboardProjectionService,
  type DashboardProjectionRepository,
} from "../../dashboard-projection-service/src/application/dashboard-projection.service.js";
import {
  DocumentService,
  type DocumentRepository,
} from "../../document-service/src/application/document.service.js";
import {
  InboxNotificationService,
  type InboxNotificationRepository,
} from "../../inbox-notification-service/src/application/inbox-notification.service.js";
import {
  KtgCaseService,
  type KtgCaseRepository,
} from "../../ktg-case-service/src/application/ktg-case.service.js";

type ArrayItem<T> = T extends readonly (infer U)[] ? U : T extends (infer U)[] ? U : never;
type AwaitedReturn<T extends (...args: never[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

type AbsenceEpisode = NonNullable<AwaitedReturn<AbsenceRepository["getEpisodeById"]>>;
type AbsenceContractImpact = ArrayItem<AwaitedReturn<AbsenceRepository["listContractImpactsByEpisode"]>>;
type AbsenceDailyRecord = ArrayItem<AwaitedReturn<AbsenceRepository["listDailyRecordsByEpisode"]>>;
type AbsenceStatusEvent = ArrayItem<AwaitedReturn<AbsenceRepository["listStatusEventsByEpisode"]>>;
type AbsenceComment = ArrayItem<AwaitedReturn<AbsenceRepository["listCommentsByEpisode"]>>;
type AbsenceRecurrenceGroup = NonNullable<AwaitedReturn<AbsenceRepository["getRecurrenceGroupById"]>>;

type BenefitCaseCalculation = NonNullable<AwaitedReturn<BenefitEngineRepository["getCalculationById"]>>;
type InsuredSalarySnapshot = NonNullable<AwaitedReturn<BenefitEngineRepository["getInsuredSalarySnapshotByCalculation"]>>;
type CoordinationWindow = ArrayItem<AwaitedReturn<BenefitEngineRepository["listCoordinationWindowsByCalculation"]>>;
type BenefitEntitlementPeriod = ArrayItem<AwaitedReturn<BenefitEngineRepository["listEntitlementPeriodsByCalculation"]>>;
type BenefitDayBreakdown = ArrayItem<AwaitedReturn<BenefitEngineRepository["listDayBreakdownsByCalculation"]>>;
type BenefitAdjustment = ArrayItem<AwaitedReturn<BenefitEngineRepository["listAdjustmentsByCalculation"]>>;
type PaymentInstruction = ArrayItem<AwaitedReturn<BenefitEngineRepository["listPaymentInstructionsByCalculation"]>>;
type TaggelddispositivSnapshot = ArrayItem<AwaitedReturn<BenefitEngineRepository["listTaggelddispositiveByCalculation"]>>;
type CalculationAuditEvent = ArrayItem<AwaitedReturn<BenefitEngineRepository["listAuditEventsByCalculation"]>>;

type IntakeCaseWorkspace = NonNullable<AwaitedReturn<ClaimsIntakeWorkspaceRepository["getWorkspaceById"]>>;
type IntakeChecklistItem = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listChecklistItemsByWorkspace"]>>;
type MissingInformationRequest = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listMissingInformationRequestsByWorkspace"]>>;
type HandlerWorkQueueEntry = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listQueueEntriesByWorkspace"]>>;
type WorkspaceNote = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listNotesByWorkspace"]>>;
type IntakeDecisionRecommendation = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listRecommendationsByWorkspace"]>>;
type WorkspaceActivityEvent = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listActivityEventsByWorkspace"]>>;
type WorkspaceEvidenceReference = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listEvidenceReferencesByWorkspace"]>>;

type DashboardKpiSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listDashboardKpiSnapshots"]>>;
type DashboardWidgetSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listDashboardWidgetSnapshots"]>>;
type ProjectionJob = NonNullable<AwaitedReturn<DashboardProjectionRepository["getProjectionJobById"]>>;
type ProjectionDependencyWatermark = NonNullable<AwaitedReturn<DashboardProjectionRepository["getProjectionDependencyWatermarkById"]>>;
type DashboardViewConfig = NonNullable<AwaitedReturn<DashboardProjectionRepository["getDashboardViewConfigById"]>>;
type BenchmarkSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listBenchmarkSnapshots"]>>;

type DocumentRecord = NonNullable<AwaitedReturn<DocumentRepository["getDocumentById"]>>;
type DocumentLink = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentLinksByDocument"]>>;
type DocumentVersion = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentVersionsByDocument"]>>;
type DocumentExtractionJob = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentExtractionJobsByDocument"]>>;
type MedicalCertificateFact = NonNullable<AwaitedReturn<DocumentRepository["getMedicalCertificateFactByDocument"]>>;
type CertificateCoverageWindow = ArrayItem<AwaitedReturn<DocumentRepository["listCertificateCoverageWindowsByEpisode"]>>;
type DocumentAccessEvent = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentAccessEventsByDocument"]>>;
type DocumentConsentReference = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentConsentReferencesByDocument"]>>;

type NotificationEvent = NonNullable<AwaitedReturn<InboxNotificationRepository["getNotificationEventById"]>>;
type InboxItem = NonNullable<AwaitedReturn<InboxNotificationRepository["getInboxItemById"]>>;
type InboxItemAssignment = ArrayItem<AwaitedReturn<InboxNotificationRepository["listInboxItemAssignmentsByItem"]>>;
type NotificationPreference = NonNullable<AwaitedReturn<InboxNotificationRepository["getNotificationPreferenceById"]>>;
type NotificationTemplate = ArrayItem<AwaitedReturn<InboxNotificationRepository["listNotificationTemplates"]>>;
type NotificationDelivery = ArrayItem<AwaitedReturn<InboxNotificationRepository["listNotificationDeliveriesByItem"]>>;
type DeliverySuppression = ArrayItem<AwaitedReturn<InboxNotificationRepository["listDeliverySuppressions"]>>;

type KtgCase = NonNullable<AwaitedReturn<KtgCaseRepository["getCaseById"]>>;
type KtgCaseAbsenceLink = ArrayItem<AwaitedReturn<KtgCaseRepository["listAbsenceLinksByCase"]>>;
type KtgCaseCoverageSnapshot = NonNullable<AwaitedReturn<KtgCaseRepository["getCoverageSnapshotByCase"]>>;
type KtgCaseSubmission = ArrayItem<AwaitedReturn<KtgCaseRepository["listSubmissionsByCase"]>>;
type KtgDeadline = ArrayItem<AwaitedReturn<KtgCaseRepository["listDeadlinesByCase"]>>;
type KtgTask = ArrayItem<AwaitedReturn<KtgCaseRepository["listTasksByCase"]>>;
type KtgCaseNote = ArrayItem<AwaitedReturn<KtgCaseRepository["listNotesByCase"]>>;
type KtgCaseDecision = ArrayItem<AwaitedReturn<KtgCaseRepository["listDecisionsByCase"]>>;
type KtgCaseStatusEvent = ArrayItem<AwaitedReturn<KtgCaseRepository["listStatusEventsByCase"]>>;

const EMPLOYER_TENANT_ID = "tenant-employer-demo";
const INTERNAL_TENANT_ID = "tenant-internal-demo";
const REFERENCE_AT = "2026-04-18T09:00:00.000Z";

const employerPermissions: WorkflowPermission[] = [
  { resourceType: "dashboard", action: "read", allowed: true },
  { resourceType: "absence", action: "read", allowed: true },
  { resourceType: "ktg_case", action: "read", allowed: true },
  { resourceType: "document", action: "read", allowed: true },
  { resourceType: "task", action: "read", allowed: true },
  { resourceType: "payment_summary", action: "read", allowed: true },
];

const internalPermissions: WorkflowPermission[] = [
  { resourceType: "dashboard", action: "read_internal", allowed: true },
  { resourceType: "claims_intake_workspace", action: "read", allowed: true },
  { resourceType: "ktg_case", action: "read_internal", allowed: true },
  { resourceType: "benefit_calculation", action: "read", allowed: true },
];

const employeeDirectory: Record<string, { name: string }> = {
  "employee-0001": { name: "Anna Keller" },
  "employee-0002": { name: "Luca Meier" },
};

const employeeIdsByTenant: Record<string, string[]> = {
  [EMPLOYER_TENANT_ID]: ["employee-0001", "employee-0002"],
  [INTERNAL_TENANT_ID]: ["employee-0001", "employee-0002"],
};

const baseLinks = (locale: PortalLocale): WorkflowLink[] => [
  { label: "dashboard", href: `/${locale}` },
];

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

class AbsenceMemoryRepository implements AbsenceRepository {
  constructor(
    private readonly episodes: AbsenceEpisode[],
    private readonly contractImpacts: AbsenceContractImpact[],
    private readonly dailyRecords: AbsenceDailyRecord[],
    private readonly statusEvents: AbsenceStatusEvent[],
    private readonly comments: AbsenceComment[],
    private readonly recurrenceGroups: AbsenceRecurrenceGroup[],
  ) {}

  async withTransaction<T>(operation: (repository: AbsenceRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createEpisode(episode: AbsenceEpisode): Promise<AbsenceEpisode> {
    return append(this.episodes, episode);
  }

  async updateEpisode(episode: AbsenceEpisode): Promise<AbsenceEpisode> {
    replaceById(this.episodes, episode);
    return episode;
  }

  async getEpisodeById(tenantId: string, episodeId: string): Promise<AbsenceEpisode | null> {
    return this.episodes.find((episode) => episode.tenantId === tenantId && episode.id === episodeId) ?? null;
  }

  async listEpisodesByEmployee(tenantId: string, employeeId: string): Promise<AbsenceEpisode[]> {
    return this.episodes.filter((episode) => episode.tenantId === tenantId && episode.employeeId === employeeId);
  }

  async createContractImpact(contractImpact: AbsenceContractImpact): Promise<AbsenceContractImpact> {
    return append(this.contractImpacts, contractImpact);
  }

  async listContractImpactsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceContractImpact[]> {
    return this.contractImpacts.filter((impact) => impact.tenantId === tenantId && impact.episodeId === episodeId);
  }

  async createDailyRecord(record: AbsenceDailyRecord): Promise<AbsenceDailyRecord> {
    return append(this.dailyRecords, record);
  }

  async listDailyRecordsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceDailyRecord[]> {
    return this.dailyRecords.filter((record) => record.tenantId === tenantId && record.episodeId === episodeId);
  }

  async listDailyRecordsByEmployeeContractDate(
    tenantId: string,
    employeeId: string,
    employmentContractId: string,
    absenceDate: string,
  ): Promise<AbsenceDailyRecord[]> {
    return this.dailyRecords.filter((record) =>
      record.tenantId === tenantId &&
      record.employeeId === employeeId &&
      record.employmentContractId === employmentContractId &&
      record.absenceDate === absenceDate);
  }

  async listDailyRecordsByEmployee(tenantId: string, employeeId: string): Promise<AbsenceDailyRecord[]> {
    return this.dailyRecords.filter((record) => record.tenantId === tenantId && record.employeeId === employeeId);
  }

  async createStatusEvent(event: AbsenceStatusEvent): Promise<AbsenceStatusEvent> {
    return append(this.statusEvents, event);
  }

  async listStatusEventsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceStatusEvent[]> {
    return this.statusEvents.filter((event) => event.tenantId === tenantId && event.episodeId === episodeId);
  }

  async createComment(comment: AbsenceComment): Promise<AbsenceComment> {
    return append(this.comments, comment);
  }

  async listCommentsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceComment[]> {
    return this.comments.filter((comment) => comment.tenantId === tenantId && comment.episodeId === episodeId);
  }

  async createRecurrenceGroup(group: AbsenceRecurrenceGroup): Promise<AbsenceRecurrenceGroup> {
    return append(this.recurrenceGroups, group);
  }

  async getRecurrenceGroupById(tenantId: string, recurrenceGroupId: string): Promise<AbsenceRecurrenceGroup | null> {
    return this.recurrenceGroups.find((group) => group.tenantId === tenantId && group.id === recurrenceGroupId) ?? null;
  }
}

class KtgCaseMemoryRepository implements KtgCaseRepository {
  constructor(
    private readonly cases: KtgCase[],
    private readonly absenceLinks: KtgCaseAbsenceLink[],
    private readonly coverageSnapshots: KtgCaseCoverageSnapshot[],
    private readonly submissions: KtgCaseSubmission[],
    private readonly deadlines: KtgDeadline[],
    private readonly tasks: KtgTask[],
    private readonly notes: KtgCaseNote[],
    private readonly decisions: KtgCaseDecision[],
    private readonly statusEvents: KtgCaseStatusEvent[],
  ) {}

  async withTransaction<T>(operation: (repository: KtgCaseRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createCase(ktgCase: KtgCase): Promise<KtgCase> {
    return append(this.cases, ktgCase);
  }

  async updateCase(ktgCase: KtgCase): Promise<KtgCase> {
    replaceById(this.cases, ktgCase);
    return ktgCase;
  }

  async getCaseById(tenantId: string, caseId: string): Promise<KtgCase | null> {
    return this.cases.find((ktgCase) => ktgCase.tenantId === tenantId && ktgCase.id === caseId) ?? null;
  }

  async listCasesByEmployee(tenantId: string, employeeId: string): Promise<KtgCase[]> {
    return this.cases.filter((ktgCase) => ktgCase.tenantId === tenantId && ktgCase.employeeId === employeeId);
  }

  async createAbsenceLink(link: KtgCaseAbsenceLink): Promise<KtgCaseAbsenceLink> {
    return append(this.absenceLinks, link);
  }

  async listAbsenceLinksByCase(tenantId: string, caseId: string): Promise<KtgCaseAbsenceLink[]> {
    return this.absenceLinks.filter((link) => link.tenantId === tenantId && link.ktgCaseId === caseId);
  }

  async createCoverageSnapshot(snapshot: KtgCaseCoverageSnapshot): Promise<KtgCaseCoverageSnapshot> {
    return append(this.coverageSnapshots, snapshot);
  }

  async getCoverageSnapshotByCase(tenantId: string, caseId: string): Promise<KtgCaseCoverageSnapshot | null> {
    return this.coverageSnapshots.find((snapshot) => snapshot.tenantId === tenantId && snapshot.ktgCaseId === caseId) ?? null;
  }

  async createSubmission(submission: KtgCaseSubmission): Promise<KtgCaseSubmission> {
    return append(this.submissions, submission);
  }

  async listSubmissionsByCase(tenantId: string, caseId: string): Promise<KtgCaseSubmission[]> {
    return this.submissions.filter((submission) => submission.tenantId === tenantId && submission.ktgCaseId === caseId);
  }

  async createDeadline(deadline: KtgDeadline): Promise<KtgDeadline> {
    return append(this.deadlines, deadline);
  }

  async listDeadlinesByCase(tenantId: string, caseId: string): Promise<KtgDeadline[]> {
    return this.deadlines.filter((deadline) => deadline.tenantId === tenantId && deadline.ktgCaseId === caseId);
  }

  async createTask(task: KtgTask): Promise<KtgTask> {
    return append(this.tasks, task);
  }

  async listTasksByCase(tenantId: string, caseId: string): Promise<KtgTask[]> {
    return this.tasks.filter((task) => task.tenantId === tenantId && task.ktgCaseId === caseId);
  }

  async createNote(note: KtgCaseNote): Promise<KtgCaseNote> {
    return append(this.notes, note);
  }

  async listNotesByCase(tenantId: string, caseId: string): Promise<KtgCaseNote[]> {
    return this.notes.filter((note) => note.tenantId === tenantId && note.ktgCaseId === caseId);
  }

  async createDecision(decision: KtgCaseDecision): Promise<KtgCaseDecision> {
    return append(this.decisions, decision);
  }

  async listDecisionsByCase(tenantId: string, caseId: string): Promise<KtgCaseDecision[]> {
    return this.decisions.filter((decision) => decision.tenantId === tenantId && decision.ktgCaseId === caseId);
  }

  async createStatusEvent(event: KtgCaseStatusEvent): Promise<KtgCaseStatusEvent> {
    return append(this.statusEvents, event);
  }

  async listStatusEventsByCase(tenantId: string, caseId: string): Promise<KtgCaseStatusEvent[]> {
    return this.statusEvents.filter((event) => event.tenantId === tenantId && event.ktgCaseId === caseId);
  }
}

class DocumentMemoryRepository implements DocumentRepository {
  constructor(
    private readonly documents: DocumentRecord[],
    private readonly links: DocumentLink[],
    private readonly versions: DocumentVersion[],
    private readonly extractionJobs: DocumentExtractionJob[],
    private readonly certificateFacts: MedicalCertificateFact[],
    private readonly coverageWindows: CertificateCoverageWindow[],
    private readonly accessEvents: DocumentAccessEvent[],
    private readonly consentReferences: DocumentConsentReference[],
  ) {}

  async withTransaction<T>(operation: (repository: DocumentRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createDocument(document: DocumentRecord): Promise<DocumentRecord> {
    return append(this.documents, document);
  }

  async updateDocument(document: DocumentRecord): Promise<DocumentRecord> {
    replaceById(this.documents, document);
    return document;
  }

  async getDocumentById(tenantId: string, documentId: string): Promise<DocumentRecord | null> {
    return this.documents.find((document) => document.tenantId === tenantId && document.id === documentId) ?? null;
  }

  async listDocuments(tenantId: string, filters?: {
    employeeId?: string;
    documentType?: DocumentRecord["documentType"];
    status?: DocumentRecord["status"];
  }): Promise<DocumentRecord[]> {
    return this.documents.filter((document) =>
      document.tenantId === tenantId &&
      (!filters?.employeeId || document.employeeId === filters.employeeId) &&
      (!filters?.documentType || document.documentType === filters.documentType) &&
      (!filters?.status || document.status === filters.status));
  }

  async createDocumentLink(link: DocumentLink): Promise<DocumentLink> {
    return append(this.links, link);
  }

  async listDocumentLinksByDocument(tenantId: string, documentId: string): Promise<DocumentLink[]> {
    return this.links.filter((link) => link.tenantId === tenantId && link.documentId === documentId);
  }

  async createDocumentVersion(version: DocumentVersion): Promise<DocumentVersion> {
    return append(this.versions, version);
  }

  async listDocumentVersionsByDocument(tenantId: string, documentId: string): Promise<DocumentVersion[]> {
    return this.versions.filter((version) => version.tenantId === tenantId && version.documentId === documentId);
  }

  async createDocumentExtractionJob(job: DocumentExtractionJob): Promise<DocumentExtractionJob> {
    return append(this.extractionJobs, job);
  }

  async updateDocumentExtractionJob(job: DocumentExtractionJob): Promise<DocumentExtractionJob> {
    replaceById(this.extractionJobs, job);
    return job;
  }

  async getDocumentExtractionJobById(tenantId: string, jobId: string): Promise<DocumentExtractionJob | null> {
    return this.extractionJobs.find((job) => job.tenantId === tenantId && job.id === jobId) ?? null;
  }

  async listDocumentExtractionJobsByDocument(tenantId: string, documentId: string): Promise<DocumentExtractionJob[]> {
    return this.extractionJobs.filter((job) => job.tenantId === tenantId && job.documentId === documentId);
  }

  async createMedicalCertificateFact(fact: MedicalCertificateFact): Promise<MedicalCertificateFact> {
    return append(this.certificateFacts, fact);
  }

  async updateMedicalCertificateFact(fact: MedicalCertificateFact): Promise<MedicalCertificateFact> {
    replaceById(this.certificateFacts, fact);
    return fact;
  }

  async getMedicalCertificateFactByDocument(tenantId: string, documentId: string): Promise<MedicalCertificateFact | null> {
    return this.certificateFacts.find((fact) => fact.tenantId === tenantId && fact.documentId === documentId) ?? null;
  }

  async createCertificateCoverageWindow(window: CertificateCoverageWindow): Promise<CertificateCoverageWindow> {
    return append(this.coverageWindows, window);
  }

  async updateCertificateCoverageWindow(window: CertificateCoverageWindow): Promise<CertificateCoverageWindow> {
    replaceById(this.coverageWindows, window);
    return window;
  }

  async getCertificateCoverageWindowByFact(
    tenantId: string,
    medicalCertificateFactId: string,
  ): Promise<CertificateCoverageWindow | null> {
    return this.coverageWindows.find((window) =>
      window.tenantId === tenantId && window.medicalCertificateFactId === medicalCertificateFactId) ?? null;
  }

  async listCertificateCoverageWindowsByEpisode(tenantId: string, absenceEpisodeId: string): Promise<CertificateCoverageWindow[]> {
    return this.coverageWindows.filter((window) => window.tenantId === tenantId && window.absenceEpisodeId === absenceEpisodeId);
  }

  async createDocumentAccessEvent(event: DocumentAccessEvent): Promise<DocumentAccessEvent> {
    return append(this.accessEvents, event);
  }

  async listDocumentAccessEventsByDocument(tenantId: string, documentId: string): Promise<DocumentAccessEvent[]> {
    return this.accessEvents.filter((event) => event.tenantId === tenantId && event.documentId === documentId);
  }

  async createDocumentConsentReference(reference: DocumentConsentReference): Promise<DocumentConsentReference> {
    return append(this.consentReferences, reference);
  }

  async listDocumentConsentReferencesByDocument(tenantId: string, documentId: string): Promise<DocumentConsentReference[]> {
    return this.consentReferences.filter((reference) => reference.tenantId === tenantId && reference.documentId === documentId);
  }
}

class ClaimsIntakeWorkspaceMemoryRepository implements ClaimsIntakeWorkspaceRepository {
  constructor(
    private readonly workspaces: IntakeCaseWorkspace[],
    private readonly checklistItems: IntakeChecklistItem[],
    private readonly missingInformationRequests: MissingInformationRequest[],
    private readonly queueEntries: HandlerWorkQueueEntry[],
    private readonly notes: WorkspaceNote[],
    private readonly recommendations: IntakeDecisionRecommendation[],
    private readonly activityEvents: WorkspaceActivityEvent[],
    private readonly evidenceReferences: WorkspaceEvidenceReference[],
  ) {}

  async withTransaction<T>(operation: (repository: ClaimsIntakeWorkspaceRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createWorkspace(workspace: IntakeCaseWorkspace): Promise<IntakeCaseWorkspace> {
    return append(this.workspaces, workspace);
  }

  async updateWorkspace(workspace: IntakeCaseWorkspace): Promise<IntakeCaseWorkspace> {
    replaceById(this.workspaces, workspace);
    return workspace;
  }

  async getWorkspaceById(tenantId: string, workspaceId: string): Promise<IntakeCaseWorkspace | null> {
    return this.workspaces.find((workspace) => workspace.tenantId === tenantId && workspace.id === workspaceId) ?? null;
  }

  async listWorkspaces(tenantId: string, filters?: {
    workspaceStatus?: IntakeCaseWorkspace["workspaceStatus"];
    assignedHandlerId?: string;
    assignedTeam?: string;
    ktgCaseId?: string;
  }): Promise<IntakeCaseWorkspace[]> {
    return this.workspaces.filter((workspace) =>
      workspace.tenantId === tenantId &&
      (!filters?.workspaceStatus || workspace.workspaceStatus === filters.workspaceStatus) &&
      (!filters?.assignedHandlerId || workspace.assignedHandlerId === filters.assignedHandlerId) &&
      (!filters?.assignedTeam || workspace.assignedTeam === filters.assignedTeam) &&
      (!filters?.ktgCaseId || workspace.ktgCaseId === filters.ktgCaseId));
  }

  async createChecklistItem(item: IntakeChecklistItem): Promise<IntakeChecklistItem> {
    return append(this.checklistItems, item);
  }

  async updateChecklistItem(item: IntakeChecklistItem): Promise<IntakeChecklistItem> {
    replaceById(this.checklistItems, item);
    return item;
  }

  async getChecklistItemById(tenantId: string, workspaceId: string, itemId: string): Promise<IntakeChecklistItem | null> {
    return this.checklistItems.find((item) => item.tenantId === tenantId && item.workspaceId === workspaceId && item.id === itemId) ?? null;
  }

  async listChecklistItemsByWorkspace(tenantId: string, workspaceId: string): Promise<IntakeChecklistItem[]> {
    return this.checklistItems.filter((item) => item.tenantId === tenantId && item.workspaceId === workspaceId);
  }

  async createMissingInformationRequest(request: MissingInformationRequest): Promise<MissingInformationRequest> {
    return append(this.missingInformationRequests, request);
  }

  async updateMissingInformationRequest(request: MissingInformationRequest): Promise<MissingInformationRequest> {
    replaceById(this.missingInformationRequests, request);
    return request;
  }

  async getMissingInformationRequestById(
    tenantId: string,
    workspaceId: string,
    requestId: string,
  ): Promise<MissingInformationRequest | null> {
    return this.missingInformationRequests.find((request) =>
      request.tenantId === tenantId && request.workspaceId === workspaceId && request.id === requestId) ?? null;
  }

  async listMissingInformationRequestsByWorkspace(tenantId: string, workspaceId: string): Promise<MissingInformationRequest[]> {
    return this.missingInformationRequests.filter((request) => request.tenantId === tenantId && request.workspaceId === workspaceId);
  }

  async createQueueEntry(entry: HandlerWorkQueueEntry): Promise<HandlerWorkQueueEntry> {
    return append(this.queueEntries, entry);
  }

  async updateQueueEntry(entry: HandlerWorkQueueEntry): Promise<HandlerWorkQueueEntry> {
    replaceById(this.queueEntries, entry);
    return entry;
  }

  async getQueueEntryById(tenantId: string, workspaceId: string, entryId: string): Promise<HandlerWorkQueueEntry | null> {
    return this.queueEntries.find((entry) => entry.tenantId === tenantId && entry.workspaceId === workspaceId && entry.id === entryId) ?? null;
  }

  async listQueueEntriesByWorkspace(tenantId: string, workspaceId: string): Promise<HandlerWorkQueueEntry[]> {
    return this.queueEntries.filter((entry) => entry.tenantId === tenantId && entry.workspaceId === workspaceId);
  }

  async createNote(note: WorkspaceNote): Promise<WorkspaceNote> {
    return append(this.notes, note);
  }

  async listNotesByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceNote[]> {
    return this.notes.filter((note) => note.tenantId === tenantId && note.workspaceId === workspaceId);
  }

  async createRecommendation(recommendation: IntakeDecisionRecommendation): Promise<IntakeDecisionRecommendation> {
    return append(this.recommendations, recommendation);
  }

  async listRecommendationsByWorkspace(tenantId: string, workspaceId: string): Promise<IntakeDecisionRecommendation[]> {
    return this.recommendations.filter((recommendation) => recommendation.tenantId === tenantId && recommendation.workspaceId === workspaceId);
  }

  async createActivityEvent(event: WorkspaceActivityEvent): Promise<WorkspaceActivityEvent> {
    return append(this.activityEvents, event);
  }

  async listActivityEventsByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceActivityEvent[]> {
    return this.activityEvents.filter((event) => event.tenantId === tenantId && event.workspaceId === workspaceId);
  }

  async createEvidenceReference(reference: WorkspaceEvidenceReference): Promise<WorkspaceEvidenceReference> {
    return append(this.evidenceReferences, reference);
  }

  async listEvidenceReferencesByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceEvidenceReference[]> {
    return this.evidenceReferences.filter((reference) => reference.tenantId === tenantId && reference.workspaceId === workspaceId);
  }
}

class BenefitEngineMemoryRepository implements BenefitEngineRepository {
  constructor(
    private readonly calculations: BenefitCaseCalculation[],
    private readonly salarySnapshots: InsuredSalarySnapshot[],
    private readonly coordinationWindows: CoordinationWindow[],
    private readonly entitlementPeriods: BenefitEntitlementPeriod[],
    private readonly dayBreakdowns: BenefitDayBreakdown[],
    private readonly adjustments: BenefitAdjustment[],
    private readonly paymentInstructions: PaymentInstruction[],
    private readonly taggelddispositive: TaggelddispositivSnapshot[],
    private readonly auditEvents: CalculationAuditEvent[],
  ) {}

  async withTransaction<T>(operation: (repository: BenefitEngineRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createCalculation(calculation: BenefitCaseCalculation): Promise<BenefitCaseCalculation> {
    return append(this.calculations, calculation);
  }

  async updateCalculation(calculation: BenefitCaseCalculation): Promise<BenefitCaseCalculation> {
    replaceById(this.calculations, calculation);
    return calculation;
  }

  async getCalculationById(tenantId: string, calculationId: string): Promise<BenefitCaseCalculation | null> {
    return this.calculations.find((calculation) => calculation.tenantId === tenantId && calculation.id === calculationId) ?? null;
  }

  async listCalculations(tenantId: string, filters?: {
    ktgCaseId?: string;
    calculationStatus?: BenefitCaseCalculation["calculationStatus"];
  }): Promise<BenefitCaseCalculation[]> {
    return this.calculations.filter((calculation) =>
      calculation.tenantId === tenantId &&
      (!filters?.ktgCaseId || calculation.ktgCaseId === filters.ktgCaseId) &&
      (!filters?.calculationStatus || calculation.calculationStatus === filters.calculationStatus));
  }

  async findLatestCalculationByCase(tenantId: string, ktgCaseId: string): Promise<BenefitCaseCalculation | null> {
    return this.calculations
      .filter((calculation) => calculation.tenantId === tenantId && calculation.ktgCaseId === ktgCaseId)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0] ?? null;
  }

  async createInsuredSalarySnapshot(snapshot: InsuredSalarySnapshot): Promise<InsuredSalarySnapshot> {
    return append(this.salarySnapshots, snapshot);
  }

  async getInsuredSalarySnapshotByCalculation(tenantId: string, calculationId: string): Promise<InsuredSalarySnapshot | null> {
    return this.salarySnapshots.find((snapshot) =>
      snapshot.tenantId === tenantId && snapshot.benefitCaseCalculationId === calculationId) ?? null;
  }

  async createCoordinationWindow(window: CoordinationWindow): Promise<CoordinationWindow> {
    return append(this.coordinationWindows, window);
  }

  async listCoordinationWindowsByCalculation(tenantId: string, calculationId: string): Promise<CoordinationWindow[]> {
    return this.coordinationWindows.filter((window) => window.tenantId === tenantId && window.benefitCaseCalculationId === calculationId);
  }

  async createEntitlementPeriod(period: BenefitEntitlementPeriod): Promise<BenefitEntitlementPeriod> {
    return append(this.entitlementPeriods, period);
  }

  async listEntitlementPeriodsByCalculation(tenantId: string, calculationId: string): Promise<BenefitEntitlementPeriod[]> {
    return this.entitlementPeriods.filter((period) => period.tenantId === tenantId && period.benefitCaseCalculationId === calculationId);
  }

  async createDayBreakdown(day: BenefitDayBreakdown): Promise<BenefitDayBreakdown> {
    return append(this.dayBreakdowns, day);
  }

  async listDayBreakdownsByCalculation(tenantId: string, calculationId: string): Promise<BenefitDayBreakdown[]> {
    const periodIds = new Set(
      this.entitlementPeriods
        .filter((period) => period.tenantId === tenantId && period.benefitCaseCalculationId === calculationId)
        .map((period) => period.id),
    );
    return this.dayBreakdowns.filter((day) => day.tenantId === tenantId && periodIds.has(day.benefitEntitlementPeriodId));
  }

  async listDayBreakdownsByPeriod(tenantId: string, periodId: string): Promise<BenefitDayBreakdown[]> {
    return this.dayBreakdowns.filter((day) => day.tenantId === tenantId && day.benefitEntitlementPeriodId === periodId);
  }

  async getEntitlementPeriodById(tenantId: string, periodId: string): Promise<BenefitEntitlementPeriod | null> {
    return this.entitlementPeriods.find((period) => period.tenantId === tenantId && period.id === periodId) ?? null;
  }

  async createAdjustment(adjustment: BenefitAdjustment): Promise<BenefitAdjustment> {
    return append(this.adjustments, adjustment);
  }

  async listAdjustmentsByCalculation(tenantId: string, calculationId: string): Promise<BenefitAdjustment[]> {
    return this.adjustments.filter((adjustment) => adjustment.tenantId === tenantId && adjustment.benefitCaseCalculationId === calculationId);
  }

  async createPaymentInstruction(paymentInstruction: PaymentInstruction): Promise<PaymentInstruction> {
    return append(this.paymentInstructions, paymentInstruction);
  }

  async listPaymentInstructionsByCalculation(tenantId: string, calculationId: string): Promise<PaymentInstruction[]> {
    return this.paymentInstructions.filter((instruction) =>
      instruction.tenantId === tenantId && instruction.benefitCaseCalculationId === calculationId);
  }

  async getPaymentInstructionById(tenantId: string, paymentInstructionId: string): Promise<PaymentInstruction | null> {
    return this.paymentInstructions.find((instruction) =>
      instruction.tenantId === tenantId && instruction.id === paymentInstructionId) ?? null;
  }

  async createTaggelddispositiv(snapshot: TaggelddispositivSnapshot): Promise<TaggelddispositivSnapshot> {
    return append(this.taggelddispositive, snapshot);
  }

  async listTaggelddispositiveByCalculation(tenantId: string, calculationId: string): Promise<TaggelddispositivSnapshot[]> {
    const instructionIds = new Set(
      this.paymentInstructions
        .filter((instruction) => instruction.tenantId === tenantId && instruction.benefitCaseCalculationId === calculationId)
        .map((instruction) => instruction.id),
    );
    return this.taggelddispositive.filter((snapshot) =>
      snapshot.tenantId === tenantId && instructionIds.has(snapshot.paymentInstructionId));
  }

  async createAuditEvent(event: CalculationAuditEvent): Promise<CalculationAuditEvent> {
    return append(this.auditEvents, event);
  }

  async listAuditEventsByCalculation(tenantId: string, calculationId: string): Promise<CalculationAuditEvent[]> {
    return this.auditEvents.filter((event) => event.tenantId === tenantId && event.benefitCaseCalculationId === calculationId);
  }
}

class DashboardProjectionMemoryRepository implements DashboardProjectionRepository {
  constructor(
    private readonly kpiSnapshots: DashboardKpiSnapshot[],
    private readonly widgetSnapshots: DashboardWidgetSnapshot[],
    private readonly projectionJobs: ProjectionJob[],
    private readonly watermarks: ProjectionDependencyWatermark[],
    private readonly viewConfigs: DashboardViewConfig[],
    private readonly benchmarkSnapshots: BenchmarkSnapshot[],
  ) {}

  async withTransaction<T>(operation: (repository: DashboardProjectionRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createDashboardKpiSnapshot(snapshot: DashboardKpiSnapshot): Promise<DashboardKpiSnapshot> {
    return append(this.kpiSnapshots, snapshot);
  }

  async listDashboardKpiSnapshots(tenantId: string, filters?: {
    dashboardRole?: DashboardKpiSnapshot["dashboardRole"];
    kpiKey?: string;
  }): Promise<DashboardKpiSnapshot[]> {
    return this.kpiSnapshots.filter((snapshot) =>
      snapshot.tenantId === tenantId &&
      (!filters?.dashboardRole || snapshot.dashboardRole === filters.dashboardRole) &&
      (!filters?.kpiKey || snapshot.kpiKey === filters.kpiKey));
  }

  async createDashboardWidgetSnapshot(snapshot: DashboardWidgetSnapshot): Promise<DashboardWidgetSnapshot> {
    return append(this.widgetSnapshots, snapshot);
  }

  async listDashboardWidgetSnapshots(tenantId: string, filters?: {
    dashboardRole?: DashboardWidgetSnapshot["dashboardRole"];
    widgetKey?: string;
  }): Promise<DashboardWidgetSnapshot[]> {
    return this.widgetSnapshots.filter((snapshot) =>
      snapshot.tenantId === tenantId &&
      (!filters?.dashboardRole || snapshot.dashboardRole === filters.dashboardRole) &&
      (!filters?.widgetKey || snapshot.widgetKey === filters.widgetKey));
  }

  async createProjectionJob(job: ProjectionJob): Promise<ProjectionJob> {
    return append(this.projectionJobs, job);
  }

  async updateProjectionJob(job: ProjectionJob): Promise<ProjectionJob> {
    replaceById(this.projectionJobs, job);
    return job;
  }

  async getProjectionJobById(tenantId: string, jobId: string): Promise<ProjectionJob | null> {
    return this.projectionJobs.find((job) => job.tenantId === tenantId && job.id === jobId) ?? null;
  }

  async listProjectionJobs(tenantId: string, filters?: {
    projectionType?: ProjectionJob["projectionType"];
    jobStatus?: ProjectionJob["jobStatus"];
  }): Promise<ProjectionJob[]> {
    return this.projectionJobs.filter((job) =>
      job.tenantId === tenantId &&
      (!filters?.projectionType || job.projectionType === filters.projectionType) &&
      (!filters?.jobStatus || job.jobStatus === filters.jobStatus));
  }

  async createProjectionDependencyWatermark(watermark: ProjectionDependencyWatermark): Promise<ProjectionDependencyWatermark> {
    return append(this.watermarks, watermark);
  }

  async updateProjectionDependencyWatermark(watermark: ProjectionDependencyWatermark): Promise<ProjectionDependencyWatermark> {
    replaceById(this.watermarks, watermark);
    return watermark;
  }

  async getProjectionDependencyWatermarkById(tenantId: string, watermarkId: string): Promise<ProjectionDependencyWatermark | null> {
    return this.watermarks.find((watermark) => watermark.tenantId === tenantId && watermark.id === watermarkId) ?? null;
  }

  async findProjectionDependencyWatermark(tenantId: string, params: {
    sourceService: ProjectionDependencyWatermark["sourceService"];
    sourceStream: string;
  }): Promise<ProjectionDependencyWatermark | null> {
    return this.watermarks.find((watermark) =>
      watermark.tenantId === tenantId &&
      watermark.sourceService === params.sourceService &&
      watermark.sourceStream === params.sourceStream) ?? null;
  }

  async listProjectionDependencyWatermarks(tenantId: string): Promise<ProjectionDependencyWatermark[]> {
    return this.watermarks.filter((watermark) => watermark.tenantId === tenantId);
  }

  async createDashboardViewConfig(config: DashboardViewConfig): Promise<DashboardViewConfig> {
    return append(this.viewConfigs, config);
  }

  async updateDashboardViewConfig(config: DashboardViewConfig): Promise<DashboardViewConfig> {
    replaceById(this.viewConfigs, config);
    return config;
  }

  async getDashboardViewConfigById(tenantId: string, configId: string): Promise<DashboardViewConfig | null> {
    return this.viewConfigs.find((config) => config.tenantId === tenantId && config.id === configId) ?? null;
  }

  async listDashboardViewConfigs(tenantId: string, filters?: {
    dashboardRole?: DashboardViewConfig["dashboardRole"];
  }): Promise<DashboardViewConfig[]> {
    return this.viewConfigs.filter((config) =>
      config.tenantId === tenantId &&
      (!filters?.dashboardRole || config.dashboardRole === filters.dashboardRole));
  }

  async createBenchmarkSnapshot(snapshot: BenchmarkSnapshot): Promise<BenchmarkSnapshot> {
    return append(this.benchmarkSnapshots, snapshot);
  }

  async listBenchmarkSnapshots(filters?: {
    benchmarkScope?: BenchmarkSnapshot["benchmarkScope"];
    metricKey?: string;
  }): Promise<BenchmarkSnapshot[]> {
    return this.benchmarkSnapshots.filter((snapshot) =>
      (!filters?.benchmarkScope || snapshot.benchmarkScope === filters.benchmarkScope) &&
      (!filters?.metricKey || snapshot.metricKey === filters.metricKey));
  }
}

class InboxNotificationMemoryRepository implements InboxNotificationRepository {
  constructor(
    private readonly notificationEvents: NotificationEvent[],
    private readonly inboxItems: InboxItem[],
    private readonly assignments: InboxItemAssignment[],
    private readonly preferences: NotificationPreference[],
    private readonly templates: NotificationTemplate[],
    private readonly deliveries: NotificationDelivery[],
    private readonly suppressions: DeliverySuppression[],
  ) {}

  async withTransaction<T>(operation: (repository: InboxNotificationRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createNotificationEvent(event: NotificationEvent): Promise<NotificationEvent> {
    return append(this.notificationEvents, event);
  }

  async getNotificationEventById(tenantId: string, eventId: string): Promise<NotificationEvent | null> {
    return this.notificationEvents.find((event) => event.tenantId === tenantId && event.id === eventId) ?? null;
  }

  async createInboxItem(item: InboxItem): Promise<InboxItem> {
    return append(this.inboxItems, item);
  }

  async updateInboxItem(item: InboxItem): Promise<InboxItem> {
    replaceById(this.inboxItems, item);
    return item;
  }

  async getInboxItemById(tenantId: string, inboxItemId: string): Promise<InboxItem | null> {
    return this.inboxItems.find((item) => item.tenantId === tenantId && item.id === inboxItemId) ?? null;
  }

  async listInboxItems(tenantId: string, filters?: {
    audienceUserId?: string;
    audienceRole?: string;
    status?: InboxItem["status"];
  }): Promise<InboxItem[]> {
    return this.inboxItems.filter((item) =>
      item.tenantId === tenantId &&
      (!filters?.audienceUserId || item.audienceUserId === filters.audienceUserId) &&
      (!filters?.audienceRole || item.audienceRole === filters.audienceRole) &&
      (!filters?.status || item.status === filters.status));
  }

  async createInboxItemAssignment(assignment: InboxItemAssignment): Promise<InboxItemAssignment> {
    return append(this.assignments, assignment);
  }

  async listInboxItemAssignmentsByItem(tenantId: string, inboxItemId: string): Promise<InboxItemAssignment[]> {
    return this.assignments.filter((assignment) => assignment.tenantId === tenantId && assignment.inboxItemId === inboxItemId);
  }

  async createNotificationPreference(preference: NotificationPreference): Promise<NotificationPreference> {
    return append(this.preferences, preference);
  }

  async updateNotificationPreference(preference: NotificationPreference): Promise<NotificationPreference> {
    replaceById(this.preferences, preference);
    return preference;
  }

  async getNotificationPreferenceById(tenantId: string, preferenceId: string): Promise<NotificationPreference | null> {
    return this.preferences.find((preference) => preference.tenantId === tenantId && preference.id === preferenceId) ?? null;
  }

  async findNotificationPreference(tenantId: string, params: {
    userId: string;
    notificationType: NotificationPreference["notificationType"];
    channel: NotificationPreference["channel"];
  }): Promise<NotificationPreference | null> {
    return this.preferences.find((preference) =>
      preference.tenantId === tenantId &&
      preference.userId === params.userId &&
      preference.notificationType === params.notificationType &&
      preference.channel === params.channel) ?? null;
  }

  async listNotificationPreferences(tenantId: string, filters?: {
    userId?: string;
    notificationType?: NotificationPreference["notificationType"];
  }): Promise<NotificationPreference[]> {
    return this.preferences.filter((preference) =>
      preference.tenantId === tenantId &&
      (!filters?.userId || preference.userId === filters.userId) &&
      (!filters?.notificationType || preference.notificationType === filters.notificationType));
  }

  async createNotificationTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    return append(this.templates, template);
  }

  async findNotificationTemplate(tenantId: string, params: {
    notificationType: NotificationTemplate["notificationType"];
    channel: NotificationTemplate["channel"];
    language: string;
  }): Promise<NotificationTemplate | null> {
    return this.templates.find((template) =>
      (template.tenantId === undefined || template.tenantId === tenantId) &&
      template.notificationType === params.notificationType &&
      template.channel === params.channel &&
      template.language === params.language) ?? null;
  }

  async listNotificationTemplates(tenantId: string, filters?: {
    notificationType?: NotificationTemplate["notificationType"];
    channel?: NotificationTemplate["channel"];
  }): Promise<NotificationTemplate[]> {
    return this.templates.filter((template) =>
      (template.tenantId === undefined || template.tenantId === tenantId) &&
      (!filters?.notificationType || template.notificationType === filters.notificationType) &&
      (!filters?.channel || template.channel === filters.channel));
  }

  async createNotificationDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery> {
    return append(this.deliveries, delivery);
  }

  async updateNotificationDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery> {
    replaceById(this.deliveries, delivery);
    return delivery;
  }

  async getNotificationDeliveryById(tenantId: string, deliveryId: string): Promise<NotificationDelivery | null> {
    return this.deliveries.find((delivery) => delivery.tenantId === tenantId && delivery.id === deliveryId) ?? null;
  }

  async listNotificationDeliveriesByItem(tenantId: string, inboxItemId: string): Promise<NotificationDelivery[]> {
    return this.deliveries.filter((delivery) => delivery.tenantId === tenantId && delivery.inboxItemId === inboxItemId);
  }

  async listNotificationDeliveriesByEvent(tenantId: string, eventId: string): Promise<NotificationDelivery[]> {
    return this.deliveries.filter((delivery) => delivery.tenantId === tenantId && delivery.notificationEventId === eventId);
  }

  async createDeliverySuppression(suppression: DeliverySuppression): Promise<DeliverySuppression> {
    return append(this.suppressions, suppression);
  }

  async listDeliverySuppressions(tenantId: string, filters?: {
    recipientUserId?: string;
    notificationEventId?: string;
  }): Promise<DeliverySuppression[]> {
    return this.suppressions.filter((suppression) =>
      suppression.tenantId === tenantId &&
      (!filters?.recipientUserId || suppression.recipientUserId === filters.recipientUserId) &&
      (!filters?.notificationEventId || suppression.notificationEventId === filters.notificationEventId));
  }
}

const absenceEpisodes: AbsenceEpisode[] = [
  {
    id: "episode-1001",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0001",
    primaryAbsenceType: "ktg_sickness",
    source: "hr_portal",
    reportedAt: "2026-04-02T08:30:00.000Z",
    reportedByUserId: "user-hr-01",
    reportedByRole: "hr_manager",
    startDate: "2026-04-02",
    firstDayOfIncapacity: "2026-04-02",
    expectedEndDate: "2026-04-18",
    status: "in_progress",
    reasonCategory: "illness",
    lineManagerAckRequired: false,
  },
  {
    id: "episode-1002",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0002",
    primaryAbsenceType: "ktg_sickness",
    source: "hr_portal",
    reportedAt: "2026-04-10T11:00:00.000Z",
    reportedByUserId: "user-hr-01",
    reportedByRole: "hr_manager",
    startDate: "2026-04-10",
    expectedEndDate: "2026-04-14",
    actualEndDate: "2026-04-14",
    status: "acknowledged",
    reasonCategory: "illness",
    lineManagerAckRequired: false,
  },
];

const absenceContractImpacts: AbsenceContractImpact[] = [
  {
    id: "impact-1101",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    employmentContractId: "contract-anna",
    affectedEmploymentPercentage: 100,
    employmentPercentageSnapshot: 100,
    workingTimeModel: "fixed_schedule",
    scheduledHoursPerWeekSnapshot: 42,
  },
  {
    id: "impact-1102",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    employmentContractId: "contract-luca",
    affectedEmploymentPercentage: 50,
    employmentPercentageSnapshot: 100,
    workingTimeModel: "fixed_schedule",
    scheduledHoursPerWeekSnapshot: 40,
  },
];

const absenceDailyRecords: AbsenceDailyRecord[] = [
  {
    id: "day-1201",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    contractImpactId: "impact-1101",
    employeeId: "employee-0001",
    employmentContractId: "contract-anna",
    absenceDate: "2026-04-02",
    incapacityPercentage: 100,
    partialDayPercentage: 100,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 480,
    certifiedFlag: true,
    certificateReferenceId: "certificate-3001",
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
  {
    id: "day-1202",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    contractImpactId: "impact-1101",
    employeeId: "employee-0001",
    employmentContractId: "contract-anna",
    absenceDate: "2026-04-03",
    incapacityPercentage: 100,
    partialDayPercentage: 100,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 480,
    certifiedFlag: true,
    certificateReferenceId: "certificate-3001",
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
  {
    id: "day-1203",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    contractImpactId: "impact-1102",
    employeeId: "employee-0002",
    employmentContractId: "contract-luca",
    absenceDate: "2026-04-10",
    incapacityPercentage: 50,
    partialDayPercentage: 50,
    scheduledWorkMinutes: 480,
    lostWorkMinutes: 240,
    certifiedFlag: false,
    returnToWorkFlag: false,
    coordinatedOverlapFlag: false,
  },
];

const absenceStatusEvents: AbsenceStatusEvent[] = [
  {
    id: "absence-status-1",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    toStatus: "reported",
    eventType: "reported",
    eventAt: "2026-04-02T08:30:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-2",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    fromStatus: "reported",
    toStatus: "in_progress",
    eventType: "started",
    eventAt: "2026-04-03T09:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-3",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    toStatus: "reported",
    eventType: "reported",
    eventAt: "2026-04-10T11:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "absence-status-4",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1002",
    fromStatus: "reported",
    toStatus: "acknowledged",
    eventType: "acknowledged",
    eventAt: "2026-04-10T13:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
];

const absenceComments: AbsenceComment[] = [
  {
    id: "absence-comment-1",
    tenantId: EMPLOYER_TENANT_ID,
    episodeId: "episode-1001",
    authorId: "user-hr-01",
    authorRole: "hr_manager",
    visibility: "manager_visible",
    message: "Medical certificate uploaded and case handoff prepared.",
    createdAt: "2026-04-03T09:15:00.000Z",
  },
];

const absenceRecurrenceGroups: AbsenceRecurrenceGroup[] = [];

const ktgCases: KtgCase[] = [
  {
    id: "case-2001",
    tenantId: EMPLOYER_TENANT_ID,
    caseNumber: "KTG-2026-001",
    employeeId: "employee-0001",
    policyId: "policy-001",
    status: "in_review",
    submissionReadinessStatus: "ready",
    benefitStartDate: "2026-04-05",
    claimsSystemCaseId: "CLM-2001",
  },
];

const ktgAbsenceLinks: KtgCaseAbsenceLink[] = [
  {
    id: "case-link-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    absenceEpisodeId: "episode-1001",
    isOriginatingEpisode: true,
    linkedAt: "2026-04-03T10:00:00.000Z",
  },
];

const ktgCoverageSnapshots: KtgCaseCoverageSnapshot[] = [
  {
    id: "coverage-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    policyId: "policy-001",
    coveragePercentage: 80,
    wartezeitDays: 2,
    leistungsdauerDays: 730,
    lohnfortzahlungDays: 0,
    salaryFormulaVersion: "v1",
    insuredSalarySnapshotId: "salary-1",
    insuredSalaryAmountChf: 92000,
    insuredSalaryFormula: "annual_base_salary",
    insuredSalaryInputs: { annualBaseSalaryChf: 92000 },
    firstDayOfIncapacity: "2026-04-02",
    capturedAt: "2026-04-04T09:00:00.000Z",
  },
];

const ktgSubmissions: KtgCaseSubmission[] = [
  {
    id: "submission-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    submittedAt: "2026-04-04T12:00:00.000Z",
    submittedBy: "user-hr-01",
    validationResult: "valid",
    externalClaimsSystemId: "EXT-2001",
    correspondenceChannel: "portal",
    payloadSnapshot: { episodeId: "episode-1001" },
  },
];

const ktgDeadlines: KtgDeadline[] = [
  {
    id: "deadline-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineType: "certificate_renewal",
    dueAt: "2026-04-22T00:00:00.000Z",
    countingMethod: "calendar_days",
    responsibleRole: "hr_manager",
    escalationStatus: "not_escalated",
  },
  {
    id: "deadline-2",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineType: "claims_reply",
    dueAt: "2026-04-24T00:00:00.000Z",
    countingMethod: "calendar_days",
    responsibleRole: "claims_handler",
    escalationStatus: "not_escalated",
  },
];

const ktgTasks: KtgTask[] = [
  {
    id: "ktg-task-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    deadlineId: "deadline-1",
    taskType: "request_certificate",
    status: "open",
    priority: "high",
    dueAt: "2026-04-22T00:00:00.000Z",
    description: "Confirm follow-up certificate for ongoing incapacity.",
  },
];

const ktgNotes: KtgCaseNote[] = [
  {
    id: "ktg-note-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    authorId: "claims-handler-1",
    authorRole: "claims_handler",
    visibility: "shared_hr_claims",
    message: "Coverage confirmed, waiting for follow-up certificate.",
    createdAt: "2026-04-18T08:45:00.000Z",
  },
];

const ktgDecisions: KtgCaseDecision[] = [
  {
    id: "decision-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    decisionStatus: "accepted",
    reasonCode: "preliminary_acceptance",
    reasonText: "Preliminary eligibility confirmed.",
    effectiveFrom: "2026-04-05",
    decisionAt: "2026-04-18T08:30:00.000Z",
    dailyAllowanceAmountChf: 246.71,
  },
];

const ktgStatusEvents: KtgCaseStatusEvent[] = [
  {
    id: "case-status-1",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    toStatus: "draft",
    eventType: "drafted",
    eventAt: "2026-04-03T10:00:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
  {
    id: "case-status-2",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    fromStatus: "draft",
    toStatus: "submitted",
    eventType: "submitted",
    eventAt: "2026-04-04T12:00:00.000Z",
    actorId: "user-hr-01",
    actorRole: "hr_manager",
  },
  {
    id: "case-status-3",
    tenantId: EMPLOYER_TENANT_ID,
    ktgCaseId: "case-2001",
    fromStatus: "submitted",
    toStatus: "in_review",
    eventType: "in_review",
    eventAt: "2026-04-05T09:00:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
];

const documents: DocumentRecord[] = [
  {
    id: "document-3001",
    tenantId: EMPLOYER_TENANT_ID,
    employeeId: "employee-0001",
    uploaderUserId: "user-hr-01",
    uploaderRole: "hr_manager",
    documentType: "medical_certificate",
    documentCategory: "health_sensitive",
    sourceChannel: "hr_portal",
    storageObjectKey: "docs/document-3001.pdf",
    storageRegion: "CH",
    mimeType: "application/pdf",
    fileName: "medical-certificate-april.pdf",
    fileSizeBytes: 240000,
    checksumSha256: "checksum-3001",
    encryptionKeyRef: "kms-key-1",
    status: "available",
    retentionStatus: "active_retention",
    legalHoldFlag: false,
    retentionUntil: "2036-04-18",
    retentionPolicyCode: "medical-10y",
    uploadedAt: "2026-04-03T08:55:00.000Z",
  },
];

const documentLinks: DocumentLink[] = [
  {
    id: "document-link-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    linkTargetType: "absence_episode",
    linkTargetId: "episode-1001",
    isPrimary: true,
    linkedAt: "2026-04-03T08:56:00.000Z",
  },
  {
    id: "document-link-2",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    linkTargetType: "ktg_case",
    linkTargetId: "case-2001",
    isPrimary: false,
    linkedAt: "2026-04-03T10:05:00.000Z",
  },
];

const documentVersions: DocumentVersion[] = [
  {
    id: "document-version-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    versionNumber: 1,
    storageObjectKey: "docs/document-3001-v1.pdf",
    checksumSha256: "checksum-3001",
    createdAt: "2026-04-03T08:55:00.000Z",
  },
];

const documentExtractionJobs: DocumentExtractionJob[] = [
  {
    id: "document-job-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    jobType: "medical_certificate_extraction",
    status: "completed",
    requestedAt: "2026-04-03T08:56:00.000Z",
    startedAt: "2026-04-03T08:56:30.000Z",
    completedAt: "2026-04-03T08:57:30.000Z",
    provider: "ocr-demo",
  },
];

const medicalCertificateFacts: MedicalCertificateFact[] = [
  {
    id: "certificate-fact-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    absenceEpisodeId: "episode-1001",
    certificateReferenceId: "certificate-3001",
    firstDayOfIncapacity: "2026-04-02",
    certificateStartDate: "2026-04-02",
    certificateEndDate: "2026-04-18",
    incapacityPercentage: 100,
    issuedOn: "2026-04-03",
    issuingProviderName: "Praxis Seefeld",
    extractionStatus: "reviewed",
    extractionConfidence: 0.97,
    reviewRequiredFlag: false,
    reviewedBy: "claims-handler-1",
    reviewedAt: "2026-04-03T09:10:00.000Z",
  },
];

const certificateCoverageWindows: CertificateCoverageWindow[] = [
  {
    id: "coverage-window-1",
    tenantId: EMPLOYER_TENANT_ID,
    absenceEpisodeId: "episode-1001",
    medicalCertificateFactId: "certificate-fact-1",
    coveredFrom: "2026-04-02",
    coveredTo: "2026-04-18",
    certificateStatus: "active",
    expiryAlertAt: "2026-04-15",
  },
];

const documentAccessEvents: DocumentAccessEvent[] = [
  {
    id: "document-access-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    accessType: "view_metadata",
    purposeOfUse: "claims_assessment",
    accessedAt: "2026-04-18T08:32:00.000Z",
    result: "allowed",
  },
];

const documentConsentReferences: DocumentConsentReference[] = [
  {
    id: "document-consent-1",
    tenantId: EMPLOYER_TENANT_ID,
    documentId: "document-3001",
    employeeId: "employee-0001",
    consentRecordId: "consent-1",
    processingPurpose: "claims_assessment",
    recordedAt: "2026-04-03T09:00:00.000Z",
  },
];

const intakeWorkspaces: IntakeCaseWorkspace[] = [
  {
    id: "workspace-6001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    employeeId: "employee-0001",
    policyId: "policy-001",
    workspaceStatus: "intake_in_progress",
    assignedHandlerId: "claims-handler-1",
    assignedTeam: "Claims Zurich",
    submittedAt: "2026-04-04T12:00:00.000Z",
    lastActivityAt: "2026-04-18T09:00:00.000Z",
  },
];

const intakeChecklistItems: IntakeChecklistItem[] = [
  {
    id: "check-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    checkType: "coverage_confirmed",
    blockerCode: "coverage_required",
    sourceService: "ktg_case_service",
    blockingFlag: true,
    status: "satisfied",
    requiredFlag: true,
    completedAt: "2026-04-18T08:00:00.000Z",
    completedBy: "claims-handler-1",
  },
  {
    id: "check-2",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    checkType: "employer_statement_received",
    blockerCode: "employer_statement_required",
    sourceService: "manual",
    blockingFlag: true,
    status: "open",
    requiredFlag: true,
  },
];

const intakeMissingInformationRequests: MissingInformationRequest[] = [
  {
    id: "mir-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    requestReasonCode: "employer_statement_missing",
    requestDetails: "Need employer follow-up statement for incapacity progression.",
    requestedFromPartyType: "hr_manager",
    requestedFromUserId: "user-hr-01",
    requestedFromRole: "hr_manager",
    requestChannelPolicy: "portal_and_email",
    status: "open",
    requestedAt: "2026-04-18T08:15:00.000Z",
    dueAt: "2026-04-22T00:00:00.000Z",
  },
];

const intakeQueueEntries: HandlerWorkQueueEntry[] = [
  {
    id: "queue-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    queueType: "new_submissions",
    queueStatus: "in_progress",
    slaDueAt: "2026-04-19T00:00:00.000Z",
    sortScore: 0.98,
    enteredAt: "2026-04-04T12:05:00.000Z",
  },
];

const intakeNotes: WorkspaceNote[] = [
  {
    id: "intake-note-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    authorId: "claims-handler-1",
    authorRole: "claims_handler",
    visibility: "internal_claims_team",
    noteType: "triage_note",
    message: "Waiting on employer follow-up statement.",
    createdAt: "2026-04-18T08:20:00.000Z",
  },
];

const intakeRecommendations: IntakeDecisionRecommendation[] = [
  {
    id: "recommendation-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    recommendationType: "request_more_information",
    confidence: 0.91,
    reasonCodes: ["employer_statement_missing"],
    summary: "Employer statement is still missing for decision readiness.",
    generatedAt: "2026-04-18T08:21:00.000Z",
  },
];

const intakeActivityEvents: WorkspaceActivityEvent[] = [
  {
    id: "activity-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    eventType: "workspace_created",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    occurredAt: "2026-04-04T12:05:00.000Z",
  },
  {
    id: "activity-2",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    eventType: "missing_information_requested",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
    occurredAt: "2026-04-18T08:15:00.000Z",
  },
];

const intakeEvidenceReferences: WorkspaceEvidenceReference[] = [
  {
    id: "evidence-1",
    tenantId: INTERNAL_TENANT_ID,
    workspaceId: "workspace-6001",
    documentRole: "primary_certificate",
    documentId: "document-3001",
    linkSource: "inferred_from_document_service",
    linkConfidence: 0.99,
    linkedAt: "2026-04-18T08:05:00.000Z",
  },
];

const benefitCalculations: BenefitCaseCalculation[] = [
  {
    id: "calculation-7001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    calculationStatus: "calculated",
    calculationReason: "initial",
    referenceDate: "2026-04-18",
    coverageSnapshotId: "coverage-1",
    benefitDaysConsumed: 6,
    benefitDaysRemaining: 724,
    maxBenefitDays: 730,
    waitingDaysConsumed: 2,
    createdAt: "2026-04-18T08:10:00.000Z",
    updatedAt: "2026-04-18T08:12:00.000Z",
  },
];

const insuredSalarySnapshots: InsuredSalarySnapshot[] = [
  {
    id: "salary-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    ktgCaseId: "case-2001",
    salaryBasisDate: "2026-04-01",
    salaryModel: "monthly",
    annualBaseSalaryChf: 92000,
    included13thMonthChf: 7666.67,
    insuredBonusChf: 0,
    insuredAllowancesChf: 0,
    employmentPercentage: 100,
    policyCapChf: 148200,
    insuredSalaryChf: 99666.67,
    formula: "base + 13th",
    inputsJson: { annualBaseSalaryChf: 92000, included13thMonthChf: 7666.67 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

const coordinationWindows: CoordinationWindow[] = [];

const entitlementPeriods: BenefitEntitlementPeriod[] = [
  {
    id: "period-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    periodStart: "2026-04-05",
    periodEnd: "2026-04-12",
    periodType: "payable",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    wartezeitApplicableFlag: false,
    coordinationApplicableFlag: false,
    benefitDays: 8,
    dailyAllowanceRateChf: 102.51,
    payableAmountChf: 820.1,
    formula: "8 * 102.5125",
    inputsJson: { benefitDays: 8, dailyAllowanceRateChf: 102.5125 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
  {
    id: "period-2",
    tenantId: INTERNAL_TENANT_ID,
    benefitCaseCalculationId: "calculation-7001",
    periodStart: "2026-04-13",
    periodEnd: "2026-04-18",
    periodType: "payable",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    wartezeitApplicableFlag: false,
    coordinationApplicableFlag: false,
    benefitDays: 6,
    dailyAllowanceRateChf: 110.025,
    payableAmountChf: 660.15,
    formula: "6 * 110.025",
    inputsJson: { benefitDays: 6, dailyAllowanceRateChf: 110.025 },
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

const benefitDayBreakdowns: BenefitDayBreakdown[] = [
  {
    id: "breakdown-1",
    tenantId: INTERNAL_TENANT_ID,
    benefitEntitlementPeriodId: "period-1",
    benefitDate: "2026-04-05",
    absenceEpisodeId: "episode-1001",
    sourceReferenceJson: { episodeId: "episode-1001" },
    incapacityPercentage: 100,
    salaryBasisPerDayChf: 341.32,
    coveragePercentage: 80,
    grossDailyAllowanceChf: 273.06,
    deductionAmountChf: 170.55,
    netDailyAllowanceChf: 102.51,
    payableFlag: true,
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

const benefitAdjustments: BenefitAdjustment[] = [];

const paymentInstructions: PaymentInstruction[] = [
  {
    id: "payment-5001",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    benefitCaseCalculationId: "calculation-7001",
    payeeType: "employer",
    payeeReference: "employer-demo",
    paymentRouteReason: "salary_continuation_active",
    salaryContinuationActiveFlag: true,
    routingFormula: "salary_continuation_active -> employer",
    routingInputsJson: { salaryContinuationActiveFlag: true },
    paymentPeriodStart: "2026-04-05",
    paymentPeriodEnd: "2026-04-18",
    grossAmountChf: 1480.25,
    netAmountChf: 1480.25,
    currency: "CHF",
    instructionStatus: "pending",
    createdAt: "2026-04-18T08:12:00.000Z",
  },
];

const taggelddispositive: TaggelddispositivSnapshot[] = [
  {
    id: "statement-1",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    paymentInstructionId: "payment-5001",
    statementPeriodStart: "2026-04-05",
    statementPeriodEnd: "2026-04-18",
    totalClaimedDays: 14,
    totalPayableDays: 14,
    totalAmountChf: 1480.25,
    statementPayloadJson: { format: "summary" },
    generatedAt: "2026-04-18T08:13:00.000Z",
  },
];

const benefitAuditEvents: CalculationAuditEvent[] = [
  {
    id: "benefit-audit-1",
    tenantId: INTERNAL_TENANT_ID,
    ktgCaseId: "case-2001",
    benefitCaseCalculationId: "calculation-7001",
    eventType: "calculation_created",
    occurredAt: "2026-04-18T08:10:00.000Z",
    actorId: "claims-handler-1",
    actorRole: "claims_handler",
  },
];

const dashboardKpiSnapshots: DashboardKpiSnapshot[] = [
  {
    id: "dashboard-kpi-1",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "open_absences",
    valueJson: { count: 2 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-2",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "open_cases",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-3",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "pending_certificates",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-4",
    tenantId: EMPLOYER_TENANT_ID,
    dashboardRole: "hr_manager",
    kpiKey: "tasks_deadlines",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:50:00.000Z",
  },
  {
    id: "dashboard-kpi-5",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "intake_workload",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-6",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "pending_review",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-7",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "calculation_review",
    valueJson: { count: 1 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
  {
    id: "dashboard-kpi-8",
    tenantId: INTERNAL_TENANT_ID,
    dashboardRole: "claims_handler",
    kpiKey: "compliance_alerts",
    valueJson: { count: 0 },
    windowStart: "2026-04-01",
    windowEnd: "2026-04-18",
    refreshedAt: "2026-04-18T08:55:00.000Z",
  },
];

const dashboardWidgetSnapshots: DashboardWidgetSnapshot[] = [];
const projectionJobs: ProjectionJob[] = [];
const projectionWatermarks: ProjectionDependencyWatermark[] = [];
const dashboardViewConfigs: DashboardViewConfig[] = [];
const benchmarkSnapshots: BenchmarkSnapshot[] = [];

const notificationEvents: NotificationEvent[] = [
  {
    id: "notification-event-1",
    tenantId: EMPLOYER_TENANT_ID,
    eventType: "certificate_expiring",
    sourceType: "document",
    sourceId: "document-3001",
    triggeredAt: "2026-04-18T08:10:00.000Z",
    payload: { caseId: "case-2001" },
  },
];

const inboxItems: InboxItem[] = [
  {
    id: "task-4001",
    tenantId: EMPLOYER_TENANT_ID,
    audienceType: "role",
    audienceRole: "hr_manager",
    sourceType: "document",
    sourceId: "document-3001",
    title: "Confirm follow-up certificate",
    summary: "Certificate renewal is due for Anna Keller.",
    priority: "high",
    dueAt: "2026-04-22T00:00:00.000Z",
    status: "open",
    primaryActionLabel: "Open documents",
    primaryActionUrl: "/de-CH/documents",
    secondaryActionUrl: "/de-CH/cases/case-2001",
    notificationEventId: "notification-event-1",
    createdAt: "2026-04-18T08:10:00.000Z",
  },
];

const inboxAssignments: InboxItemAssignment[] = [
  {
    id: "assignment-1",
    tenantId: EMPLOYER_TENANT_ID,
    inboxItemId: "task-4001",
    assignedRole: "hr_manager",
    assignedAt: "2026-04-18T08:10:00.000Z",
    assignmentStatus: "assigned",
  },
];

const notificationPreferences: NotificationPreference[] = [];
const notificationTemplates: NotificationTemplate[] = [];
const notificationDeliveries: NotificationDelivery[] = [];
const deliverySuppressions: DeliverySuppression[] = [];

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createServices = () => {
  const absenceRepository = new AbsenceMemoryRepository(
    clone(absenceEpisodes),
    clone(absenceContractImpacts),
    clone(absenceDailyRecords),
    clone(absenceStatusEvents),
    clone(absenceComments),
    clone(absenceRecurrenceGroups),
  );
  const ktgCaseRepository = new KtgCaseMemoryRepository(
    clone(ktgCases),
    clone(ktgAbsenceLinks),
    clone(ktgCoverageSnapshots),
    clone(ktgSubmissions),
    clone(ktgDeadlines),
    clone(ktgTasks),
    clone(ktgNotes),
    clone(ktgDecisions),
    clone(ktgStatusEvents),
  );
  const documentRepository = new DocumentMemoryRepository(
    clone(documents),
    clone(documentLinks),
    clone(documentVersions),
    clone(documentExtractionJobs),
    clone(medicalCertificateFacts),
    clone(certificateCoverageWindows),
    clone(documentAccessEvents),
    clone(documentConsentReferences),
  );
  const claimsRepository = new ClaimsIntakeWorkspaceMemoryRepository(
    clone(intakeWorkspaces),
    clone(intakeChecklistItems),
    clone(intakeMissingInformationRequests),
    clone(intakeQueueEntries),
    clone(intakeNotes),
    clone(intakeRecommendations),
    clone(intakeActivityEvents),
    clone(intakeEvidenceReferences),
  );
  const benefitRepository = new BenefitEngineMemoryRepository(
    clone(benefitCalculations),
    clone(insuredSalarySnapshots),
    clone(coordinationWindows),
    clone(entitlementPeriods),
    clone(benefitDayBreakdowns),
    clone(benefitAdjustments),
    clone(paymentInstructions),
    clone(taggelddispositive),
    clone(benefitAuditEvents),
  );
  const dashboardRepository = new DashboardProjectionMemoryRepository(
    clone(dashboardKpiSnapshots),
    clone(dashboardWidgetSnapshots),
    clone(projectionJobs),
    clone(projectionWatermarks),
    clone(dashboardViewConfigs),
    clone(benchmarkSnapshots),
  );
  const inboxRepository = new InboxNotificationMemoryRepository(
    clone(notificationEvents),
    clone(inboxItems),
    clone(inboxAssignments),
    clone(notificationPreferences),
    clone(notificationTemplates),
    clone(notificationDeliveries),
    clone(deliverySuppressions),
  );

  return {
    repositories: {
      absenceRepository,
      ktgCaseRepository,
      documentRepository,
      claimsRepository,
      benefitRepository,
      dashboardRepository,
      inboxRepository,
    },
    services: {
      absenceService: new AbsenceRecordingService(absenceRepository),
      ktgCaseService: new KtgCaseService(ktgCaseRepository),
      documentService: new DocumentService(documentRepository),
      claimsService: new ClaimsIntakeWorkspaceService(claimsRepository),
      benefitService: new BenefitEngineService(benefitRepository),
      dashboardService: new DashboardProjectionService(dashboardRepository),
      inboxService: new InboxNotificationService(inboxRepository),
    },
  };
};

const kpiValue = async (
  dashboardService: DashboardProjectionService,
  input: { tenantId: string; dashboardRole: DashboardKpiSnapshot["dashboardRole"]; key: string },
): Promise<number> => {
  const snapshot = await dashboardService.getActiveDashboardKpiSnapshot({
    tenantId: input.tenantId,
    dashboardRole: input.dashboardRole,
    kpiKey: input.key,
  });
  const count = snapshot?.valueJson.count;
  return typeof count === "number" ? count : 0;
};

const getEmployeeName = (employeeId: string): string => employeeDirectory[employeeId]?.name ?? employeeId;

const listTenantEpisodes = async (repository: AbsenceMemoryRepository, tenantId: string): Promise<AbsenceEpisode[]> => {
  const employeeIds = employeeIdsByTenant[tenantId] ?? [];
  const lists = await Promise.all(employeeIds.map((employeeId) => repository.listEpisodesByEmployee(tenantId, employeeId)));
  return lists.flat().sort((left, right) => right.startDate.localeCompare(left.startDate));
};

const listTenantCases = async (repository: KtgCaseMemoryRepository, tenantId: string): Promise<KtgCase[]> => {
  const employeeIds = employeeIdsByTenant[tenantId === INTERNAL_TENANT_ID ? EMPLOYER_TENANT_ID : tenantId] ?? [];
  const lists = await Promise.all(employeeIds.map((employeeId) => repository.listCasesByEmployee(EMPLOYER_TENANT_ID, employeeId)));
  return lists.flat().sort((left, right) => right.caseNumber.localeCompare(left.caseNumber));
};

const getCaseDocumentIds = async (documentRepository: DocumentMemoryRepository, caseId: string): Promise<string[]> => {
  const allDocuments = await documentRepository.listDocuments(EMPLOYER_TENANT_ID);
  const matches = await Promise.all(allDocuments.map(async (document) => ({
    documentId: document.id,
    links: await documentRepository.listDocumentLinksByDocument(document.tenantId, document.id),
  })));
  return matches
    .filter((match) => match.links.some((link) => link.linkTargetType === "ktg_case" && link.linkTargetId === caseId))
    .map((match) => match.documentId);
};

const makeResponse = <T>(
  data: T,
  tenantId: string,
  locale: PortalLocale,
  permissions: WorkflowPermission[],
  meta?: Partial<WorkflowResponse<T>["meta"]>,
): WorkflowResponse<T> => ({
  data,
  meta: {
    tenantId,
    locale,
    ...meta,
  },
  permissions,
  links: baseLinks(locale),
});

export const getEmployerDashboard = async (tenantId: string, locale: PortalLocale): Promise<WorkflowResponse<EmployerDashboardSummary>> => {
  const { services } = createServices();
  const [openAbsences, openCases, pendingCertificates, tasksDeadlines] = await Promise.all([
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "hr_manager", key: "open_absences" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "hr_manager", key: "open_cases" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "hr_manager", key: "pending_certificates" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "hr_manager", key: "tasks_deadlines" }),
  ]);

  return makeResponse({
    cards: [
      { key: "open_absences", label: "Open absences", value: openAbsences, href: `/${locale}/absences` },
      { key: "open_cases", label: "Open KTG cases", value: openCases, href: `/${locale}/cases` },
      { key: "pending_certificates", label: "Pending certificates", value: pendingCertificates, href: `/${locale}/documents` },
      { key: "tasks_deadlines", label: "Tasks and deadlines", value: tasksDeadlines, href: `/${locale}/tasks` },
    ],
  }, tenantId, locale, employerPermissions);
};

export const listEmployerAbsences = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; employee?: string },
): Promise<WorkflowResponse<EmployerAbsenceListItem[]>> => {
  const { repositories, services } = createServices();
  const episodes = await listTenantEpisodes(repositories.absenceRepository, tenantId);
  const items = await Promise.all(episodes.map(async (episode) => {
    const detail = await services.absenceService.getEpisodeDetail(tenantId, episode.id);
    const cases = await repositories.ktgCaseRepository.listCasesByEmployee(tenantId, episode.employeeId);
    const linkedCase = await Promise.all(cases.map(async (ktgCase) => ({
      caseId: ktgCase.id,
      links: await repositories.ktgCaseRepository.listAbsenceLinksByCase(tenantId, ktgCase.id),
    })));
    const linkedCaseId = linkedCase.find((candidate) =>
      candidate.links.some((link) => link.absenceEpisodeId === episode.id))?.caseId;
    const latestDailyRecord = detail?.dailyRecords.sort(
      (left: AbsenceDailyRecord, right: AbsenceDailyRecord) => right.absenceDate.localeCompare(left.absenceDate),
    )[0];

    return {
      episodeId: episode.id,
      employeeId: episode.employeeId,
      employeeName: getEmployeeName(episode.employeeId),
      periodLabel: `${episode.startDate} to ${episode.actualEndDate ?? episode.expectedEndDate ?? "open"}`,
      status: episode.status,
      incapacityPercent: latestDailyRecord?.incapacityPercentage ?? 0,
      linkedCaseId,
    } satisfies EmployerAbsenceListItem;
  }));
  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase())));

  return makeResponse(filtered, tenantId, locale, employerPermissions, {
    totalCount: filtered.length,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
};

export const getEmployerAbsenceDetail = async (
  tenantId: string,
  locale: PortalLocale,
  episodeId: string,
): Promise<WorkflowResponse<EmployerAbsenceDetail> | null> => {
  const { repositories, services } = createServices();
  const detail = await services.absenceService.getEpisodeDetail(tenantId, episodeId);
  if (!detail) {
    return null;
  }

  const documentsForEpisode = await services.documentService.getCertificateCoverageByEpisode(tenantId, episodeId, REFERENCE_AT);
  const cases = await repositories.ktgCaseRepository.listCasesByEmployee(tenantId, detail.episode.employeeId);
  const linkedCaseIds = (
    await Promise.all(cases.map(async (ktgCase) => ({
      caseId: ktgCase.id,
      links: await repositories.ktgCaseRepository.listAbsenceLinksByCase(tenantId, ktgCase.id),
    })))
  )
    .filter((candidate) => candidate.links.some((link) => link.absenceEpisodeId === episodeId))
    .map((candidate) => candidate.caseId);

  return makeResponse({
    episodeId: detail.episode.id,
    employeeId: detail.episode.employeeId,
    employeeName: getEmployeeName(detail.episode.employeeId),
    status: detail.episode.status,
    timeline: [
      ...detail.statusEvents.map((event: AbsenceStatusEvent) => ({
        date: event.eventAt.slice(0, 10),
        label: `Status changed to ${event.toStatus}`,
        type: "status" as const,
      })),
      ...detail.comments.map((comment: AbsenceComment) => ({
        date: comment.createdAt.slice(0, 10),
        label: comment.message,
        type: "comment" as const,
      })),
      ...detail.dailyRecords.map((record: AbsenceDailyRecord) => ({
        date: record.absenceDate,
        label: `Daily record ${record.incapacityPercentage}% incapacity`,
        type: "daily_record" as const,
      })),
    ].sort((left: { date: string }, right: { date: string }) => left.date.localeCompare(right.date)),
    certificateDocumentIds: documentsForEpisode.map((window: CertificateCoverageWindow) =>
      window.medicalCertificateFactId.replace("certificate-fact", "document")),
    linkedCaseIds,
  }, tenantId, locale, employerPermissions);
};

export const listEmployerCases = async (tenantId: string, locale: PortalLocale): Promise<WorkflowResponse<EmployerCaseListItem[]>> => {
  const { repositories, services } = createServices();
  const cases = await listTenantCases(repositories.ktgCaseRepository, tenantId);
  const items = await Promise.all(cases.map(async (ktgCase) => {
    const detail = await services.ktgCaseService.getCaseDetail(tenantId, ktgCase.id);
    return {
      caseId: ktgCase.id,
      caseNumber: ktgCase.caseNumber,
      employeeName: getEmployeeName(ktgCase.employeeId),
      status: ktgCase.status,
      deadlineAt: detail?.deadlines.sort(
        (left: KtgDeadline, right: KtgDeadline) => left.dueAt.localeCompare(right.dueAt),
      )[0]?.dueAt.slice(0, 10),
      linkedEpisodeIds: detail?.absenceLinks.map((link: KtgCaseAbsenceLink) => link.absenceEpisodeId) ?? [],
    } satisfies EmployerCaseListItem;
  }));

  return makeResponse(items, tenantId, locale, employerPermissions, { totalCount: items.length });
};

export const getEmployerCaseDetail = async (
  tenantId: string,
  locale: PortalLocale,
  caseId: string,
): Promise<WorkflowResponse<EmployerCaseDetail> | null> => {
  const { repositories, services } = createServices();
  const detail = await services.ktgCaseService.getCaseDetail(tenantId, caseId);
  if (!detail) {
    return null;
  }

  const linkedDocumentIds = await getCaseDocumentIds(repositories.documentRepository, caseId);
  const internalCalculationDetails = await services.benefitService.listCalculations(INTERNAL_TENANT_ID, { ktgCaseId: caseId });

  return makeResponse({
    caseId: detail.id,
    caseNumber: detail.caseNumber,
    employeeName: getEmployeeName(detail.employeeId),
    status: detail.status,
    coverageSummary: detail.coverageSnapshot
      ? `Policy ${detail.coverageSnapshot.policyId} covers ${detail.coverageSnapshot.coveragePercentage}% with waiting period ${detail.coverageSnapshot.wartezeitDays} days.`
      : "Coverage snapshot unavailable.",
    deadlineSummary: detail.deadlines.map((deadline: KtgDeadline) => `${deadline.deadlineType} due ${deadline.dueAt.slice(0, 10)}`),
    linkedEpisodeIds: detail.absenceLinks.map((link: KtgCaseAbsenceLink) => link.absenceEpisodeId),
    linkedDocumentIds,
    decisionSummary: detail.decisions.map((decision: KtgCaseDecision) => decision.reasonText ?? decision.decisionStatus),
    paymentSummaryIds: internalCalculationDetails.map((calculation) => calculation.id),
  }, tenantId, locale, employerPermissions);
};

export const listEmployerDocuments = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<EmployerDocumentListItem[]>> => {
  const { repositories } = createServices();
  const items = await Promise.all((await repositories.documentRepository.listDocuments(tenantId)).map(async (document) => {
    const links = await repositories.documentRepository.listDocumentLinksByDocument(tenantId, document.id);
    return {
      documentId: document.id,
      title: document.fileName,
      employeeName: getEmployeeName(document.employeeId ?? ""),
      status: document.status,
      linkedEpisodeId: links.find((link) => link.linkTargetType === "absence_episode")?.linkTargetId,
      linkedCaseId: links.find((link) => link.linkTargetType === "ktg_case")?.linkTargetId,
    } satisfies EmployerDocumentListItem;
  }));

  return makeResponse(items, tenantId, locale, employerPermissions, { totalCount: items.length });
};

export const listEmployerTasks = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<EmployerTaskListItem[]>> => {
  const { repositories, services } = createServices();
  const items = await Promise.all((await repositories.inboxRepository.listInboxItems(tenantId, { audienceRole: "hr_manager" })).map(async (item) => {
    const detail = await services.inboxService.getInboxItemDetail(tenantId, item.id, REFERENCE_AT);
    return {
      taskId: item.id,
      title: item.title,
      status: detail?.status ?? item.status,
      dueAt: item.dueAt?.slice(0, 10),
      href: item.primaryActionUrl?.replace("/de-CH", `/${locale}`) ?? `/${locale}`,
    } satisfies EmployerTaskListItem;
  }));

  return makeResponse(items, tenantId, locale, employerPermissions, { totalCount: items.length });
};

export const listEmployerPayments = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<EmployerPaymentSummary[]>> => {
  const { services } = createServices();
  const calculations = await services.benefitService.listCalculations(INTERNAL_TENANT_ID);
  const items = (
    await Promise.all(calculations.map(async (calculation) => {
      const detail = await services.benefitService.getCalculationDetail(INTERNAL_TENANT_ID, calculation.id);
      const instruction = detail?.paymentInstructions[0];
      if (!instruction) {
        return null;
      }
      const employerCase = await services.ktgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, calculation.ktgCaseId);
      return {
        paymentSummaryId: instruction.id,
        caseId: calculation.ktgCaseId,
        caseNumber: employerCase?.caseNumber ?? calculation.ktgCaseId,
        amountChf: instruction.netAmountChf,
        periodLabel: `${instruction.paymentPeriodStart} to ${instruction.paymentPeriodEnd}`,
        status: instruction.instructionStatus,
      } satisfies EmployerPaymentSummary;
    }))
  ).flatMap((item) => (item ? [item] : []));

  return makeResponse(items, tenantId, locale, employerPermissions, { totalCount: items.length });
};

export const getInternalDashboard = async (tenantId: string, locale: PortalLocale): Promise<WorkflowResponse<InternalDashboardSummary>> => {
  const { services } = createServices();
  const [intakeWorkload, pendingReview, calculationReview, complianceAlerts] = await Promise.all([
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "claims_handler", key: "intake_workload" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "claims_handler", key: "pending_review" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "claims_handler", key: "calculation_review" }),
    kpiValue(services.dashboardService, { tenantId, dashboardRole: "claims_handler", key: "compliance_alerts" }),
  ]);

  return makeResponse({
    cards: [
      { key: "intake_workload", label: "Intake workload", value: intakeWorkload, href: `/${locale}/intake` },
      { key: "pending_review", label: "Pending review", value: pendingReview, href: `/${locale}/ktg-cases` },
      { key: "calculation_review", label: "Calculation review", value: calculationReview, href: `/${locale}/benefits` },
      { key: "compliance_alerts", label: "Compliance alerts", value: complianceAlerts, href: `/${locale}/compliance` },
    ],
  }, tenantId, locale, internalPermissions);
};

export const listInternalIntake = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<InternalIntakeListItem[]>> => {
  const { services } = createServices();
  const workspaces = await services.claimsService.listWorkspaces(tenantId);
  const items = await Promise.all(workspaces.map(async (workspace: IntakeCaseWorkspace) => {
    const detail = await services.claimsService.getWorkspaceDetail(tenantId, workspace.id);
    const blockerCount = detail?.checklistItems.filter(
      (item: IntakeChecklistItem) => item.blockingFlag && item.status !== "satisfied",
    ).length ?? 0;
    return {
      workspaceId: workspace.id,
      ktgCaseId: workspace.ktgCaseId,
      status: workspace.workspaceStatus,
      assignedHandler: workspace.assignedHandlerId ?? "unassigned",
      blockerCount,
      overdue: detail?.queueEntries.some((entry: { overdue: { value: boolean } }) => entry.overdue.value) ?? false,
    } satisfies InternalIntakeListItem;
  }));

  return makeResponse(items, tenantId, locale, internalPermissions, { totalCount: items.length });
};

export const getInternalIntakeDetail = async (
  tenantId: string,
  locale: PortalLocale,
  workspaceId: string,
): Promise<WorkflowResponse<InternalIntakeDetail> | null> => {
  const { services } = createServices();
  const detail = await services.claimsService.getWorkspaceDetail(tenantId, workspaceId);
  if (!detail) {
    return null;
  }

  return makeResponse({
    workspaceId: detail.id,
    ktgCaseId: detail.ktgCaseId,
    status: detail.workspaceStatus,
    checklistItems: detail.checklistItems.map((item: IntakeChecklistItem) => ({
      id: item.id,
      label: item.checkType,
      status: item.status,
      blocking: item.blockingFlag,
    })),
    missingInformationRequests: detail.missingInformationRequests.map((request: MissingInformationRequest) => ({
      id: request.id,
      requestedFrom: request.requestedFromPartyType,
      status: request.status,
    })),
    notes: detail.notes.map((note: WorkspaceNote) => ({
      id: note.id,
      author: note.authorId ?? note.authorRole,
      body: note.message,
    })),
    evidenceReferences: detail.evidenceReferences.map((reference: WorkspaceEvidenceReference) => ({
      id: reference.id,
      label: reference.documentRole,
      referenceId: reference.documentId ?? reference.certificateReferenceId ?? "unknown",
    })),
    activityHistory: detail.activityEvents.map((event: WorkspaceActivityEvent) => ({
      id: event.id,
      occurredAt: event.occurredAt,
      label: event.eventType,
    })),
  }, tenantId, locale, internalPermissions);
};

export const listInternalCases = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<InternalCaseListItem[]>> => {
  const { repositories, services } = createServices();
  const cases = await listTenantCases(repositories.ktgCaseRepository, tenantId);
  const items = await Promise.all(cases.map(async (ktgCase) => {
    const detail = await services.ktgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, ktgCase.id);
    return {
      caseId: ktgCase.id,
      caseNumber: ktgCase.caseNumber,
      employeeName: getEmployeeName(ktgCase.employeeId),
      status: ktgCase.status,
      assignedTeam: "Claims Zurich",
      deadlineAt: detail?.deadlines.sort(
        (left: KtgDeadline, right: KtgDeadline) => left.dueAt.localeCompare(right.dueAt),
      )[0]?.dueAt.slice(0, 10),
    } satisfies InternalCaseListItem;
  }));

  return makeResponse(items, tenantId, locale, internalPermissions, { totalCount: items.length });
};

export const getInternalCaseDetail = async (
  tenantId: string,
  locale: PortalLocale,
  caseId: string,
): Promise<WorkflowResponse<InternalCaseDetail> | null> => {
  const { repositories, services } = createServices();
  const detail = await services.ktgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, caseId);
  if (!detail) {
    return null;
  }

  return makeResponse({
    caseId: detail.id,
    caseNumber: detail.caseNumber,
    employeeName: getEmployeeName(detail.employeeId),
    status: detail.status,
    submissions: detail.submissions.map((submission: KtgCaseSubmission) => `${submission.validationResult} at ${submission.submittedAt.slice(0, 10)}`),
    deadlines: detail.deadlines.map((deadline: KtgDeadline) => `${deadline.deadlineType} due ${deadline.dueAt.slice(0, 10)}`),
    decisions: detail.decisions.map((decision: KtgCaseDecision) => decision.reasonText ?? decision.decisionStatus),
    linkedEpisodeIds: detail.absenceLinks.map((link: KtgCaseAbsenceLink) => link.absenceEpisodeId),
    linkedDocumentIds: await getCaseDocumentIds(repositories.documentRepository, caseId),
    linkedCalculationIds: (await services.benefitService.listCalculations(tenantId, { ktgCaseId: caseId })).map((calculation) => calculation.id),
  }, tenantId, locale, internalPermissions);
};

export const listInternalBenefits = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<InternalBenefitListItem[]>> => {
  const { services } = createServices();
  const calculations = await services.benefitService.listCalculations(tenantId);
  const items = await Promise.all(calculations.map(async (calculation) => {
    const detail = await services.benefitService.getCalculationDetail(tenantId, calculation.id);
    return {
      calculationId: calculation.id,
      ktgCaseId: calculation.ktgCaseId,
      status: calculation.calculationStatus,
      referenceDate: calculation.referenceDate,
      periodCount: detail?.entitlementPeriods.length ?? 0,
    } satisfies InternalBenefitListItem;
  }));

  return makeResponse(items, tenantId, locale, internalPermissions, { totalCount: items.length });
};

export const getInternalBenefitDetail = async (
  tenantId: string,
  locale: PortalLocale,
  calculationId: string,
): Promise<WorkflowResponse<InternalBenefitDetail> | null> => {
  const { services } = createServices();
  const detail = await services.benefitService.getCalculationDetail(tenantId, calculationId);
  if (!detail) {
    return null;
  }

  return makeResponse({
    calculationId: detail.id,
    ktgCaseId: detail.ktgCaseId,
    status: detail.calculationStatus,
    entitlementPeriods: detail.entitlementPeriods.map((period) => ({
      id: period.id,
      label: `${period.periodStart} to ${period.periodEnd}`,
      payableAmountChf: period.payableAmountChf,
    })),
    adjustmentSummary: detail.adjustments.map((adjustment) => `${adjustment.adjustmentType} ${adjustment.deltaAmountChf} CHF`),
    paymentInstructionSummary: detail.paymentInstructions.map((instruction) => ({
      id: instruction.id,
      routing: instruction.paymentRouteReason,
      amountChf: instruction.netAmountChf,
    })),
  }, tenantId, locale, internalPermissions);
};
