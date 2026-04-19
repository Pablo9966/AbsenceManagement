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
  EmployerAnalyticsDashboard,
  EmployerAnalyticsGranularity,
  EmployerAnalyticsRefreshResult,
  EmployerCaseDetail,
  EmployerCaseListItem,
  EmployerDashboardSummary,
  EmployerDocumentListItem,
  EmployerPaymentSummary,
  EmployerPaymentRunSummary,
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
  InternalMonthEndReport,
  InternalPaymentAuditEventItem,
  InternalPaymentRunDetail,
  InternalPaymentRunListItem,
  InternalReconciliationRecord,
  InternalSettlementSummary,
  InternalUvgCaseDetail,
  InternalUvgCaseListItem,
  PortalLocale,
  WorkflowListQuery,
  WorkflowResponse,
} from "./types.js";

export interface PortalWorkflowClient {
  getEmployeeDashboard(input: { tenantId: string; locale: PortalLocale; employeeId: string }): Promise<WorkflowResponse<EmployeeDashboardSummary>>;
  listEmployeeAbsences(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    status?: string;
  }): Promise<WorkflowResponse<EmployeeAbsenceListItem[]>>;
  getEmployeeAbsenceDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    episodeId: string;
  }): Promise<WorkflowResponse<EmployeeAbsenceDetail>>;
  listEmployeeDocuments(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    status?: string;
  }): Promise<WorkflowResponse<EmployeeDocumentListItem[]>>;
  getEmployeeDocumentDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    documentId: string;
  }): Promise<WorkflowResponse<EmployeeDocumentDetail>>;
  getEmployeeStatusSummary(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
  }): Promise<WorkflowResponse<EmployeeStatusSummary>>;
  getEmployeeReturnToWorkState(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
  }): Promise<WorkflowResponse<EmployeeReturnToWorkState[]>>;
  submitEmployeeAbsence(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    userId: string;
    absenceType: string;
    startDate: string;
    expectedEndDate?: string;
    comment?: string;
  }): Promise<WorkflowResponse<EmployeeAbsenceSubmissionResult>>;
  uploadEmployeeCertificate(input: {
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
  }): Promise<WorkflowResponse<EmployeeCertificateUploadResult>>;
  confirmEmployeeReturnToWork(input: {
    tenantId: string;
    locale: PortalLocale;
    employeeId: string;
    userId: string;
    episodeId: string;
    actualReturnDate: string;
  }): Promise<WorkflowResponse<EmployeeReturnToWorkResult>>;
  getEmployerPremiumDashboard(input: {
    tenantId: string;
    locale: PortalLocale;
    periodId?: string;
  }): Promise<WorkflowResponse<EmployerPremiumDashboard>>;
  submitEmployerSalaryMassReport(input: {
    tenantId: string;
    locale: PortalLocale;
    userId: string;
    annualSalaryMassChf: number;
    insuredSalaryMassChf: number;
    employeeCount: number;
    notes?: string;
  }): Promise<WorkflowResponse<EmployerSalaryMassReportResult>>;
  calculateEmployerPremiumAdjustment(input: {
    tenantId: string;
    locale: PortalLocale;
    userId: string;
    reportId: string;
    priorPremiumChf: number;
    premiumRate: number;
    claimsPaidChf: number;
    claimsReservedChf?: number;
  }): Promise<WorkflowResponse<EmployerPremiumAdjustmentResult>>;
  generateEmployerPremiumSettlement(input: {
    tenantId: string;
    locale: PortalLocale;
    userId: string;
    calculationId: string;
  }): Promise<WorkflowResponse<EmployerPremiumSettlementResult>>;
  createEmployerPremiumInstallmentPlan(input: {
    tenantId: string;
    locale: PortalLocale;
    userId: string;
    periodId: string;
    totalAmountChf: number;
    installmentCount: number;
    startDate: string;
  }): Promise<WorkflowResponse<EmployerPremiumInstallmentPlanSummary>>;
  getEmployerAnalyticsDashboard(input: {
    tenantId: string;
    locale: PortalLocale;
    periodStart?: string;
    periodEnd?: string;
    granularity?: EmployerAnalyticsGranularity;
    cause?: string;
    status?: string;
    caseType?: string;
  }): Promise<WorkflowResponse<EmployerAnalyticsDashboard>>;
  refreshEmployerAnalytics(input: {
    tenantId: string;
    locale: PortalLocale;
    userId: string;
    periodStart?: string;
    periodEnd?: string;
    granularity?: EmployerAnalyticsGranularity;
  }): Promise<WorkflowResponse<EmployerAnalyticsRefreshResult>>;

  // Phase 2C: Payment Operations — Employer (read-only)
  listEmployerPaymentRunSummaries(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
  }): Promise<WorkflowResponse<EmployerPaymentRunSummary[]>>;
  listEmployerUvgCases(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    type?: string;
    employee?: string;
  }): Promise<WorkflowResponse<EmployerUvgCaseListItem[]>>;
  getEmployerUvgCaseDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
  }): Promise<WorkflowResponse<EmployerUvgCaseDetail>>;
  createEmployerUvgAccidentReport(input: {
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
  }): Promise<WorkflowResponse<EmployerUvgAccidentReportResult>>;
  generateEmployerUvgAccidentReportArtifact(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
    userId: string;
  }): Promise<WorkflowResponse<EmployerUvgReportArtifactResult>>;

  // Phase 2C: Payment Operations — Internal
  listInternalPaymentRuns(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    runStatus?: string;
    runType?: string;
  }): Promise<WorkflowResponse<InternalPaymentRunListItem[]>>;
  getInternalPaymentRunDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    runId: string;
  }): Promise<WorkflowResponse<InternalPaymentRunDetail>>;
  getInternalMonthEndReport(input: {
    tenantId: string;
    locale: PortalLocale;
  }): Promise<WorkflowResponse<InternalMonthEndReport>>;
  listInternalReconciliationRecords(input: {
    tenantId: string;
    locale: PortalLocale;
    reconciliationStatus?: string;
  }): Promise<WorkflowResponse<InternalReconciliationRecord[]>>;
  getInternalSettlementSummary(input: {
    tenantId: string;
    locale: PortalLocale;
    ktgCaseId: string;
  }): Promise<WorkflowResponse<InternalSettlementSummary>>;
  listInternalPaymentAuditEvents(input: {
    tenantId: string;
    locale: PortalLocale;
    runId?: string;
  }): Promise<WorkflowResponse<InternalPaymentAuditEventItem[]>>;
  listInternalUvgCases(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    type?: string;
    employee?: string;
  }): Promise<WorkflowResponse<InternalUvgCaseListItem[]>>;
  getInternalUvgCaseDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  updateInternalUvgCaseStatus(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
    userId: string;
    caseStatus: string;
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  recordInternalUvgInjury(input: {
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
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  recordInternalUvgCircumstance(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
    userId: string;
    causeCategory: string;
    activityContext: string;
    thirdPartyInvolvedFlag: boolean;
    vehicleInvolvedFlag: boolean;
    narrative: string;
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  upsertInternalUvgCoordination(input: {
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
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  linkInternalUvgDocument(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
    userId: string;
    documentId: string;
    documentRole: string;
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;
  upsertInternalUvgDecision(input: {
    tenantId: string;
    locale: PortalLocale;
    caseId: string;
    userId: string;
    decisionStatus: string;
    decisionReason: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }): Promise<WorkflowResponse<InternalUvgCaseDetail>>;

  getEmployerDashboard(input: { tenantId: string; locale: PortalLocale }): Promise<WorkflowResponse<EmployerDashboardSummary>>;
  listEmployerAbsences(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    employee?: string;
  }): Promise<WorkflowResponse<EmployerAbsenceListItem[]>>;
  getEmployerAbsenceDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    episodeId: string;
  }): Promise<WorkflowResponse<EmployerAbsenceDetail>>;
  listEmployerCases(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    employee?: string;
  }): Promise<WorkflowResponse<EmployerCaseListItem[]>>;
  getEmployerCaseDetail(input: { tenantId: string; locale: PortalLocale; caseId: string }): Promise<WorkflowResponse<EmployerCaseDetail>>;
  listEmployerDocuments(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    employee?: string;
  }): Promise<WorkflowResponse<EmployerDocumentListItem[]>>;
  listEmployerTasks(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
  }): Promise<WorkflowResponse<EmployerTaskListItem[]>>;
  listEmployerPayments(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
  }): Promise<WorkflowResponse<EmployerPaymentSummary[]>>;
  getInternalDashboard(input: { tenantId: string; locale: PortalLocale }): Promise<WorkflowResponse<InternalDashboardSummary>>;
  listInternalIntake(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    assignedHandler?: string;
    assignedTeam?: string;
    overdue?: string;
  }): Promise<WorkflowResponse<InternalIntakeListItem[]>>;
  getInternalIntakeDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    workspaceId: string;
  }): Promise<WorkflowResponse<InternalIntakeDetail>>;
  listInternalCases(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    employee?: string;
  }): Promise<WorkflowResponse<InternalCaseListItem[]>>;
  getInternalCaseDetail(input: { tenantId: string; locale: PortalLocale; caseId: string }): Promise<WorkflowResponse<InternalCaseDetail>>;
  listInternalBenefits(input: WorkflowListQuery & {
    tenantId: string;
    locale: PortalLocale;
    status?: string;
    caseId?: string;
  }): Promise<WorkflowResponse<InternalBenefitListItem[]>>;
  getInternalBenefitDetail(input: {
    tenantId: string;
    locale: PortalLocale;
    calculationId: string;
  }): Promise<WorkflowResponse<InternalBenefitDetail>>;
}

const readJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    throw new Error(`Portal workflow request failed with ${response.status}.`);
  }

  return response.json() as Promise<T>;
};

const toQueryString = (input: object): string => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input as Record<string, string | number | undefined>)) {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  }

  const rendered = params.toString();
  return rendered ? `?${rendered}` : "";
};

export const createPortalWorkflowClient = (input: {
  baseUrl: string;
  fetchFn?: typeof fetch;
}): PortalWorkflowClient => {
  const fetchFn = input.fetchFn ?? fetch;
  const withBaseUrl = (path: string): string => `${input.baseUrl.replace(/\/$/, "")}${path}`;

  return {
    async getEmployeeDashboard(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/dashboard${toQueryString(params)}`)));
    },
    async listEmployeeAbsences(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/absences${toQueryString(params)}`)));
    },
    async getEmployeeAbsenceDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/absences/${params.episodeId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
        employeeId: params.employeeId,
      })}`)));
    },
    async listEmployeeDocuments(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/documents${toQueryString(params)}`)));
    },
    async getEmployeeDocumentDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/documents/${params.documentId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
        employeeId: params.employeeId,
      })}`)));
    },
    async getEmployeeStatusSummary(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/status${toQueryString(params)}`)));
    },
    async getEmployeeReturnToWorkState(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employee/return-to-work${toQueryString(params)}`)));
    },
    async submitEmployeeAbsence(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employee/report-absence"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async uploadEmployeeCertificate(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employee/documents/upload"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async confirmEmployeeReturnToWork(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employee/return-to-work"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async getEmployerPremiumDashboard(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/premium/dashboard${toQueryString(params)}`)));
    },
    async submitEmployerSalaryMassReport(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/premium/salary-mass-report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async calculateEmployerPremiumAdjustment(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/premium/adjustment"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async generateEmployerPremiumSettlement(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/premium/settlement"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async createEmployerPremiumInstallmentPlan(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/premium/installment-plan"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async getEmployerAnalyticsDashboard(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/analytics${toQueryString(params)}`)));
    },
    async refreshEmployerAnalytics(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/analytics/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async listEmployerPaymentRunSummaries(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/payment-runs${toQueryString(params)}`)));
    },
    async listEmployerUvgCases(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/uvg-cases${toQueryString(params)}`)));
    },
    async getEmployerUvgCaseDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/uvg-cases/${params.caseId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async createEmployerUvgAccidentReport(params) {
      return readJson(await fetchFn(withBaseUrl("/v1/employer/uvg-cases/report"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async generateEmployerUvgAccidentReportArtifact(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/uvg-cases/${params.caseId}/report-artifact`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async listInternalPaymentRuns(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/payment-runs${toQueryString(params)}`)));
    },
    async getInternalPaymentRunDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/payment-runs/${params.runId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async getInternalMonthEndReport(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/month-end${toQueryString(params)}`)));
    },
    async listInternalReconciliationRecords(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/reconciliation${toQueryString(params)}`)));
    },
    async getInternalSettlementSummary(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/settlement/${params.ktgCaseId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async listInternalPaymentAuditEvents(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/payment-audit-events${toQueryString(params)}`)));
    },
    async listInternalUvgCases(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases${toQueryString(params)}`)));
    },
    async getInternalUvgCaseDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async updateInternalUvgCaseStatus(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/status`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async recordInternalUvgInjury(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/injuries`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async recordInternalUvgCircumstance(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/circumstances`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async upsertInternalUvgCoordination(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/coordination`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async linkInternalUvgDocument(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/documents`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async upsertInternalUvgDecision(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/uvg-cases/${params.caseId}/decisions`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      }));
    },
    async getEmployerDashboard(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/dashboard${toQueryString(params)}`)));
    },
    async listEmployerAbsences(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/absences${toQueryString(params)}`)));
    },
    async getEmployerAbsenceDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/absences/${params.episodeId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async listEmployerCases(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/cases${toQueryString(params)}`)));
    },
    async getEmployerCaseDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/cases/${params.caseId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async listEmployerDocuments(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/documents${toQueryString(params)}`)));
    },
    async listEmployerTasks(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/tasks${toQueryString(params)}`)));
    },
    async listEmployerPayments(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/employer/payments${toQueryString(params)}`)));
    },
    async getInternalDashboard(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/dashboard${toQueryString(params)}`)));
    },
    async listInternalIntake(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/intake${toQueryString(params)}`)));
    },
    async getInternalIntakeDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/intake/${params.workspaceId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async listInternalCases(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/ktg-cases${toQueryString(params)}`)));
    },
    async getInternalCaseDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/ktg-cases/${params.caseId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
    async listInternalBenefits(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/benefits${toQueryString(params)}`)));
    },
    async getInternalBenefitDetail(params) {
      return readJson(await fetchFn(withBaseUrl(`/v1/internal/benefits/${params.calculationId}${toQueryString({
        tenantId: params.tenantId,
        locale: params.locale,
      })}`)));
    },
  };
};
