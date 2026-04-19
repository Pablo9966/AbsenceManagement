// Demo wiring for portal-workflow-service
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
import {
  AbsenceMemoryRepository,
  KtgCaseMemoryRepository,
  DocumentMemoryRepository,
  ClaimsIntakeWorkspaceMemoryRepository,
  BenefitEngineMemoryRepository,
  DashboardProjectionMemoryRepository,
  InboxNotificationMemoryRepository,
  PaymentOperationsMemoryRepository,
  PaymentOperationsService,
  UvgCaseMemoryRepository,
  UvgCaseService,
  PremiumReconciliationMemoryRepository,
  PremiumReconciliationService,
} from "../adapters/memory-repositories.js";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type F<T> = T[];
import {
  paymentRuns as _paymentRuns,
  paymentRunItems as _paymentRunItems,
  exportPackages as _exportPackages,
  paymentStatements as _paymentStatements,
  settlementSummaries as _settlementSummaries,
  reconciliationRecords as _reconciliationRecords,
  bookingConfirmations as _bookingConfirmations,
  paymentAuditEvents as _paymentAuditEvents,
  uvgCases as _uvgCases,
  uvgAccidentIntakes as _uvgAccidentIntakes,
  uvgInjuryRecords as _uvgInjuryRecords,
  uvgCircumstanceRecords as _uvgCircumstanceRecords,
  uvgDocumentReferences as _uvgDocumentReferences,
  uvgDecisions as _uvgDecisions,
  uvgCoordinationRecords as _uvgCoordinationRecords,
  uvgReportArtifacts as _uvgReportArtifacts,
  uvgAuditEvents as _uvgAuditEvents,
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
} from "../testing/demo-fixtures.js";

import type {
  PaymentRun,
  PaymentRunItem,
  PaymentExportPackage,
  PaymentStatement,
  CaseSettlementSummary,
  PaymentReconciliationRecord,
  PayrollBookingConfirmation,
  PaymentOperationsAuditEvent,
} from "../../../payment-operations-service/src/index.js";
import type {
  UvgAccidentIntake,
  UvgAccidentReportArtifact,
  UvgCase,
  UvgCaseAuditEvent,
  UvgCaseDecision,
  UvgCircumstanceRecord,
  UvgCoordinationRecord,
  UvgDocumentReference,
  UvgInjuryRecord,
} from "../../../uvg-case-service/src/index.js";

// Cast fixture arrays from generic FixtureArray to the domain types derived from
// the repository interfaces already imported above.
const paymentRuns = _paymentRuns as F<PaymentRun>;
const paymentRunItems = _paymentRunItems as F<PaymentRunItem>;
const exportPackages = _exportPackages as F<PaymentExportPackage>;
const paymentStatements = _paymentStatements as F<PaymentStatement>;
const settlementSummaries = _settlementSummaries as F<CaseSettlementSummary>;
const reconciliationRecords = _reconciliationRecords as F<PaymentReconciliationRecord>;
const bookingConfirmations = _bookingConfirmations as F<PayrollBookingConfirmation>;
const paymentAuditEvents = _paymentAuditEvents as F<PaymentOperationsAuditEvent>;
const uvgCases = _uvgCases as F<UvgCase>;
const uvgAccidentIntakes = _uvgAccidentIntakes as F<UvgAccidentIntake>;
const uvgInjuryRecords = _uvgInjuryRecords as F<UvgInjuryRecord>;
const uvgCircumstanceRecords = _uvgCircumstanceRecords as F<UvgCircumstanceRecord>;
const uvgDocumentReferences = _uvgDocumentReferences as F<UvgDocumentReference>;
const uvgDecisions = _uvgDecisions as F<UvgCaseDecision>;
const uvgCoordinationRecords = _uvgCoordinationRecords as F<UvgCoordinationRecord>;
const uvgReportArtifacts = _uvgReportArtifacts as F<UvgAccidentReportArtifact>;
const uvgAuditEvents = _uvgAuditEvents as F<UvgCaseAuditEvent>;

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

export const createServices = () => {
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
  const paymentOperationsRepository = new PaymentOperationsMemoryRepository(
    clone(paymentRuns),
    clone(paymentRunItems),
    clone(exportPackages),
    clone(paymentStatements),
    clone(settlementSummaries),
    clone(reconciliationRecords),
    clone(bookingConfirmations),
    clone(paymentAuditEvents),
  );
  const uvgCaseRepository = new UvgCaseMemoryRepository(
    clone(uvgCases),
    clone(uvgAccidentIntakes),
    clone(uvgInjuryRecords),
    clone(uvgCircumstanceRecords),
    clone(uvgDocumentReferences),
    clone(uvgDecisions),
    clone(uvgCoordinationRecords),
    clone(uvgReportArtifacts),
    clone(uvgAuditEvents),
  );
  const premiumRepository = new PremiumReconciliationMemoryRepository();

  return {
    repositories: {
      absenceRepository,
      ktgCaseRepository,
      documentRepository,
      claimsRepository,
      benefitRepository,
      dashboardRepository,
      inboxRepository,
      paymentOperationsRepository,
      uvgCaseRepository,
      premiumRepository,
    },
    services: {
      absenceService: new AbsenceRecordingService(absenceRepository),
      ktgCaseService: new KtgCaseService(ktgCaseRepository),
      documentService: new DocumentService(documentRepository),
      claimsService: new ClaimsIntakeWorkspaceService(claimsRepository),
      benefitService: new BenefitEngineService(benefitRepository),
      dashboardService: new DashboardProjectionService(dashboardRepository),
      inboxService: new InboxNotificationService(inboxRepository),
      paymentOperationsService: new PaymentOperationsService(paymentOperationsRepository),
      uvgCaseService: new UvgCaseService(uvgCaseRepository),
      premiumService: new PremiumReconciliationService(premiumRepository),
    },
  };
};
