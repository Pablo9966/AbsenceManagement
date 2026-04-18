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
} from "../../absence-service/src/index.js";
import {
  BenefitEngineService,
  type BenefitEngineRepository,
} from "../../benefit-engine-service/src/index.js";
import {
  ClaimsIntakeWorkspaceService,
  type ClaimsIntakeWorkspaceRepository,
} from "../../claims-intake-workspace-service/src/index.js";
import {
  DashboardProjectionService,
  type DashboardProjectionRepository,
} from "../../dashboard-projection-service/src/index.js";
import {
  DocumentService,
  type DocumentRepository,
} from "../../document-service/src/index.js";
import {
  InboxNotificationService,
  type InboxNotificationRepository,
} from "../../inbox-notification-service/src/index.js";
import {
  KtgCaseService,
  type KtgCaseRepository,
} from "../../ktg-case-service/src/index.js";

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

const paginateItems = <T>(
  items: T[],
  input?: { page?: number; pageSize?: number },
): {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
} => {
  const totalCount = items.length;
  const pageSize = Math.max(1, input?.pageSize ?? (totalCount || 1));
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(1, input?.page ?? 1), totalPages);
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalPages,
    totalCount,
  };
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type F<T> = T[];
import {
  absenceEpisodes as _absenceEpisodes,
  absenceContractImpacts as _absenceContractImpacts,
  absenceDailyRecords as _absenceDailyRecords,
  absenceStatusEvents as _absenceStatusEvents,
  absenceComments as _absenceComments,
  absenceRecurrenceGroups as _absenceRecurrenceGroups,
  ktgCases as _ktgCases,
  ktgAbsenceLinks as _ktgAbsenceLinks,
  ktgCoverageSnapshots as _ktgCoverageSnapshots,
  ktgSubmissions as _ktgSubmissions,
  ktgDeadlines as _ktgDeadlines,
  ktgTasks as _ktgTasks,
  ktgNotes as _ktgNotes,
  ktgDecisions as _ktgDecisions,
  ktgStatusEvents as _ktgStatusEvents,
  documents as _documents,
  documentLinks as _documentLinks,
  documentVersions as _documentVersions,
  documentExtractionJobs as _documentExtractionJobs,
  medicalCertificateFacts as _medicalCertificateFacts,
  certificateCoverageWindows as _certificateCoverageWindows,
  documentAccessEvents as _documentAccessEvents,
  documentConsentReferences as _documentConsentReferences,
  intakeWorkspaces as _intakeWorkspaces,
  intakeChecklistItems as _intakeChecklistItems,
  intakeMissingInformationRequests as _intakeMissingInformationRequests,
  intakeQueueEntries as _intakeQueueEntries,
  intakeNotes as _intakeNotes,
  intakeRecommendations as _intakeRecommendations,
  intakeActivityEvents as _intakeActivityEvents,
  intakeEvidenceReferences as _intakeEvidenceReferences,
  benefitCalculations as _benefitCalculations,
  insuredSalarySnapshots as _insuredSalarySnapshots,
  coordinationWindows as _coordinationWindows,
  entitlementPeriods as _entitlementPeriods,
  benefitDayBreakdowns as _benefitDayBreakdowns,
  benefitAdjustments as _benefitAdjustments,
  paymentInstructions as _paymentInstructions,
  taggelddispositive as _taggelddispositive,
  benefitAuditEvents as _benefitAuditEvents,
  dashboardKpiSnapshots as _dashboardKpiSnapshots,
  dashboardWidgetSnapshots as _dashboardWidgetSnapshots,
  projectionJobs as _projectionJobs,
  projectionWatermarks as _projectionWatermarks,
  dashboardViewConfigs as _dashboardViewConfigs,
  benchmarkSnapshots as _benchmarkSnapshots,
  notificationEvents as _notificationEvents,
  inboxItems as _inboxItems,
  inboxAssignments as _inboxAssignments,
  notificationPreferences as _notificationPreferences,
  notificationTemplates as _notificationTemplates,
  notificationDeliveries as _notificationDeliveries,
  deliverySuppressions as _deliverySuppressions,
} from "./testing/demo-fixtures.js";

// Cast fixture arrays from generic FixtureArray to the domain types derived from
// the repository interfaces already imported above.
const absenceEpisodes = _absenceEpisodes as F<AbsenceEpisode>;
const absenceContractImpacts = _absenceContractImpacts as F<AbsenceContractImpact>;
const absenceDailyRecords = _absenceDailyRecords as F<AbsenceDailyRecord>;
const absenceStatusEvents = _absenceStatusEvents as F<AbsenceStatusEvent>;
const absenceComments = _absenceComments as F<AbsenceComment>;
const absenceRecurrenceGroups = _absenceRecurrenceGroups as F<AbsenceRecurrenceGroup>;
const ktgCases = _ktgCases as F<KtgCase>;
const ktgAbsenceLinks = _ktgAbsenceLinks as F<KtgCaseAbsenceLink>;
const ktgCoverageSnapshots = _ktgCoverageSnapshots as F<KtgCaseCoverageSnapshot>;
const ktgSubmissions = _ktgSubmissions as F<KtgCaseSubmission>;
const ktgDeadlines = _ktgDeadlines as F<KtgDeadline>;
const ktgTasks = _ktgTasks as F<KtgTask>;
const ktgNotes = _ktgNotes as F<KtgCaseNote>;
const ktgDecisions = _ktgDecisions as F<KtgCaseDecision>;
const ktgStatusEvents = _ktgStatusEvents as F<KtgCaseStatusEvent>;
const documents = _documents as F<DocumentRecord>;
const documentLinks = _documentLinks as F<DocumentLink>;
const documentVersions = _documentVersions as F<DocumentVersion>;
const documentExtractionJobs = _documentExtractionJobs as F<DocumentExtractionJob>;
const medicalCertificateFacts = _medicalCertificateFacts as F<MedicalCertificateFact>;
const certificateCoverageWindows = _certificateCoverageWindows as F<CertificateCoverageWindow>;
const documentAccessEvents = _documentAccessEvents as F<DocumentAccessEvent>;
const documentConsentReferences = _documentConsentReferences as F<DocumentConsentReference>;
const intakeWorkspaces = _intakeWorkspaces as F<IntakeCaseWorkspace>;
const intakeChecklistItems = _intakeChecklistItems as F<IntakeChecklistItem>;
const intakeMissingInformationRequests = _intakeMissingInformationRequests as F<MissingInformationRequest>;
const intakeQueueEntries = _intakeQueueEntries as F<HandlerWorkQueueEntry>;
const intakeNotes = _intakeNotes as F<WorkspaceNote>;
const intakeRecommendations = _intakeRecommendations as F<IntakeDecisionRecommendation>;
const intakeActivityEvents = _intakeActivityEvents as F<WorkspaceActivityEvent>;
const intakeEvidenceReferences = _intakeEvidenceReferences as F<WorkspaceEvidenceReference>;
const benefitCalculations = _benefitCalculations as F<BenefitCaseCalculation>;
const insuredSalarySnapshots = _insuredSalarySnapshots as F<InsuredSalarySnapshot>;
const coordinationWindows = _coordinationWindows as F<CoordinationWindow>;
const entitlementPeriods = _entitlementPeriods as F<BenefitEntitlementPeriod>;
const benefitDayBreakdowns = _benefitDayBreakdowns as F<BenefitDayBreakdown>;
const benefitAdjustments = _benefitAdjustments as F<BenefitAdjustment>;
const paymentInstructions = _paymentInstructions as F<PaymentInstruction>;
const taggelddispositive = _taggelddispositive as F<TaggelddispositivSnapshot>;
const benefitAuditEvents = _benefitAuditEvents as F<CalculationAuditEvent>;
const dashboardKpiSnapshots = _dashboardKpiSnapshots as F<DashboardKpiSnapshot>;
const dashboardWidgetSnapshots = _dashboardWidgetSnapshots as F<DashboardWidgetSnapshot>;
const projectionJobs = _projectionJobs as F<ProjectionJob>;
const projectionWatermarks = _projectionWatermarks as F<ProjectionDependencyWatermark>;
const dashboardViewConfigs = _dashboardViewConfigs as F<DashboardViewConfig>;
const benchmarkSnapshots = _benchmarkSnapshots as F<BenchmarkSnapshot>;
const notificationEvents = _notificationEvents as F<NotificationEvent>;
const inboxItems = _inboxItems as F<InboxItem>;
const inboxAssignments = _inboxAssignments as F<InboxItemAssignment>;
const notificationPreferences = _notificationPreferences as F<NotificationPreference>;
const notificationTemplates = _notificationTemplates as F<NotificationTemplate>;
const notificationDeliveries = _notificationDeliveries as F<NotificationDelivery>;
const deliverySuppressions = _deliverySuppressions as F<DeliverySuppression>;


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
  filters?: { status?: string; employee?: string; page?: number; pageSize?: number },
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
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
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

export const listEmployerCases = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; employee?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<EmployerCaseListItem[]>> => {
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

  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase())));
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
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
  filters?: { status?: string; employee?: string; page?: number; pageSize?: number },
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

  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase())));
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
};

export const listEmployerTasks = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; page?: number; pageSize?: number },
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

  const filtered = items.filter((item) => !filters?.status || item.status === filters.status);
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
    },
  });
};

export const listEmployerPayments = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; page?: number; pageSize?: number },
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

  const filtered = items.filter((item) => !filters?.status || item.status === filters.status);
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
    },
  });
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
  filters?: {
    status?: string;
    assignedHandler?: string;
    assignedTeam?: string;
    overdue?: string;
    page?: number;
    pageSize?: number;
  },
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

  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.assignedHandler || item.assignedHandler.toLowerCase().includes(filters.assignedHandler.toLowerCase())) &&
    (!filters?.assignedTeam || (filters.assignedTeam === "Claims Zurich" && item.assignedHandler.length > 0)) &&
    (!filters?.overdue || String(item.overdue) === filters.overdue));
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, internalPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.assignedHandler ? { assignedHandler: filters.assignedHandler } : {}),
      ...(filters?.assignedTeam ? { assignedTeam: filters.assignedTeam } : {}),
      ...(filters?.overdue ? { overdue: filters.overdue } : {}),
    },
  });
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
  filters?: { status?: string; employee?: string; page?: number; pageSize?: number },
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

  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase())));
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, internalPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
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
  filters?: { status?: string; caseId?: string; page?: number; pageSize?: number },
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

  const filtered = items.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.caseId || item.ktgCaseId === filters.caseId));
  const paginated = paginateItems(filtered, filters);

  return makeResponse(paginated.items, tenantId, locale, internalPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.caseId ? { caseId: filters.caseId } : {}),
    },
  });
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
