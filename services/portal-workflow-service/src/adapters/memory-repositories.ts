// Extracted memory repository adapters
import {
  AbsenceRecordingService,
  type AbsenceRepository,
} from "../../../absence-service/src/index.js";
import {
  BenefitEngineService,
  type BenefitEngineRepository,
} from "../../../benefit-engine-service/src/index.js";
import {
  ClaimsIntakeWorkspaceService,
  type ClaimsIntakeWorkspaceRepository,
} from "../../../claims-intake-workspace-service/src/index.js";
import {
  DashboardProjectionService,
  type DashboardProjectionRepository,
} from "../../../dashboard-projection-service/src/index.js";
import {
  DocumentService,
  type DocumentRepository,
} from "../../../document-service/src/index.js";
import {
  InboxNotificationService,
  type InboxNotificationRepository,
} from "../../../inbox-notification-service/src/index.js";
import {
  KtgCaseService,
  type KtgCaseRepository,
} from "../../../ktg-case-service/src/index.js";
import {
  PaymentOperationsService,
  type PaymentOperationsRepository,
  type PaymentOperationsRepositoryContext,
} from "../../../payment-operations-service/src/index.js";
import type {
  CaseSettlementSummary,
  PaymentExportPackage,
  PaymentOperationsAuditEvent,
  PaymentReconciliationRecord,
  PaymentRun,
  PaymentRunItem,
  PaymentStatement,
  PayrollBookingConfirmation,
} from "../../../payment-operations-service/src/index.js";
export { PaymentOperationsService };
export type { PaymentOperationsRepository, PaymentOperationsRepositoryContext };
export type ArrayItem<T> = T extends readonly (infer U)[] ? U : T extends (infer U)[] ? U : never;
export type AwaitedReturn<T extends (...args: never[]) => Promise<unknown>> = Awaited<ReturnType<T>>;

export type AbsenceEpisode = NonNullable<AwaitedReturn<AbsenceRepository["getEpisodeById"]>>;
export type AbsenceContractImpact = ArrayItem<AwaitedReturn<AbsenceRepository["listContractImpactsByEpisode"]>>;
export type AbsenceDailyRecord = ArrayItem<AwaitedReturn<AbsenceRepository["listDailyRecordsByEpisode"]>>;
export type AbsenceStatusEvent = ArrayItem<AwaitedReturn<AbsenceRepository["listStatusEventsByEpisode"]>>;
export type AbsenceComment = ArrayItem<AwaitedReturn<AbsenceRepository["listCommentsByEpisode"]>>;
export type AbsenceRecurrenceGroup = NonNullable<AwaitedReturn<AbsenceRepository["getRecurrenceGroupById"]>>;

export type BenefitCaseCalculation = NonNullable<AwaitedReturn<BenefitEngineRepository["getCalculationById"]>>;
export type InsuredSalarySnapshot = NonNullable<AwaitedReturn<BenefitEngineRepository["getInsuredSalarySnapshotByCalculation"]>>;
export type CoordinationWindow = ArrayItem<AwaitedReturn<BenefitEngineRepository["listCoordinationWindowsByCalculation"]>>;
export type BenefitEntitlementPeriod = ArrayItem<AwaitedReturn<BenefitEngineRepository["listEntitlementPeriodsByCalculation"]>>;
export type BenefitDayBreakdown = ArrayItem<AwaitedReturn<BenefitEngineRepository["listDayBreakdownsByCalculation"]>>;
export type BenefitAdjustment = ArrayItem<AwaitedReturn<BenefitEngineRepository["listAdjustmentsByCalculation"]>>;
export type PaymentInstruction = ArrayItem<AwaitedReturn<BenefitEngineRepository["listPaymentInstructionsByCalculation"]>>;
export type TaggelddispositivSnapshot = ArrayItem<AwaitedReturn<BenefitEngineRepository["listTaggelddispositiveByCalculation"]>>;
export type CalculationAuditEvent = ArrayItem<AwaitedReturn<BenefitEngineRepository["listAuditEventsByCalculation"]>>;

export type IntakeCaseWorkspace = NonNullable<AwaitedReturn<ClaimsIntakeWorkspaceRepository["getWorkspaceById"]>>;
export type IntakeChecklistItem = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listChecklistItemsByWorkspace"]>>;
export type MissingInformationRequest = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listMissingInformationRequestsByWorkspace"]>>;
export type HandlerWorkQueueEntry = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listQueueEntriesByWorkspace"]>>;
export type WorkspaceNote = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listNotesByWorkspace"]>>;
export type IntakeDecisionRecommendation = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listRecommendationsByWorkspace"]>>;
export type WorkspaceActivityEvent = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listActivityEventsByWorkspace"]>>;
export type WorkspaceEvidenceReference = ArrayItem<AwaitedReturn<ClaimsIntakeWorkspaceRepository["listEvidenceReferencesByWorkspace"]>>;

export type DashboardKpiSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listDashboardKpiSnapshots"]>>;
export type DashboardWidgetSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listDashboardWidgetSnapshots"]>>;
export type ProjectionJob = NonNullable<AwaitedReturn<DashboardProjectionRepository["getProjectionJobById"]>>;
export type ProjectionDependencyWatermark = NonNullable<AwaitedReturn<DashboardProjectionRepository["getProjectionDependencyWatermarkById"]>>;
export type DashboardViewConfig = NonNullable<AwaitedReturn<DashboardProjectionRepository["getDashboardViewConfigById"]>>;
export type BenchmarkSnapshot = ArrayItem<AwaitedReturn<DashboardProjectionRepository["listBenchmarkSnapshots"]>>;

export type DocumentRecord = NonNullable<AwaitedReturn<DocumentRepository["getDocumentById"]>>;
export type DocumentLink = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentLinksByDocument"]>>;
export type DocumentVersion = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentVersionsByDocument"]>>;
export type DocumentExtractionJob = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentExtractionJobsByDocument"]>>;
export type MedicalCertificateFact = NonNullable<AwaitedReturn<DocumentRepository["getMedicalCertificateFactByDocument"]>>;
export type CertificateCoverageWindow = ArrayItem<AwaitedReturn<DocumentRepository["listCertificateCoverageWindowsByEpisode"]>>;
export type DocumentAccessEvent = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentAccessEventsByDocument"]>>;
export type DocumentConsentReference = ArrayItem<AwaitedReturn<DocumentRepository["listDocumentConsentReferencesByDocument"]>>;

export type NotificationEvent = NonNullable<AwaitedReturn<InboxNotificationRepository["getNotificationEventById"]>>;
export type InboxItem = NonNullable<AwaitedReturn<InboxNotificationRepository["getInboxItemById"]>>;
export type InboxItemAssignment = ArrayItem<AwaitedReturn<InboxNotificationRepository["listInboxItemAssignmentsByItem"]>>;
export type NotificationPreference = NonNullable<AwaitedReturn<InboxNotificationRepository["getNotificationPreferenceById"]>>;
export type NotificationTemplate = ArrayItem<AwaitedReturn<InboxNotificationRepository["listNotificationTemplates"]>>;
export type NotificationDelivery = ArrayItem<AwaitedReturn<InboxNotificationRepository["listNotificationDeliveriesByItem"]>>;
export type DeliverySuppression = ArrayItem<AwaitedReturn<InboxNotificationRepository["listDeliverySuppressions"]>>;

export type KtgCase = NonNullable<AwaitedReturn<KtgCaseRepository["getCaseById"]>>;
export type KtgCaseAbsenceLink = ArrayItem<AwaitedReturn<KtgCaseRepository["listAbsenceLinksByCase"]>>;
export type KtgCaseCoverageSnapshot = NonNullable<AwaitedReturn<KtgCaseRepository["getCoverageSnapshotByCase"]>>;
export type KtgCaseSubmission = ArrayItem<AwaitedReturn<KtgCaseRepository["listSubmissionsByCase"]>>;
export type KtgDeadline = ArrayItem<AwaitedReturn<KtgCaseRepository["listDeadlinesByCase"]>>;
export type KtgTask = ArrayItem<AwaitedReturn<KtgCaseRepository["listTasksByCase"]>>;
export type KtgCaseNote = ArrayItem<AwaitedReturn<KtgCaseRepository["listNotesByCase"]>>;
export type KtgCaseDecision = ArrayItem<AwaitedReturn<KtgCaseRepository["listDecisionsByCase"]>>;
export type KtgCaseStatusEvent = ArrayItem<AwaitedReturn<KtgCaseRepository["listStatusEventsByCase"]>>;
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
export class AbsenceMemoryRepository implements AbsenceRepository {
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

export class KtgCaseMemoryRepository implements KtgCaseRepository {
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

export class DocumentMemoryRepository implements DocumentRepository {
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

export class ClaimsIntakeWorkspaceMemoryRepository implements ClaimsIntakeWorkspaceRepository {
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

export class BenefitEngineMemoryRepository implements BenefitEngineRepository {
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

export class DashboardProjectionMemoryRepository implements DashboardProjectionRepository {
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

export class InboxNotificationMemoryRepository implements InboxNotificationRepository {
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

export class PaymentOperationsMemoryRepository implements PaymentOperationsRepository {
  constructor(
    private readonly runs: PaymentRun[],
    private readonly runItems: PaymentRunItem[],
    private readonly exportPackages: PaymentExportPackage[],
    private readonly statements: PaymentStatement[],
    private readonly settlementSummaries: CaseSettlementSummary[],
    private readonly reconciliationRecords: PaymentReconciliationRecord[],
    private readonly bookingConfirmations: PayrollBookingConfirmation[],
    private readonly auditEvents: PaymentOperationsAuditEvent[],
  ) {}

  async withTransaction<T>(operation: (repo: PaymentOperationsRepositoryContext) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createPaymentRun(run: PaymentRun): Promise<PaymentRun> {
    return append(this.runs, run);
  }

  async getPaymentRunById(tenantId: string, runId: string): Promise<PaymentRun | null> {
    return this.runs.find((r) => r.tenantId === tenantId && r.id === runId) ?? null;
  }

  async updatePaymentRun(run: PaymentRun): Promise<PaymentRun> {
    replaceById(this.runs, run);
    return run;
  }

  async listPaymentRuns(tenantId: string, filters?: { runStatus?: string; runType?: string }): Promise<PaymentRun[]> {
    return this.runs.filter(
      (r) =>
        r.tenantId === tenantId &&
        (!filters?.runStatus || r.runStatus === filters.runStatus) &&
        (!filters?.runType || r.runType === filters.runType),
    );
  }

  async createPaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem> {
    return append(this.runItems, item);
  }

  async listPaymentRunItemsByRun(tenantId: string, runId: string): Promise<PaymentRunItem[]> {
    return this.runItems.filter((i) => i.tenantId === tenantId && i.paymentRunId === runId);
  }

  async updatePaymentRunItem(item: PaymentRunItem): Promise<PaymentRunItem> {
    replaceById(this.runItems, item);
    return item;
  }

  async findActiveRunItemByInstruction(tenantId: string, paymentInstructionId: string): Promise<PaymentRunItem | null> {
    return (
      this.runItems.find(
        (i) =>
          i.tenantId === tenantId &&
          i.paymentInstructionId === paymentInstructionId &&
          (i.itemStatus === "included" || i.itemStatus === "exported"),
      ) ?? null
    );
  }

  async createExportPackage(pkg: PaymentExportPackage): Promise<PaymentExportPackage> {
    return append(this.exportPackages, pkg);
  }

  async listExportPackagesByRun(tenantId: string, runId: string): Promise<PaymentExportPackage[]> {
    return this.exportPackages.filter((p) => p.tenantId === tenantId && p.paymentRunId === runId);
  }

  async createPaymentStatement(stmt: PaymentStatement): Promise<PaymentStatement> {
    return append(this.statements, stmt);
  }

  async listStatementsByRun(tenantId: string, runId: string): Promise<PaymentStatement[]> {
    return this.statements.filter((s) => s.tenantId === tenantId && s.paymentRunId === runId);
  }

  async listStatementsByCase(tenantId: string, ktgCaseId: string): Promise<PaymentStatement[]> {
    return this.statements.filter((s) => s.tenantId === tenantId && s.ktgCaseId === ktgCaseId);
  }

  async upsertSettlementSummary(summary: CaseSettlementSummary): Promise<CaseSettlementSummary> {
    const existing = this.settlementSummaries.findIndex(
      (s) => s.tenantId === summary.tenantId && s.ktgCaseId === summary.ktgCaseId,
    );
    if (existing === -1) {
      this.settlementSummaries.push(summary);
    } else {
      this.settlementSummaries[existing] = summary;
    }
    return summary;
  }

  async getSettlementSummaryByCase(tenantId: string, ktgCaseId: string): Promise<CaseSettlementSummary | null> {
    return this.settlementSummaries.find((s) => s.tenantId === tenantId && s.ktgCaseId === ktgCaseId) ?? null;
  }

  async listSettlementSummaries(tenantId: string): Promise<CaseSettlementSummary[]> {
    return this.settlementSummaries.filter((s) => s.tenantId === tenantId);
  }

  async createReconciliationRecord(record: PaymentReconciliationRecord): Promise<PaymentReconciliationRecord> {
    return append(this.reconciliationRecords, record);
  }

  async getReconciliationRecordByRun(tenantId: string, runId: string): Promise<PaymentReconciliationRecord | null> {
    return this.reconciliationRecords.find((r) => r.tenantId === tenantId && r.paymentRunId === runId) ?? null;
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
      (r) =>
        r.tenantId === tenantId &&
        (!filters?.reconciliationStatus || r.reconciliationStatus === filters.reconciliationStatus),
    );
  }

  async createPayrollBookingConfirmation(conf: PayrollBookingConfirmation): Promise<PayrollBookingConfirmation> {
    return append(this.bookingConfirmations, conf);
  }

  async getPayrollBookingConfirmationByRun(tenantId: string, runId: string): Promise<PayrollBookingConfirmation | null> {
    return this.bookingConfirmations.find((c) => c.tenantId === tenantId && c.paymentRunId === runId) ?? null;
  }

  async createAuditEvent(event: PaymentOperationsAuditEvent): Promise<PaymentOperationsAuditEvent> {
    return append(this.auditEvents, event);
  }

  async listAuditEventsByRun(tenantId: string, runId: string): Promise<PaymentOperationsAuditEvent[]> {
    return this.auditEvents
      .filter((e) => e.tenantId === tenantId && e.paymentRunId === runId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  async listAuditEvents(tenantId: string, filters?: { runId?: string }): Promise<PaymentOperationsAuditEvent[]> {
    return this.auditEvents
      .filter(
        (e) =>
          e.tenantId === tenantId &&
          (!filters?.runId || e.paymentRunId === filters.runId),
      )
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
}