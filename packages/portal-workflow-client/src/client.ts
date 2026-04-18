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
  WorkflowListQuery,
  WorkflowResponse,
} from "./types.js";

export interface PortalWorkflowClient {
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
