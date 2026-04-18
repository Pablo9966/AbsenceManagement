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
import {
  PaymentOperationsService,
  type PaymentOperationsRepository,
} from "../../payment-operations-service/src/index.js";

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
