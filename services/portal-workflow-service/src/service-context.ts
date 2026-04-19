import { randomBytes, randomUUID } from "node:crypto";
import type {
  EmployeeAbsenceDetail,
  EmployeeAbsenceListItem,
  EmployeeAbsenceSubmissionResult,
  EmployeeCertificateUploadResult,
  EmployeeDashboardSummary,
  EmployeeDocumentDetail,
  EmployeeDocumentListItem,
  EmployeeReturnToWorkResult,
  EmployeeReturnToWorkState,
  EmployeeStatusSummary,
  EmployerAbsenceDetail,
  EmployerAbsenceListItem,
  EmployerCaseDetail,
  EmployerCaseListItem,
  EmployerDashboardSummary,
  EmployerDocumentListItem,
  EmployerPaymentSummary,
  EmployerTaskListItem,
  EmployerPremiumAdjustmentResult,
  EmployerPremiumDashboard,
  EmployerPremiumInstallmentPlanSummary,
  EmployerPremiumSettlementResult,
  EmployerSalaryMassReportResult,
  EmployerUvgAccidentReportResult,
  EmployerUvgCaseDetail,
  EmployerUvgCaseListItem,
  EmployerUvgReportArtifactResult,
  InternalBenefitDetail,
  InternalBenefitListItem,
  InternalCaseDetail,
  InternalCaseListItem,
  InternalDashboardSummary,
  InternalIntakeDetail,
  InternalIntakeListItem,
  InternalUvgCaseDetail,
  InternalUvgCaseListItem,
  PortalLocale,
  WorkflowLink,
  WorkflowPermission,
  WorkflowResponse,
} from "@elipslife/portal-workflow-client";
import {
  AbsenceRecordingService,
  type AbsenceRepository,
} from "../../absence-service/src/index.js";
import type { AbsenceType, WorkingTimeModel } from "../../absence-service/src/domain/types.js";
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
import type { DocumentType, ProcessingPurpose } from "../../document-service/src/domain/types.js";
import {
  InboxNotificationService,
  type InboxNotificationRepository,
} from "../../inbox-notification-service/src/index.js";
import {
  KtgCaseService,
  type KtgCaseRepository,
} from "../../ktg-case-service/src/index.js";
import {
  PaymentOperationsService,
  type PaymentOperationsRepository,
} from "../../payment-operations-service/src/index.js";
import {
  UvgCaseService,
  type OccupationalContext,
  type UvgCaseDetail,
  type UvgCaseRepository,
  type UvgCaseStatus,
  type UvgCaseType,
} from "../../uvg-case-service/src/index.js";
import {
  PremiumReconciliationService,
  type PremiumRepository,
} from "../../premium-reconciliation-service/src/index.js";

import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors.js";
import type {
  AbsenceEpisode, AbsenceDailyRecord, AbsenceStatusEvent, AbsenceComment,
  KtgCase, KtgCaseAbsenceLink, KtgDeadline, KtgCaseDecision, KtgCaseSubmission,
  CertificateCoverageWindow,
  DashboardKpiSnapshot,
  IntakeCaseWorkspace, IntakeChecklistItem, MissingInformationRequest,
  WorkspaceNote, WorkspaceEvidenceReference, WorkspaceActivityEvent,
} from "./adapters/memory-repositories.js";
import type {
  EmployerPaymentRunSummary,
  InternalPaymentRunListItem,
  InternalPaymentRunDetail,
  InternalPaymentRunItemSummary,
  InternalExportPackageSummary,
  InternalStatementSummary,
  InternalReconciliationRecord,
  InternalMonthEndReport,
  InternalMonthEndReportEntry,
  InternalPaymentAuditEventItem,
  InternalSettlementSummary,
} from "@elipslife/portal-workflow-client";

export interface PortalWorkflowContext {
  repositories: {
    absenceRepository: AbsenceRepository;
    ktgCaseRepository: KtgCaseRepository;
    documentRepository: DocumentRepository;
    claimsRepository: ClaimsIntakeWorkspaceRepository;
    benefitRepository: BenefitEngineRepository;
    dashboardRepository: DashboardProjectionRepository;
    inboxRepository: InboxNotificationRepository;
    paymentOperationsRepository: PaymentOperationsRepository;
    uvgCaseRepository: UvgCaseRepository;
    premiumRepository: PremiumRepository;
  };
  services: {
    absenceService: AbsenceRecordingService;
    ktgCaseService: KtgCaseService;
    documentService: DocumentService;
    claimsService: ClaimsIntakeWorkspaceService;
    benefitService: BenefitEngineService;
    dashboardService: DashboardProjectionService;
    inboxService: InboxNotificationService;
    paymentOperationsService: PaymentOperationsService;
    uvgCaseService: UvgCaseService;
    premiumService: PremiumReconciliationService;
  };
}

let workflowContext: PortalWorkflowContext | null = null;
export const initializeWorkflowContext = (context: PortalWorkflowContext) => {
  workflowContext = context;
};
export const getPortalWorkflowServices = (): PortalWorkflowContext => {
  if (!workflowContext) throw new Error("Workflow context not initialized");
  return workflowContext;
};

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
  { resourceType: "payment_run", action: "read", allowed: true },
  { resourceType: "uvg_case", action: "read", allowed: true },
  { resourceType: "uvg_case", action: "write", allowed: true },
  { resourceType: "premium", action: "read", allowed: true },
  { resourceType: "premium", action: "write", allowed: true },
];

const internalPermissions: WorkflowPermission[] = [
  { resourceType: "dashboard", action: "read_internal", allowed: true },
  { resourceType: "claims_intake_workspace", action: "read", allowed: true },
  { resourceType: "ktg_case", action: "read_internal", allowed: true },
  { resourceType: "benefit_calculation", action: "read", allowed: true },
  { resourceType: "payment_run", action: "read_internal", allowed: true },
  { resourceType: "payment_run", action: "write_internal", allowed: true },
  { resourceType: "reconciliation", action: "read_internal", allowed: true },
  { resourceType: "reconciliation", action: "write_internal", allowed: true },
  { resourceType: "uvg_case", action: "read_internal", allowed: true },
  { resourceType: "uvg_case", action: "write_internal", allowed: true },
];

const employeePermissions: WorkflowPermission[] = [
  { resourceType: "dashboard", action: "read", allowed: true },
  { resourceType: "absence", action: "read", allowed: true },
  { resourceType: "absence", action: "write", allowed: true },
  { resourceType: "document", action: "read", allowed: true },
  { resourceType: "document", action: "write", allowed: true },
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

const toDisplayStatus = (status: string): string =>
  status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const requireEmployeeTenant = (tenantId: string): void => {
  if (tenantId !== EMPLOYER_TENANT_ID) {
    throw new WorkflowForbiddenError("Employee self-service is only available for employer tenants.");
  }
};

const linkHref = (locale: PortalLocale, href: string, relatedId?: string): WorkflowLink => ({
  label: href,
  href: `/${locale}${href}`,
  relatedId,
});

const getEmployeeEpisodeDocuments = async (
  documentRepository: DocumentRepository,
  tenantId: string,
  employeeId: string,
  episodeId: string,
) => {
  const documents = await documentRepository.listDocuments(tenantId, { employeeId });
  const matches = await Promise.all(documents.map(async (document) => ({
    document,
    detail: await documentRepository.getMedicalCertificateFactByDocument(tenantId, document.id),
    links: await documentRepository.listDocumentLinksByDocument(tenantId, document.id),
  })));

  return matches.filter((entry) =>
    entry.links.some((link) => link.linkTargetType === "absence_episode" && link.linkTargetId === episodeId),
  );
};

const inferEmploymentContract = async (
  absenceService: AbsenceRecordingService,
  tenantId: string,
  employeeId: string,
): Promise<{
  employmentContractId: string;
  workingTimeModel: WorkingTimeModel;
  employmentPercentageSnapshot: number;
  scheduledHoursPerWeekSnapshot?: number;
} | null> => {
  const episodes = await absenceService.getEmployeeTimeline({
    tenantId,
    employeeId,
    from: "2025-01-01",
    to: "2026-12-31",
  });
  for (const timelineItem of episodes) {
    const detail = await absenceService.getEpisodeDetail(tenantId, timelineItem.episodeId);
    const contractImpact = detail?.contractImpacts[0];
    if (contractImpact) {
      return {
        employmentContractId: contractImpact.employmentContractId,
        workingTimeModel: contractImpact.workingTimeModel,
        employmentPercentageSnapshot: contractImpact.employmentPercentageSnapshot,
        scheduledHoursPerWeekSnapshot: contractImpact.scheduledHoursPerWeekSnapshot,
      };
    }
  }

  return null;
};

const buildEmployeeAbsenceListItem = async (
  repositories: PortalWorkflowContext["repositories"],
  tenantId: string,
  episode: AbsenceEpisode,
): Promise<EmployeeAbsenceListItem> => {
  const documents = await getEmployeeEpisodeDocuments(repositories.documentRepository, tenantId, episode.employeeId, episode.id);
  return {
    episodeId: episode.id,
    employeeId: episode.employeeId,
    periodLabel: `${episode.startDate} - ${episode.actualEndDate ?? episode.expectedEndDate ?? "open"}`,
    displayStatus: toDisplayStatus(episode.status),
    status: episode.status,
    source: episode.source,
    startDate: episode.startDate,
    expectedEndDate: episode.expectedEndDate,
    actualEndDate: episode.actualEndDate,
    certificateDocumentIds: documents.map((entry) => entry.document.id),
  };
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

const listTenantEpisodes = async (repository: AbsenceRepository, tenantId: string): Promise<AbsenceEpisode[]> => {
  const employeeIds = employeeIdsByTenant[tenantId] ?? [];
  const lists = await Promise.all(employeeIds.map((employeeId) => repository.listEpisodesByEmployee(tenantId, employeeId)));
  return lists.flat().sort((left, right) => right.startDate.localeCompare(left.startDate));
};

const listTenantCases = async (repository: KtgCaseRepository, tenantId: string): Promise<KtgCase[]> => {
  const employeeIds = employeeIdsByTenant[tenantId === INTERNAL_TENANT_ID ? EMPLOYER_TENANT_ID : tenantId] ?? [];
  const lists = await Promise.all(employeeIds.map((employeeId) => repository.listCasesByEmployee(EMPLOYER_TENANT_ID, employeeId)));
  return lists.flat().sort((left, right) => right.caseNumber.localeCompare(left.caseNumber));
};

const getCaseDocumentIds = async (documentRepository: DocumentRepository, caseId: string): Promise<string[]> => {
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

export const getEmployeeDashboard = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
): Promise<WorkflowResponse<EmployeeDashboardSummary>> => {
  requireEmployeeTenant(tenantId);
  const { repositories } = getPortalWorkflowServices();
  const episodes = await repositories.absenceRepository.listEpisodesByEmployee(tenantId, employeeId);
  const activeEpisodes = episodes.filter((episode) => !["closed", "cancelled"].includes(episode.status));
  const activeAbsences = await Promise.all(activeEpisodes.map((episode) => buildEmployeeAbsenceListItem(repositories, tenantId, episode)));
  const documents = await listEmployeeDocuments(tenantId, locale, employeeId, { page: 1, pageSize: 3 });
  const returnToWork = await getEmployeeReturnToWorkState(tenantId, locale, employeeId);

  return makeResponse({
    employeeId,
    employeeName: getEmployeeName(employeeId),
    activeAbsenceCount: activeAbsences.length,
    recentDocumentCount: documents.data.length,
    pendingActionCount: returnToWork.data.length + (documents.data.some((item) => item.status === "under_review") ? 1 : 0),
    currentStatus: activeAbsences.length > 0 ? "absence_active" : "clear",
    activeAbsences,
    recentDocuments: documents.data,
    pendingActions: [
      ...returnToWork.data.map((state) => ({
        key: `return-${state.episodeId}`,
        label: "Confirm return to work",
        href: `/${locale}/return-to-work`,
      })),
      {
        key: "upload-certificate",
        label: "Upload certificate",
        href: `/${locale}/documents/upload`,
      },
    ],
    returnToWorkPrompt: returnToWork.data[0],
  }, tenantId, locale, employeePermissions);
};

export const listEmployeeAbsences = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
  filters?: { status?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<EmployeeAbsenceListItem[]>> => {
  requireEmployeeTenant(tenantId);
  const { repositories } = getPortalWorkflowServices();
  const episodes = await repositories.absenceRepository.listEpisodesByEmployee(tenantId, employeeId);
  const filtered = episodes
    .filter((episode) => !filters?.status || episode.status === filters.status)
    .sort((left, right) => right.startDate.localeCompare(left.startDate));
  const items = await Promise.all(filtered.map((episode) => buildEmployeeAbsenceListItem(repositories, tenantId, episode)));
  const paginated = paginateItems(items, filters);

  return makeResponse(paginated.items, tenantId, locale, employeePermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: filters?.status ? { status: filters.status } : undefined,
  });
};

export const getEmployeeAbsenceDetail = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
  episodeId: string,
): Promise<WorkflowResponse<EmployeeAbsenceDetail>> => {
  requireEmployeeTenant(tenantId);
  const { repositories, services } = getPortalWorkflowServices();
  const detail = await services.absenceService.getEpisodeDetail(tenantId, episodeId);
  if (!detail || detail.episode.employeeId !== employeeId) {
    throw new WorkflowNotFoundError();
  }

  const documents = await getEmployeeEpisodeDocuments(repositories.documentRepository, tenantId, employeeId, episodeId);
  return makeResponse({
    episodeId: detail.episode.id,
    employeeId: detail.episode.employeeId,
    periodLabel: `${detail.episode.startDate} - ${detail.episode.actualEndDate ?? detail.episode.expectedEndDate ?? "open"}`,
    displayStatus: toDisplayStatus(detail.episode.status),
    status: detail.episode.status,
    source: detail.episode.source,
    startDate: detail.episode.startDate,
    expectedEndDate: detail.episode.expectedEndDate,
    actualEndDate: detail.episode.actualEndDate,
    timeline: [
      ...detail.statusEvents.map((event) => ({
        date: event.eventAt,
        label: `${toDisplayStatus(event.toStatus)} (${event.eventType})`,
        type: "status" as const,
      })),
      ...detail.dailyRecords.map((record) => ({
        date: record.absenceDate,
        label: `${record.incapacityPercentage}% incapacity`,
        type: "daily_record" as const,
      })),
    ].sort((left, right) => left.date.localeCompare(right.date)),
    documents: documents.map((entry) => ({
      documentId: entry.document.id,
      title: entry.document.fileName,
      status: entry.document.status,
    })),
  }, tenantId, locale, employeePermissions);
};

export const listEmployeeDocuments = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
  filters?: { status?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<EmployeeDocumentListItem[]>> => {
  requireEmployeeTenant(tenantId);
  const { repositories, services } = getPortalWorkflowServices();
  const documents = await repositories.documentRepository.listDocuments(tenantId, {
    employeeId,
    status: filters?.status as "uploaded" | "available" | "under_review" | "superseded" | "quarantined" | "deleted" | undefined,
  });
  const items = await Promise.all(documents.map(async (document) => {
    const detail = await services.documentService.getDocumentDetail(tenantId, document.id, REFERENCE_AT);
    const absenceLink = detail?.links.find((link) => link.linkTargetType === "absence_episode");
    return {
      documentId: document.id,
      employeeId,
      title: document.fileName,
      documentType: document.documentType,
      status: document.status,
      uploadedAt: document.uploadedAt,
      linkedEpisodeId: absenceLink?.linkTargetId,
      certificateStatus: detail?.certificateCoverageWindow?.certificateStatus,
    } satisfies EmployeeDocumentListItem;
  }));
  const sorted = items.sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
  const paginated = paginateItems(sorted, filters);

  return makeResponse(paginated.items, tenantId, locale, employeePermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: filters?.status ? { status: filters.status } : undefined,
  });
};

export const getEmployeeDocumentDetail = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
  documentId: string,
): Promise<WorkflowResponse<EmployeeDocumentDetail>> => {
  requireEmployeeTenant(tenantId);
  const { services } = getPortalWorkflowServices();
  const detail = await services.documentService.getDocumentDetail(tenantId, documentId, REFERENCE_AT);
  if (!detail || detail.employeeId !== employeeId) {
    throw new WorkflowNotFoundError();
  }
  const absenceLink = detail.links.find((link) => link.linkTargetType === "absence_episode");
  return makeResponse({
    documentId: detail.id,
    employeeId,
    title: detail.fileName,
    documentType: detail.documentType,
    status: detail.status,
    uploadedAt: detail.uploadedAt,
    linkedEpisodeId: absenceLink?.linkTargetId,
    certificateStatus: detail.certificateCoverageWindow?.certificateStatus,
    coverageLabel: detail.certificateCoverageWindow
      ? `${detail.certificateCoverageWindow.coveredFrom} - ${detail.certificateCoverageWindow.coveredTo ?? "open"}`
      : undefined,
  }, tenantId, locale, employeePermissions);
};

export const getEmployeeStatusSummary = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
): Promise<WorkflowResponse<EmployeeStatusSummary>> => {
  requireEmployeeTenant(tenantId);
  const [absences, documents] = await Promise.all([
    listEmployeeAbsences(tenantId, locale, employeeId, { page: 1, pageSize: 10 }),
    listEmployeeDocuments(tenantId, locale, employeeId, { page: 1, pageSize: 10 }),
  ]);
  return makeResponse({
    employeeId,
    employeeName: getEmployeeName(employeeId),
    activeAbsences: absences.data,
    documents: documents.data,
    currentStatus: absences.data.some((absence) => absence.status !== "closed" && absence.status !== "cancelled")
      ? "absence_active"
      : "clear",
  }, tenantId, locale, employeePermissions);
};

export const getEmployeeReturnToWorkState = async (
  tenantId: string,
  locale: PortalLocale,
  employeeId: string,
): Promise<WorkflowResponse<EmployeeReturnToWorkState[]>> => {
  requireEmployeeTenant(tenantId);
  const { repositories } = getPortalWorkflowServices();
  const episodes = await repositories.absenceRepository.listEpisodesByEmployee(tenantId, employeeId);
  const actionable = episodes
    .filter((episode) => ["reported", "acknowledged", "in_progress", "partially_returned"].includes(episode.status))
    .sort((left, right) => right.startDate.localeCompare(left.startDate))
    .map((episode) => ({
      episodeId: episode.id,
      periodLabel: `${episode.startDate} - ${episode.expectedEndDate ?? "open"}`,
      currentStatus: toDisplayStatus(episode.status),
      suggestedReturnDate: episode.expectedEndDate,
    }));
  return makeResponse(actionable, tenantId, locale, employeePermissions);
};

export const submitEmployeeAbsence = async (input: {
  tenantId: string;
  locale: PortalLocale;
  employeeId: string;
  userId: string;
  absenceType: string;
  startDate: string;
  expectedEndDate?: string;
  comment?: string;
}): Promise<WorkflowResponse<EmployeeAbsenceSubmissionResult>> => {
  requireEmployeeTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const contract = await inferEmploymentContract(services.absenceService, input.tenantId, input.employeeId);
  const episodeId = randomUUID();
  const episode = await services.absenceService.createEpisode({
    id: episodeId,
    tenantId: input.tenantId,
    employeeId: input.employeeId,
    primaryAbsenceType: input.absenceType as AbsenceType,
    source: "employee_portal",
    reportedAt: REFERENCE_AT,
    reportedByUserId: input.userId,
    reportedByRole: "employee",
    startDate: input.startDate,
    firstDayOfIncapacity: input.startDate,
    expectedEndDate: input.expectedEndDate,
    status: "reported",
    reasonCategory: "self_reported_sickness",
    lineManagerAckRequired: false,
  }, {
    actorId: input.userId,
    actorRole: "employee",
    effectiveAt: REFERENCE_AT,
  });
  if (!episode.data) {
    throw new Error(episode.issues.map((issue) => issue.message).join(", "));
  }

  if (contract) {
    const contractImpactId = randomUUID();
    await services.absenceService.createContractImpact({
      id: contractImpactId,
      tenantId: input.tenantId,
      episodeId,
      employmentContractId: contract.employmentContractId,
      affectedEmploymentPercentage: 100,
      employmentPercentageSnapshot: contract.employmentPercentageSnapshot,
      workingTimeModel: contract.workingTimeModel,
      scheduledHoursPerWeekSnapshot: contract.scheduledHoursPerWeekSnapshot,
    }, {
      actorId: input.userId,
      actorRole: "employee",
      effectiveAt: REFERENCE_AT,
    });
    await services.absenceService.createDailyRecord({
      id: randomUUID(),
      tenantId: input.tenantId,
      episodeId,
      contractImpactId,
      employeeId: input.employeeId,
      employmentContractId: contract.employmentContractId,
      absenceDate: input.startDate,
      incapacityPercentage: 100,
      partialDayPercentage: 100,
      scheduledWorkMinutes: 480,
      lostWorkMinutes: 480,
      certifiedFlag: false,
      returnToWorkFlag: false,
      coordinatedOverlapFlag: false,
    }, {
      actorId: input.userId,
      actorRole: "employee",
      effectiveAt: REFERENCE_AT,
    });
  }

  if (input.comment?.trim()) {
    await services.absenceService.createComment({
      id: randomUUID(),
      tenantId: input.tenantId,
      episodeId,
      authorId: input.userId,
      authorRole: "employee",
      visibility: "employee_visible",
      message: input.comment.trim(),
      createdAt: REFERENCE_AT,
    });
  }

  return makeResponse({
    episodeId,
    status: episode.data.status,
    createdAt: episode.data.reportedAt,
  }, input.tenantId, input.locale, employeePermissions);
};

export const uploadEmployeeCertificate = async (input: {
  tenantId: string;
  locale: PortalLocale;
  employeeId: string;
  userId: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  absenceEpisodeId?: string;
  certificateStartDate: string;
  certificateEndDate?: string;
  incapacityPercentage: number;
  issuingProviderName?: string;
}): Promise<WorkflowResponse<EmployeeCertificateUploadResult>> => {
  requireEmployeeTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const uploadedAt = REFERENCE_AT;
  const documentId = randomUUID();
  const document = await services.documentService.createDocument({
    id: documentId,
    tenantId: input.tenantId,
    employeeId: input.employeeId,
    uploaderUserId: input.userId,
    uploaderRole: "employee",
    documentType: input.documentType as DocumentType,
    documentCategory: "health_sensitive",
    sourceChannel: "employee_portal",
    storageObjectKey: `employee-uploads/${documentId}/${input.fileName}`,
    storageRegion: "CH",
    mimeType: input.mimeType,
    fileName: input.fileName,
    fileSizeBytes: input.fileSizeBytes,
    checksumSha256: randomBytes(32).toString("hex"),
    encryptionKeyRef: "kms-ch-demo",
    status: "uploaded",
    retentionStatus: "active_retention",
    legalHoldFlag: false,
    retentionUntil: "2036-04-18",
    retentionPolicyCode: "medical_certificate_default",
    uploadedAt,
  });
  if (!document.data) {
    throw new Error(document.issues.map((issue) => issue.message).join(", "));
  }

  if (input.absenceEpisodeId) {
    await services.documentService.createDocumentLink({
      id: randomUUID(),
      tenantId: input.tenantId,
      documentId,
      linkTargetType: "absence_episode",
      linkTargetId: input.absenceEpisodeId,
      isPrimary: true,
      linkedAt: uploadedAt,
    });
  }

  await services.documentService.createMedicalCertificateFact({
    id: randomUUID(),
    tenantId: input.tenantId,
    documentId,
    absenceEpisodeId: input.absenceEpisodeId,
    certificateReferenceId: `CERT-${documentId.slice(0, 8)}`,
    firstDayOfIncapacity: input.certificateStartDate,
    certificateStartDate: input.certificateStartDate,
    certificateEndDate: input.certificateEndDate,
    incapacityPercentage: input.incapacityPercentage,
    issuingProviderName: input.issuingProviderName,
    extractionStatus: "pending",
    extractionConfidence: 0.5,
    reviewRequiredFlag: true,
  }, {
    actorId: input.userId,
    actorRole: "employee",
    effectiveAt: uploadedAt,
  });

  await services.documentService.createDocumentAccessEvent({
    id: randomUUID(),
    tenantId: input.tenantId,
    documentId,
    actorId: input.userId,
    actorRole: "employee",
    accessType: "view_metadata",
    purposeOfUse: "absence_tracking",
    accessedAt: uploadedAt,
    result: "allowed",
  });

  await services.documentService.createDocumentConsentReference({
    id: randomUUID(),
    tenantId: input.tenantId,
    documentId,
    employeeId: input.employeeId,
    consentRecordId: `consent-${documentId}`,
    processingPurpose: "absence_tracking" satisfies ProcessingPurpose,
    recordedAt: uploadedAt,
  });

  return makeResponse({
    documentId,
    status: document.data.status,
    linkedEpisodeId: input.absenceEpisodeId,
    uploadedAt,
  }, input.tenantId, input.locale, employeePermissions);
};

export const confirmEmployeeReturnToWork = async (input: {
  tenantId: string;
  locale: PortalLocale;
  employeeId: string;
  userId: string;
  episodeId: string;
  actualReturnDate: string;
}): Promise<WorkflowResponse<EmployeeReturnToWorkResult>> => {
  requireEmployeeTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.absenceService.confirmReturnToWork({
    tenantId: input.tenantId,
    employeeId: input.employeeId,
    episodeId: input.episodeId,
    actualReturnDate: input.actualReturnDate,
  }, {
    actorId: input.userId,
    actorRole: "employee",
    effectiveAt: REFERENCE_AT,
  });
  if (!result.data) {
    throw new Error(result.issues.map((issue) => issue.message).join(", "));
  }

  return makeResponse({
    episodeId: result.data.id,
    status: result.data.status,
    actualEndDate: result.data.actualEndDate ?? input.actualReturnDate,
  }, input.tenantId, input.locale, employeePermissions);
};

export const getEmployerDashboard = async (tenantId: string, locale: PortalLocale): Promise<WorkflowResponse<EmployerDashboardSummary>> => {
  const { services } = getPortalWorkflowServices();
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
  const { repositories, services } = getPortalWorkflowServices();
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
): Promise<WorkflowResponse<EmployerAbsenceDetail>> => {
  if (tenantId !== EMPLOYER_TENANT_ID) {
    throw new WorkflowForbiddenError("Employer routes are only accessible to employer tenants.");
  }
  const { repositories, services } = getPortalWorkflowServices();
  const detail = await services.absenceService.getEpisodeDetail(tenantId, episodeId);
  if (!detail) {
    throw new WorkflowNotFoundError();
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
  const { repositories, services } = getPortalWorkflowServices();
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
): Promise<WorkflowResponse<EmployerCaseDetail>> => {
  if (tenantId !== EMPLOYER_TENANT_ID) {
    throw new WorkflowForbiddenError("Employer routes are only accessible to employer tenants.");
  }
  const { repositories, services } = getPortalWorkflowServices();
  const detail = await services.ktgCaseService.getCaseDetail(tenantId, caseId);
  if (!detail) {
    throw new WorkflowNotFoundError();
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
  const { repositories } = getPortalWorkflowServices();
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
  const { repositories, services } = getPortalWorkflowServices();
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
  const { services } = getPortalWorkflowServices();
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
  const { services } = getPortalWorkflowServices();
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
  const { services } = getPortalWorkflowServices();
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
): Promise<WorkflowResponse<InternalIntakeDetail>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const detail = await services.claimsService.getWorkspaceDetail(tenantId, workspaceId);
  if (!detail) {
    throw new WorkflowNotFoundError();
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
  const { repositories, services } = getPortalWorkflowServices();
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
): Promise<WorkflowResponse<InternalCaseDetail>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { repositories, services } = getPortalWorkflowServices();
  const detail = await services.ktgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, caseId);
  if (!detail) {
    throw new WorkflowNotFoundError();
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
  const { services } = getPortalWorkflowServices();
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
): Promise<WorkflowResponse<InternalBenefitDetail>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const detail = await services.benefitService.getCalculationDetail(tenantId, calculationId);
  if (!detail) {
    throw new WorkflowNotFoundError();
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

// ─── Phase 2C: Payment Operations handlers ───────────────────────────────────

export const listEmployerPaymentRunSummaries = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { page?: number; pageSize?: number },
): Promise<WorkflowResponse<EmployerPaymentRunSummary[]>> => {
  const { services } = getPortalWorkflowServices();
  const runs = await services.paymentOperationsService.listPaymentRuns(INTERNAL_TENANT_ID);
  const items: EmployerPaymentRunSummary[] = runs.map((run) => ({
    runId: run.id,
    runNumber: run.runNumber,
    totalNetAmountChf: run.totalNetAmountChf,
    instructionCount: run.instructionCount,
    runStatus: run.runStatus,
    createdAt: run.createdAt.slice(0, 10),
  }));
  const paginated = paginateItems(items, filters);
  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
  });
};

// Phase 2F: Premium Reconciliation handlers

const getOrCreatePremiumPeriod = async (
  tenantId: string,
  userId = "system",
): Promise<string> => {
  const { services } = getPortalWorkflowServices();
  const existing = await services.premiumService.listReportingPeriods(tenantId);
  if (existing[0]) return existing[0].id;
  const period = await services.premiumService.createReportingPeriod({
    tenantId,
    periodStart: "2026-01-01",
    periodEnd: "2026-12-31",
    reportingYear: 2026,
    periodType: "annual",
  }, {
    actorId: userId,
    actorRole: "employer_finance",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-premium-period",
  });
  return period.id;
};

const toPremiumDashboard = async (tenantId: string): Promise<EmployerPremiumDashboard> => {
  const { services } = getPortalWorkflowServices();
  const periodId = await getOrCreatePremiumPeriod(tenantId);
  const detail = await services.premiumService.getEmployerPremiumDashboard(tenantId, periodId);
  if (!detail) throw new WorkflowNotFoundError();
  const latestReport = detail.reports.at(-1);
  const latestCalculation = detail.calculations.at(-1);
  const latestExposure = detail.exposures.at(-1);
  return {
    periodId: detail.period.id,
    periodLabel: `${detail.period.periodStart} - ${detail.period.periodEnd}`,
    reportingStatus: detail.period.reportingStatus,
    salaryMassStatus: latestReport?.reportStatus ?? "draft",
    insuredSalaryMassChf: latestReport?.insuredSalaryMassChf ?? 0,
    claimsRatio: detail.snapshot?.claimsRatio ?? latestExposure?.claimsRatio ?? 0,
    expectedPremiumChf: detail.snapshot?.expectedPremiumChf ?? latestExposure?.expectedPremiumChf ?? 0,
    adjustmentDeltaChf: detail.snapshot?.adjustmentDeltaChf ?? latestCalculation?.deltaAmountChf ?? 0,
    adjustmentType: latestCalculation?.adjustmentType,
    openInstallmentAmountChf: detail.snapshot?.openInstallmentAmountChf ?? 0,
    latestReportId: latestReport?.id,
    latestCalculationId: latestCalculation?.id,
    installmentPlanIds: detail.plans.map((plan) => plan.id),
  };
};

export const getEmployerPremiumDashboard = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<EmployerPremiumDashboard>> => {
  if (tenantId !== EMPLOYER_TENANT_ID) throw new WorkflowForbiddenError("Employer premium routes are only accessible to employer tenants.");
  return makeResponse(await toPremiumDashboard(tenantId), tenantId, locale, employerPermissions);
};

export const submitEmployerSalaryMassReport = async (input: {
  tenantId: string; locale: PortalLocale; userId: string; annualSalaryMassChf: number; insuredSalaryMassChf: number; employeeCount: number; notes?: string;
}): Promise<WorkflowResponse<EmployerSalaryMassReportResult>> => {
  if (input.tenantId !== EMPLOYER_TENANT_ID) throw new WorkflowForbiddenError("Employer premium routes are only accessible to employer tenants.");
  const { services } = getPortalWorkflowServices();
  const periodId = await getOrCreatePremiumPeriod(input.tenantId, input.userId);
  const actor = { actorId: input.userId, actorRole: "employer_finance" as const, effectiveAt: REFERENCE_AT, correlationId: "portal-workflow-premium-salary-mass" };
  const draft = await services.premiumService.createDraftSalaryMassReport({
    tenantId: input.tenantId,
    premiumReportingPeriodId: periodId,
    annualSalaryMassChf: input.annualSalaryMassChf,
    insuredSalaryMassChf: input.insuredSalaryMassChf,
    employeeCount: input.employeeCount,
    submissionSource: "employer_portal",
    submittedBy: input.userId,
    notes: input.notes,
  }, actor);
  const submitted = await services.premiumService.submitSalaryMassReport(input.tenantId, draft.id, actor);
  return makeResponse({
    reportId: submitted.id,
    periodId: submitted.premiumReportingPeriodId,
    reportStatus: submitted.reportStatus,
    insuredSalaryMassChf: submitted.insuredSalaryMassChf,
    employeeCount: submitted.employeeCount,
  }, input.tenantId, input.locale, employerPermissions);
};

export const calculateEmployerPremiumAdjustment = async (input: {
  tenantId: string; locale: PortalLocale; userId: string; reportId: string; priorPremiumChf: number; premiumRate: number; claimsPaidChf: number; claimsReservedChf?: number;
}): Promise<WorkflowResponse<EmployerPremiumAdjustmentResult>> => {
  if (input.tenantId !== EMPLOYER_TENANT_ID) throw new WorkflowForbiddenError("Employer premium routes are only accessible to employer tenants.");
  const { services } = getPortalWorkflowServices();
  const report = await services.premiumService.getSalaryMassReportDetail(input.tenantId, input.reportId);
  if (!report) throw new WorkflowNotFoundError();
  const calculation = await services.premiumService.calculatePremiumAdjustment({
    tenantId: input.tenantId,
    premiumReportingPeriodId: report.premiumReportingPeriodId,
    salaryMassReportId: input.reportId,
    priorPremiumChf: input.priorPremiumChf,
    premiumRate: input.premiumRate,
    claimsPaidChf: input.claimsPaidChf,
    claimsReservedChf: input.claimsReservedChf,
    exposureBasis: "benefit-engine-payment-instructions",
  }, { actorId: input.userId, actorRole: "employer_finance", effectiveAt: REFERENCE_AT, correlationId: "portal-workflow-premium-adjustment" });
  return makeResponse({
    calculationId: calculation.id,
    periodId: calculation.premiumReportingPeriodId,
    reportId: calculation.salaryMassReportId,
    priorPremiumChf: calculation.priorPremiumChf,
    recalculatedPremiumChf: calculation.recalculatedPremiumChf,
    deltaAmountChf: calculation.deltaAmountChf,
    adjustmentType: calculation.adjustmentType,
    formula: calculation.formula,
    inputs: calculation.inputsJson,
  }, input.tenantId, input.locale, employerPermissions);
};

export const generateEmployerPremiumSettlement = async (input: {
  tenantId: string; locale: PortalLocale; userId: string; calculationId: string;
}): Promise<WorkflowResponse<EmployerPremiumSettlementResult>> => {
  if (input.tenantId !== EMPLOYER_TENANT_ID) throw new WorkflowForbiddenError("Employer premium routes are only accessible to employer tenants.");
  const { services } = getPortalWorkflowServices();
  const recommendation = await services.premiumService.generateSettlementRecommendation(input.tenantId, input.calculationId, { actorId: input.userId, actorRole: "employer_finance", effectiveAt: REFERENCE_AT, correlationId: "portal-workflow-premium-settlement" });
  return makeResponse({
    recommendationId: recommendation.id,
    calculationId: recommendation.premiumAdjustmentCalculationId,
    recommendationType: recommendation.recommendationType,
    grossAmountChf: recommendation.grossAmountChf,
    netAmountChf: recommendation.netAmountChf,
    settlementReason: recommendation.settlementReason,
    installmentEligibleFlag: recommendation.installmentEligibleFlag,
  }, input.tenantId, input.locale, employerPermissions);
};

export const createEmployerPremiumInstallmentPlan = async (input: {
  tenantId: string; locale: PortalLocale; userId: string; periodId: string; totalAmountChf: number; installmentCount: number; startDate: string;
}): Promise<WorkflowResponse<EmployerPremiumInstallmentPlanSummary>> => {
  if (input.tenantId !== EMPLOYER_TENANT_ID) throw new WorkflowForbiddenError("Employer premium routes are only accessible to employer tenants.");
  const { services } = getPortalWorkflowServices();
  const plan = await services.premiumService.createInstallmentPlan({
    tenantId: input.tenantId,
    premiumReportingPeriodId: input.periodId,
    totalAmountChf: input.totalAmountChf,
    installmentCount: input.installmentCount,
    startDate: input.startDate,
  }, { actorId: input.userId, actorRole: "employer_finance", effectiveAt: REFERENCE_AT, correlationId: "portal-workflow-premium-installment" });
  return makeResponse({
    planId: plan.id,
    periodId: plan.premiumReportingPeriodId,
    planStatus: plan.planStatus,
    installmentCount: plan.installmentCount,
    totalAmountChf: plan.totalAmountChf,
    openAmountChf: plan.items.filter((item) => item.installmentStatus !== "paid").reduce((sum, item) => sum + item.amountChf, 0),
    items: plan.items.map((item) => ({ itemId: item.id, dueDate: item.dueDate, amountChf: item.amountChf, installmentStatus: item.installmentStatus, reference: item.reference })),
  }, input.tenantId, input.locale, employerPermissions);
};

export const listInternalPaymentRuns = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { runStatus?: string; runType?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<InternalPaymentRunListItem[]>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const runs = await services.paymentOperationsService.listPaymentRuns(tenantId, filters);
  const items: InternalPaymentRunListItem[] = runs.map((run) => ({
    runId: run.id,
    runNumber: run.runNumber,
    runType: run.runType,
    runStatus: run.runStatus,
    instructionCount: run.instructionCount,
    totalNetAmountChf: run.totalNetAmountChf,
    reconciliationStatus: run.reconciliationStatus,
    createdAt: run.createdAt.slice(0, 10),
  }));
  const paginated = paginateItems(items, filters);
  return makeResponse(paginated.items, tenantId, locale, internalPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.runStatus ? { runStatus: filters.runStatus } : {}),
      ...(filters?.runType ? { runType: filters.runType } : {}),
    },
  });
};

export const getInternalPaymentRunDetail = async (
  tenantId: string,
  locale: PortalLocale,
  runId: string,
): Promise<WorkflowResponse<InternalPaymentRunDetail>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const detail = await services.paymentOperationsService.getPaymentRunDetail(tenantId, runId);
  if (!detail) {
    throw new WorkflowNotFoundError();
  }
  return makeResponse({
    runId: detail.id,
    runNumber: detail.runNumber,
    runType: detail.runType,
    runStatus: detail.runStatus,
    instructionCount: detail.instructionCount,
    totalGrossAmountChf: detail.totalGrossAmountChf,
    totalNetAmountChf: detail.totalNetAmountChf,
    reconciliationStatus: detail.reconciliationStatus,
    createdAt: detail.createdAt,
    createdBy: detail.createdBy,
    scheduledExecutionAt: detail.scheduledExecutionAt,
    exportedAt: detail.exportedAt,
    completedAt: detail.completedAt,
    cancelledAt: detail.cancelledAt,
    notes: detail.notes,
    items: detail.items.map((i): InternalPaymentRunItemSummary => ({
      runItemId: i.id,
      paymentInstructionId: i.paymentInstructionId,
      ktgCaseId: i.ktgCaseId,
      payeeReference: i.payeeReference,
      periodLabel: `${i.paymentPeriodStart} to ${i.paymentPeriodEnd}`,
      netAmountChf: i.netAmountChf,
      itemStatus: i.itemStatus,
    })),
    exportPackages: detail.exportPackages.map((p): InternalExportPackageSummary => ({
      exportId: p.id,
      exportFormat: p.exportFormat,
      fileName: p.fileName,
      exportStatus: p.exportStatus,
      generatedAt: p.generatedAt,
      generatedBy: p.generatedBy,
    })),
    statements: detail.statements.map((s): InternalStatementSummary => ({
      statementId: s.id,
      statementType: s.statementType,
      ktgCaseId: s.ktgCaseId,
      periodLabel: `${s.statementPeriodStart} to ${s.statementPeriodEnd}`,
      fileName: s.fileName,
      pdfSizeBytes: s.pdfSizeBytes,
      generatedAt: s.generatedAt,
    })),
    reconciliation: detail.reconciliationRecord
      ? ({
          reconciliationId: detail.reconciliationRecord.id,
          paymentRunId: detail.reconciliationRecord.paymentRunId,
          reconciliationStatus: detail.reconciliationRecord.reconciliationStatus,
          reconciledAt: detail.reconciliationRecord.reconciledAt,
          reconciledBy: detail.reconciliationRecord.reconciledBy,
          mismatchReason: detail.reconciliationRecord.mismatchReason,
          payrollBookingReference: detail.reconciliationRecord.payrollBookingReference,
          confirmationReceivedAt: detail.reconciliationRecord.confirmationReceivedAt,
        } satisfies InternalReconciliationRecord)
      : undefined,
    bookingReference: detail.bookingConfirmation?.confirmationReference,
  } satisfies InternalPaymentRunDetail, tenantId, locale, internalPermissions);
};

export const getInternalMonthEndReport = async (
  tenantId: string,
  locale: PortalLocale,
): Promise<WorkflowResponse<InternalMonthEndReport>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const [runs, reconRecords] = await Promise.all([
    services.paymentOperationsService.listPaymentRuns(tenantId),
    services.paymentOperationsService.listReconciliationRecords(tenantId),
  ]);

  const reconByRunId = new Map(reconRecords.map((r) => [r.paymentRunId, r]));
  const entries: InternalMonthEndReportEntry[] = runs.map((run) => {
    const recon = reconByRunId.get(run.id);
    return {
      runId: run.id,
      runNumber: run.runNumber,
      runStatus: run.runStatus,
      totalNetAmountChf: run.totalNetAmountChf,
      reconciliationStatus: run.reconciliationStatus,
      exportedAt: run.exportedAt,
      completedAt: run.completedAt,
      mismatch: recon?.reconciliationStatus === "mismatch",
      bookingReference: recon?.payrollBookingReference,
    };
  });

  const totalNetAmountChf = runs.reduce((sum, r) => sum + r.totalNetAmountChf, 0);
  const confirmed = runs.filter((r) => r.reconciliationStatus === "confirmed").length;
  const mismatches = runs.filter((r) => reconByRunId.get(r.id)?.reconciliationStatus === "mismatch").length;
  const unresolved = runs.filter(
    (r) => r.runStatus !== "cancelled" && r.reconciliationStatus !== "confirmed",
  ).length;

  return makeResponse({
    reportGeneratedAt: REFERENCE_AT,
    totalRuns: runs.length,
    totalNetAmountChf,
    confirmed,
    unresolved,
    mismatches,
    entries,
  } satisfies InternalMonthEndReport, tenantId, locale, internalPermissions);
};

export const listInternalReconciliationRecords = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { reconciliationStatus?: string },
): Promise<WorkflowResponse<InternalReconciliationRecord[]>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const records = await services.paymentOperationsService.listReconciliationRecords(tenantId, filters);
  const items: InternalReconciliationRecord[] = records.map((r) => ({
    reconciliationId: r.id,
    paymentRunId: r.paymentRunId,
    reconciliationStatus: r.reconciliationStatus,
    reconciledAt: r.reconciledAt,
    reconciledBy: r.reconciledBy,
    mismatchReason: r.mismatchReason,
    payrollBookingReference: r.payrollBookingReference,
    confirmationReceivedAt: r.confirmationReceivedAt,
  }));
  return makeResponse(items, tenantId, locale, internalPermissions);
};

export const getInternalSettlementSummary = async (
  tenantId: string,
  locale: PortalLocale,
  ktgCaseId: string,
): Promise<WorkflowResponse<InternalSettlementSummary>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const summary = await services.paymentOperationsService.getSettlementSummaryByCase(tenantId, ktgCaseId);
  if (!summary) {
    throw new WorkflowNotFoundError();
  }
  return makeResponse({
    summaryId: summary.id,
    ktgCaseId: summary.ktgCaseId,
    latestPaymentRunId: summary.latestPaymentRunId,
    totalGrossPaidChf: summary.totalGrossPaidChf,
    totalNetPaidChf: summary.totalNetPaidChf,
    totalPayableDays: summary.totalPayableDays,
    lastStatementAt: summary.lastStatementAt,
    settlementStatus: summary.settlementStatus,
    updatedAt: summary.updatedAt,
  } satisfies InternalSettlementSummary, tenantId, locale, internalPermissions);
};

export const listInternalPaymentAuditEvents = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { runId?: string },
): Promise<WorkflowResponse<InternalPaymentAuditEventItem[]>> => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");
  }
  const { services } = getPortalWorkflowServices();
  const events = await services.paymentOperationsService.listAuditEvents(tenantId, filters);
  const items: InternalPaymentAuditEventItem[] = events.map((e) => ({
    eventId: e.id,
    paymentRunId: e.paymentRunId,
    eventType: e.eventType,
    occurredAt: e.occurredAt,
    actorId: e.actorId,
    actorRole: e.actorRole,
    payload: e.payload,
  }));
  return makeResponse(items, tenantId, locale, internalPermissions);
};

// Phase 2E: UVG Native Flow handlers
// Internal UVG routes intentionally read employer-originated UVG case truth from
// the employer tenant fixture/service context while keeping the caller tenant as
// internal. Cross-tenant visibility is explicit here instead of implicit in the
// repository adapter.

const assertEmployerTenant = (tenantId: string): void => {
  if (tenantId !== EMPLOYER_TENANT_ID) {
    throw new WorkflowForbiddenError("Employer UVG routes are only accessible to employer tenants.");
  }
};

const assertInternalTenant = (tenantId: string): void => {
  if (tenantId !== INTERNAL_TENANT_ID) {
    throw new WorkflowForbiddenError("Internal UVG routes are only accessible to internal tenants.");
  }
};

const mapEmployerUvgListItem = (detail: UvgCaseDetail): EmployerUvgCaseListItem => ({
  caseId: detail.id,
  caseNumber: detail.caseNumber,
  employeeId: detail.employeeId,
  employeeName: getEmployeeName(detail.employeeId),
  uvgCaseType: detail.uvgCaseType,
  caseStatus: detail.caseStatus,
  accidentDate: detail.accidentDate,
  incidentLocation: detail.incidentLocation,
  coordinationStatus: detail.coordinationStatus,
  linkedKtgCaseId: detail.ktgCaseId,
  reportArtifactCount: detail.reportArtifacts.length,
});

const mapEmployerUvgDetail = (detail: UvgCaseDetail): EmployerUvgCaseDetail => ({
  ...mapEmployerUvgListItem(detail),
  incidentSummary: detail.incidentSummary,
  reportedAt: detail.reportedAt,
  accidentDescription: detail.intake?.accidentDescription,
  witnessDetails: detail.intake?.witnessDetails,
  policeInvolvedFlag: detail.intake?.policeInvolvedFlag,
  linkedDocumentIds: detail.documentReferences.map((reference) => reference.documentId),
  reportArtifacts: detail.reportArtifacts.map((artifact) => ({
    artifactId: artifact.id,
    fileName: artifact.fileName,
    reportType: artifact.reportType,
    generatedAt: artifact.generatedAt,
  })),
});

const mapInternalUvgListItem = (detail: UvgCaseDetail): InternalUvgCaseListItem => ({
  caseId: detail.id,
  caseNumber: detail.caseNumber,
  employeeId: detail.employeeId,
  employeeName: getEmployeeName(detail.employeeId),
  uvgCaseType: detail.uvgCaseType,
  caseStatus: detail.caseStatus,
  accidentDate: detail.accidentDate,
  coordinationStatus: detail.coordinationStatus,
  linkedKtgCaseId: detail.ktgCaseId,
  injuryCount: detail.injuries.length,
  decisionStatus: detail.decisions.at(0)?.decisionStatus,
});

const mapInternalUvgDetail = (detail: UvgCaseDetail): InternalUvgCaseDetail => ({
  ...mapInternalUvgListItem(detail),
  policyId: detail.policyId,
  incidentLocation: detail.incidentLocation,
  incidentSummary: detail.incidentSummary,
  intake: detail.intake ? {
    reporterRole: detail.intake.reporterRole,
    employerReference: detail.intake.employerReference,
    accidentTime: detail.intake.accidentTime,
    accidentPlace: detail.intake.accidentPlace,
    occupationalContext: detail.intake.occupationalContext,
    accidentDescription: detail.intake.accidentDescription,
    witnessDetails: detail.intake.witnessDetails,
    policeInvolvedFlag: detail.intake.policeInvolvedFlag,
    submittedAt: detail.intake.submittedAt,
  } : undefined,
  injuries: detail.injuries.map((injury) => ({
    id: injury.id,
    injuryType: injury.injuryType,
    bodyPart: injury.bodyPart,
    severity: injury.severity,
    medicalTreatmentFlag: injury.medicalTreatmentFlag,
    hospitalizedFlag: injury.hospitalizedFlag,
    notes: injury.notes,
  })),
  circumstances: detail.circumstances.map((circumstance) => ({
    id: circumstance.id,
    causeCategory: circumstance.causeCategory,
    activityContext: circumstance.activityContext,
    thirdPartyInvolvedFlag: circumstance.thirdPartyInvolvedFlag,
    vehicleInvolvedFlag: circumstance.vehicleInvolvedFlag,
    narrative: circumstance.narrative,
    createdAt: circumstance.createdAt,
  })),
  documentReferences: detail.documentReferences.map((reference) => ({
    id: reference.id,
    documentId: reference.documentId,
    documentRole: reference.documentRole,
    linkedAt: reference.linkedAt,
  })),
  coordinationRecords: detail.coordinationRecords.map((record) => ({
    id: record.id,
    coordinationType: record.coordinationType,
    relatedKtgCaseId: record.relatedKtgCaseId,
    overlapStart: record.overlapStart,
    overlapEnd: record.overlapEnd,
    coordinationStatus: record.coordinationStatus,
    benefitOverlapFlag: record.benefitOverlapFlag,
    notes: record.notes,
    updatedAt: record.updatedAt,
  })),
  decisions: detail.decisions.map((decision) => ({
    id: decision.id,
    decisionStatus: decision.decisionStatus,
    decisionReason: decision.decisionReason,
    effectiveFrom: decision.effectiveFrom,
    effectiveTo: decision.effectiveTo,
    decidedAt: decision.decidedAt,
    decidedBy: decision.decidedBy,
  })),
  reportArtifacts: detail.reportArtifacts.map((artifact) => ({
    artifactId: artifact.id,
    fileName: artifact.fileName,
    reportType: artifact.reportType,
    generatedAt: artifact.generatedAt,
    storageReference: artifact.storageReference,
  })),
  auditEvents: detail.auditEvents.map((event) => ({
    eventId: event.id,
    eventType: event.eventType,
    occurredAt: event.occurredAt,
    actorId: event.actorId,
    actorRole: event.actorRole,
    payload: event.payload,
  })),
});

const getUvgCaseDetailOr404 = async (caseId: string): Promise<UvgCaseDetail> => {
  const { services } = getPortalWorkflowServices();
  const detail = await services.uvgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, caseId);
  if (!detail) {
    throw new WorkflowNotFoundError();
  }
  return detail;
};

const issueMessage = (issues: Array<{ field: string; message: string }>): string =>
  issues.map((issue) => `${issue.field}: ${issue.message}`).join("; ") || "UVG command failed.";

export const listEmployerUvgCases = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; type?: string; employee?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<EmployerUvgCaseListItem[]>> => {
  assertEmployerTenant(tenantId);
  const { services } = getPortalWorkflowServices();
  const cases = await services.uvgCaseService.listCases(tenantId, {
    status: filters?.status,
    type: filters?.type,
    employeeId: filters?.employee,
  });
  const details = await Promise.all(cases.map((uvgCase) => services.uvgCaseService.getCaseDetail(tenantId, uvgCase.id)));
  const items = details.filter((detail): detail is UvgCaseDetail => detail !== null).map(mapEmployerUvgListItem);
  const paginated = paginateItems(items, filters);
  return makeResponse(paginated.items, tenantId, locale, employerPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
};

export const getEmployerUvgCaseDetail = async (
  tenantId: string,
  locale: PortalLocale,
  caseId: string,
): Promise<WorkflowResponse<EmployerUvgCaseDetail>> => {
  assertEmployerTenant(tenantId);
  const detail = await getUvgCaseDetailOr404(caseId);
  return makeResponse(mapEmployerUvgDetail(detail), tenantId, locale, employerPermissions, undefined);
};

export const createEmployerUvgAccidentReport = async (input: {
  tenantId: string;
  locale: PortalLocale;
  employeeId: string;
  policyId: string;
  userId: string;
  uvgCaseType: string;
  accidentDate: string;
  accidentTime?: string;
  accidentPlace: string;
  occupationalContext: string;
  accidentDescription: string;
  witnessDetails?: string;
  policeInvolvedFlag: boolean;
  ktgCaseId?: string;
}): Promise<WorkflowResponse<EmployerUvgAccidentReportResult>> => {
  assertEmployerTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.createAccidentReport({
    tenantId: input.tenantId,
    employeeId: input.employeeId,
    policyId: input.policyId,
    uvgCaseType: input.uvgCaseType as UvgCaseType,
    reporterRole: "employer",
    reporterUserId: input.userId,
    employerReference: `EMP-${input.accidentDate}`,
    accidentDate: input.accidentDate,
    accidentTime: input.accidentTime,
    accidentPlace: input.accidentPlace,
    occupationalContext: input.occupationalContext as OccupationalContext,
    accidentDescription: input.accidentDescription,
    witnessDetails: input.witnessDetails,
    policeInvolvedFlag: input.policeInvolvedFlag,
    ktgCaseId: input.ktgCaseId || undefined,
  }, {
    actorId: input.userId,
    actorRole: "employer_user",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-employer-uvg-report",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return makeResponse({
    caseId: result.data.id,
    caseNumber: result.data.caseNumber,
    caseStatus: result.data.caseStatus,
    uvgCaseType: result.data.uvgCaseType,
    reportedAt: result.data.reportedAt,
  }, input.tenantId, input.locale, employerPermissions);
};

export const generateEmployerUvgAccidentReportArtifact = async (
  input: { tenantId: string; locale: PortalLocale; caseId: string; userId: string },
): Promise<WorkflowResponse<EmployerUvgReportArtifactResult>> => {
  assertEmployerTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.generateAccidentReport(input.tenantId, input.caseId, {
    actorId: input.userId,
    actorRole: "employer_user",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-employer-uvg-report-artifact",
  });
  if (!result.data) {
    throw new WorkflowNotFoundError(issueMessage(result.issues));
  }
  return makeResponse({
    artifactId: result.data.id,
    caseId: result.data.uvgCaseId,
    fileName: result.data.fileName,
    storageReference: result.data.storageReference,
    generatedAt: result.data.generatedAt,
    pdfSizeBytes: result.data.pdfSizeBytes,
  }, input.tenantId, input.locale, employerPermissions);
};

export const listInternalUvgCases = async (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; type?: string; employee?: string; page?: number; pageSize?: number },
): Promise<WorkflowResponse<InternalUvgCaseListItem[]>> => {
  assertInternalTenant(tenantId);
  const { services } = getPortalWorkflowServices();
  const cases = await services.uvgCaseService.listCases(EMPLOYER_TENANT_ID, {
    status: filters?.status,
    type: filters?.type,
    employeeId: filters?.employee,
  });
  const details = await Promise.all(cases.map((uvgCase) => services.uvgCaseService.getCaseDetail(EMPLOYER_TENANT_ID, uvgCase.id)));
  const items = details.filter((detail): detail is UvgCaseDetail => detail !== null).map(mapInternalUvgListItem);
  const paginated = paginateItems(items, filters);
  return makeResponse(paginated.items, tenantId, locale, internalPermissions, {
    totalCount: paginated.totalCount,
    page: paginated.page,
    pageSize: paginated.pageSize,
    totalPages: paginated.totalPages,
    appliedFilters: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.type ? { type: filters.type } : {}),
      ...(filters?.employee ? { employee: filters.employee } : {}),
    },
  });
};

export const getInternalUvgCaseDetail = async (
  tenantId: string,
  locale: PortalLocale,
  caseId: string,
): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(tenantId);
  const detail = await getUvgCaseDetailOr404(caseId);
  return makeResponse(mapInternalUvgDetail(detail), tenantId, locale, internalPermissions);
};

const withUpdatedInternalUvgDetail = async (
  tenantId: string,
  locale: PortalLocale,
  caseId: string,
): Promise<WorkflowResponse<InternalUvgCaseDetail>> => getInternalUvgCaseDetail(tenantId, locale, caseId);

export const updateInternalUvgCaseStatus = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  caseStatus: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.updateCaseStatus(EMPLOYER_TENANT_ID, input.caseId, input.caseStatus as UvgCaseStatus, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-status",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};

export const recordInternalUvgInjury = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  injuryType: string;
  bodyPart: string;
  severity: string;
  medicalTreatmentFlag: boolean;
  hospitalizedFlag: boolean;
  notes?: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.recordInjury({
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: input.caseId,
    injuryType: input.injuryType,
    bodyPart: input.bodyPart,
    severity: input.severity as "minor" | "moderate" | "severe" | "critical",
    medicalTreatmentFlag: input.medicalTreatmentFlag,
    hospitalizedFlag: input.hospitalizedFlag,
    notes: input.notes,
  }, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-injury",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};

export const recordInternalUvgCircumstance = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  causeCategory: string;
  activityContext: string;
  thirdPartyInvolvedFlag: boolean;
  vehicleInvolvedFlag: boolean;
  narrative: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.recordCircumstance({
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: input.caseId,
    causeCategory: input.causeCategory,
    activityContext: input.activityContext,
    thirdPartyInvolvedFlag: input.thirdPartyInvolvedFlag,
    vehicleInvolvedFlag: input.vehicleInvolvedFlag,
    narrative: input.narrative,
  }, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-circumstance",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};

export const upsertInternalUvgCoordination = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  coordinationType: string;
  relatedKtgCaseId?: string;
  overlapStart?: string;
  overlapEnd?: string;
  coordinationStatus: string;
  benefitOverlapFlag: boolean;
  notes?: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.upsertCoordination({
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: input.caseId,
    coordinationType: input.coordinationType as "ktg_overlap" | "complementary_uvg" | "benefit_overlap_review",
    relatedKtgCaseId: input.relatedKtgCaseId || undefined,
    overlapStart: input.overlapStart || undefined,
    overlapEnd: input.overlapEnd || undefined,
    coordinationStatus: input.coordinationStatus as "not_required" | "open" | "in_review" | "resolved",
    benefitOverlapFlag: input.benefitOverlapFlag,
    notes: input.notes,
  }, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-coordination",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};

export const linkInternalUvgDocument = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  documentId: string;
  documentRole: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.linkDocument({
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: input.caseId,
    documentId: input.documentId,
    documentRole: input.documentRole as "accident_report" | "medical_certificate" | "police_report" | "correspondence" | "other",
  }, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-document",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};

export const upsertInternalUvgDecision = async (input: {
  tenantId: string;
  locale: PortalLocale;
  caseId: string;
  userId: string;
  decisionStatus: string;
  decisionReason: string;
  effectiveFrom: string;
  effectiveTo?: string;
}): Promise<WorkflowResponse<InternalUvgCaseDetail>> => {
  assertInternalTenant(input.tenantId);
  const { services } = getPortalWorkflowServices();
  const result = await services.uvgCaseService.upsertDecision({
    tenantId: EMPLOYER_TENANT_ID,
    uvgCaseId: input.caseId,
    decisionStatus: input.decisionStatus as "pending" | "approved" | "rejected" | "partially_approved",
    decisionReason: input.decisionReason,
    effectiveFrom: input.effectiveFrom,
    effectiveTo: input.effectiveTo || undefined,
    decidedBy: input.userId,
  }, {
    actorId: input.userId,
    actorRole: "claims_handler",
    effectiveAt: REFERENCE_AT,
    correlationId: "portal-workflow-internal-uvg-decision",
  });
  if (!result.data) {
    throw new Error(issueMessage(result.issues));
  }
  return withUpdatedInternalUvgDetail(input.tenantId, input.locale, input.caseId);
};
