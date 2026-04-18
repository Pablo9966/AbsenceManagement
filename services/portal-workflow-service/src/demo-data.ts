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

const baseLinks = (locale: PortalLocale): WorkflowLink[] => [
  { label: "dashboard", href: `/${locale}/dashboard` },
];

const employerAbsences: EmployerAbsenceListItem[] = [
  {
    episodeId: "episode-1001",
    employeeId: "employee-0001",
    employeeName: "Anna Keller",
    periodLabel: "2026-04-02 to 2026-04-18",
    status: "in_progress",
    incapacityPercent: 100,
    linkedCaseId: "case-2001",
  },
  {
    episodeId: "episode-1002",
    employeeId: "employee-0002",
    employeeName: "Luca Meier",
    periodLabel: "2026-04-10 to 2026-04-14",
    status: "acknowledged",
    incapacityPercent: 50,
  },
];

const employerAbsenceDetails: Record<string, EmployerAbsenceDetail> = {
  "episode-1001": {
    episodeId: "episode-1001",
    employeeId: "employee-0001",
    employeeName: "Anna Keller",
    status: "in_progress",
    timeline: [
      { date: "2026-04-02", label: "Absence reported", type: "status" },
      { date: "2026-04-03", label: "Medical certificate uploaded", type: "comment" },
      { date: "2026-04-04", label: "Daily record confirmed", type: "daily_record" },
    ],
    certificateDocumentIds: ["document-3001"],
    linkedCaseIds: ["case-2001"],
  },
  "episode-1002": {
    episodeId: "episode-1002",
    employeeId: "employee-0002",
    employeeName: "Luca Meier",
    status: "acknowledged",
    timeline: [
      { date: "2026-04-10", label: "Absence reported", type: "status" },
    ],
    certificateDocumentIds: [],
    linkedCaseIds: [],
  },
};

const employerCases: EmployerCaseListItem[] = [
  {
    caseId: "case-2001",
    caseNumber: "KTG-2026-001",
    employeeName: "Anna Keller",
    status: "in_review",
    deadlineAt: "2026-04-22",
    linkedEpisodeIds: ["episode-1001"],
  },
];

const employerCaseDetails: Record<string, EmployerCaseDetail> = {
  "case-2001": {
    caseId: "case-2001",
    caseNumber: "KTG-2026-001",
    employeeName: "Anna Keller",
    status: "in_review",
    coverageSummary: "Policy active, waiting period applied, employer visibility enabled.",
    deadlineSummary: ["Medical follow-up due 2026-04-22", "Coverage confirmation due 2026-04-24"],
    linkedEpisodeIds: ["episode-1001"],
    linkedDocumentIds: ["document-3001"],
    decisionSummary: ["Preliminary eligibility confirmed"],
    paymentSummaryIds: ["payment-5001"],
  },
};

const employerDocuments: EmployerDocumentListItem[] = [
  {
    documentId: "document-3001",
    title: "Medical Certificate April",
    employeeName: "Anna Keller",
    status: "reviewed",
    linkedEpisodeId: "episode-1001",
    linkedCaseId: "case-2001",
  },
];

const employerTasks: EmployerTaskListItem[] = [
  {
    taskId: "task-4001",
    title: "Confirm follow-up certificate",
    status: "open",
    dueAt: "2026-04-22",
    href: "/de-CH/documents",
  },
];

const employerPayments: EmployerPaymentSummary[] = [
  {
    paymentSummaryId: "payment-5001",
    caseId: "case-2001",
    caseNumber: "KTG-2026-001",
    amountChf: 1480.25,
    periodLabel: "Apr 2026 first half",
    status: "projected",
  },
];

const internalIntake: InternalIntakeListItem[] = [
  {
    workspaceId: "workspace-6001",
    ktgCaseId: "case-2001",
    status: "in_progress",
    assignedHandler: "M. Steiner",
    blockerCount: 1,
    overdue: false,
  },
];

const internalIntakeDetails: Record<string, InternalIntakeDetail> = {
  "workspace-6001": {
    workspaceId: "workspace-6001",
    ktgCaseId: "case-2001",
    status: "in_progress",
    checklistItems: [
      { id: "check-1", label: "Coverage confirmed", status: "satisfied", blocking: true },
      { id: "check-2", label: "Employer statement received", status: "open", blocking: true },
    ],
    missingInformationRequests: [
      { id: "mir-1", requestedFrom: "Employer", status: "open" },
    ],
    notes: [
      { id: "note-1", author: "M. Steiner", body: "Waiting on employer follow-up." },
    ],
    evidenceReferences: [
      { id: "evidence-1", label: "Medical certificate", referenceId: "document-3001" },
    ],
    activityHistory: [
      { id: "activity-1", occurredAt: "2026-04-18T09:00:00Z", label: "Workspace assigned" },
    ],
  },
};

const internalCases: InternalCaseListItem[] = [
  {
    caseId: "case-2001",
    caseNumber: "KTG-2026-001",
    employeeName: "Anna Keller",
    status: "in_review",
    assignedTeam: "Claims Zurich",
    deadlineAt: "2026-04-22",
  },
];

const internalCaseDetails: Record<string, InternalCaseDetail> = {
  "case-2001": {
    caseId: "case-2001",
    caseNumber: "KTG-2026-001",
    employeeName: "Anna Keller",
    status: "in_review",
    submissions: ["Submission package validated"],
    deadlines: ["Medical follow-up due 2026-04-22"],
    decisions: ["Preliminary acceptance"],
    linkedEpisodeIds: ["episode-1001"],
    linkedDocumentIds: ["document-3001"],
    linkedCalculationIds: ["calculation-7001"],
  },
};

const internalBenefits: InternalBenefitListItem[] = [
  {
    calculationId: "calculation-7001",
    ktgCaseId: "case-2001",
    status: "ready_for_review",
    referenceDate: "2026-04-18",
    periodCount: 2,
  },
];

const internalBenefitDetails: Record<string, InternalBenefitDetail> = {
  "calculation-7001": {
    calculationId: "calculation-7001",
    ktgCaseId: "case-2001",
    status: "ready_for_review",
    entitlementPeriods: [
      { id: "period-1", label: "2026-04-05 to 2026-04-12", payableAmountChf: 820.1 },
      { id: "period-2", label: "2026-04-13 to 2026-04-18", payableAmountChf: 660.15 },
    ],
    adjustmentSummary: ["No coordination deductions applied"],
    paymentInstructionSummary: [
      { id: "pi-1", routing: "employer_reimbursement", amountChf: 1480.25 },
    ],
  },
};

export const buildEmployerDashboard = (tenantId: string, locale: PortalLocale): WorkflowResponse<EmployerDashboardSummary> => ({
  data: {
    cards: [
      { key: "open_absences", label: "Open absences", value: employerAbsences.length, href: `/${locale}/absences` },
      { key: "open_cases", label: "Open KTG cases", value: employerCases.length, href: `/${locale}/cases` },
      { key: "pending_certificates", label: "Pending certificates", value: employerDocuments.length, href: `/${locale}/documents` },
      { key: "tasks_deadlines", label: "Tasks and deadlines", value: employerTasks.length, href: `/${locale}/tasks` },
    ],
  },
  meta: { tenantId, locale },
  permissions: employerPermissions,
  links: baseLinks(locale),
});

export const buildEmployerAbsenceList = (
  tenantId: string,
  locale: PortalLocale,
  filters?: { status?: string; employee?: string },
): WorkflowResponse<EmployerAbsenceListItem[]> => {
  const filtered = employerAbsences.filter((item) =>
    (!filters?.status || item.status === filters.status) &&
    (!filters?.employee || item.employeeName.toLowerCase().includes(filters.employee.toLowerCase())));
  return {
    data: filtered,
    meta: {
      tenantId,
      locale,
      totalCount: filtered.length,
      appliedFilters: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.employee ? { employee: filters.employee } : {}),
      },
    },
    permissions: employerPermissions,
    links: [...baseLinks(locale), { label: "cases", href: `/${locale}/cases` }],
  };
};

const withNotFound = <T>(value: T | undefined, label: string): T => {
  if (!value) {
    throw new Error(`${label} not found`);
  }
  return value;
};

export const buildEmployerAbsenceDetail = (tenantId: string, locale: PortalLocale, episodeId: string): WorkflowResponse<EmployerAbsenceDetail> => ({
  data: withNotFound(employerAbsenceDetails[episodeId], "Employer absence detail"),
  meta: { tenantId, locale },
  permissions: employerPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/cases/case-2001`, relatedId: "case-2001" }],
});

export const buildEmployerCaseList = (tenantId: string, locale: PortalLocale): WorkflowResponse<EmployerCaseListItem[]> => ({
  data: employerCases,
  meta: { tenantId, locale, totalCount: employerCases.length },
  permissions: employerPermissions,
  links: [...baseLinks(locale), { label: "absences", href: `/${locale}/absences` }],
});

export const buildEmployerCaseDetail = (tenantId: string, locale: PortalLocale, caseId: string): WorkflowResponse<EmployerCaseDetail> => ({
  data: withNotFound(employerCaseDetails[caseId], "Employer case detail"),
  meta: { tenantId, locale },
  permissions: employerPermissions,
  links: [
    ...baseLinks(locale),
    { label: "documents", href: `/${locale}/documents`, relatedId: "document-3001" },
    { label: "absence", href: `/${locale}/absences/episode-1001`, relatedId: "episode-1001" },
  ],
});

export const buildEmployerDocuments = (tenantId: string, locale: PortalLocale): WorkflowResponse<EmployerDocumentListItem[]> => ({
  data: employerDocuments,
  meta: { tenantId, locale, totalCount: employerDocuments.length },
  permissions: employerPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/cases/case-2001`, relatedId: "case-2001" }],
});

export const buildEmployerTasks = (tenantId: string, locale: PortalLocale): WorkflowResponse<EmployerTaskListItem[]> => ({
  data: employerTasks.map((task) => ({ ...task, href: task.href.replace("/de-CH/", `/${locale}/`) })),
  meta: { tenantId, locale, totalCount: employerTasks.length },
  permissions: employerPermissions,
  links: baseLinks(locale),
});

export const buildEmployerPayments = (tenantId: string, locale: PortalLocale): WorkflowResponse<EmployerPaymentSummary[]> => ({
  data: employerPayments,
  meta: { tenantId, locale, totalCount: employerPayments.length },
  permissions: employerPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/cases/case-2001`, relatedId: "case-2001" }],
});

export const buildInternalDashboard = (tenantId: string, locale: PortalLocale): WorkflowResponse<InternalDashboardSummary> => ({
  data: {
    cards: [
      { key: "intake_workload", label: "Intake workload", value: internalIntake.length, href: `/${locale}/intake` },
      { key: "pending_review", label: "Pending case review", value: internalCases.length, href: `/${locale}/ktg-cases` },
      { key: "calculation_review", label: "Calculations to review", value: internalBenefits.length, href: `/${locale}/benefits` },
      { key: "compliance_alerts", label: "Compliance alerts", value: 1, href: `/${locale}/compliance` },
    ],
  },
  meta: { tenantId, locale },
  permissions: internalPermissions,
  links: baseLinks(locale),
});

export const buildInternalIntakeList = (tenantId: string, locale: PortalLocale): WorkflowResponse<InternalIntakeListItem[]> => ({
  data: internalIntake,
  meta: { tenantId, locale, totalCount: internalIntake.length },
  permissions: internalPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/ktg-cases/case-2001`, relatedId: "case-2001" }],
});

export const buildInternalIntakeDetail = (tenantId: string, locale: PortalLocale, workspaceId: string): WorkflowResponse<InternalIntakeDetail> => ({
  data: withNotFound(internalIntakeDetails[workspaceId], "Internal intake detail"),
  meta: { tenantId, locale },
  permissions: internalPermissions,
  links: [
    ...baseLinks(locale),
    { label: "case", href: `/${locale}/ktg-cases/case-2001`, relatedId: "case-2001" },
    { label: "document", href: `/${locale}/documents`, relatedId: "document-3001" },
  ],
});

export const buildInternalCaseList = (tenantId: string, locale: PortalLocale): WorkflowResponse<InternalCaseListItem[]> => ({
  data: internalCases,
  meta: { tenantId, locale, totalCount: internalCases.length },
  permissions: internalPermissions,
  links: [...baseLinks(locale), { label: "benefits", href: `/${locale}/benefits` }],
});

export const buildInternalCaseDetail = (tenantId: string, locale: PortalLocale, caseId: string): WorkflowResponse<InternalCaseDetail> => ({
  data: withNotFound(internalCaseDetails[caseId], "Internal case detail"),
  meta: { tenantId, locale },
  permissions: internalPermissions,
  links: [
    ...baseLinks(locale),
    { label: "intake", href: `/${locale}/intake/workspace-6001`, relatedId: "workspace-6001" },
    { label: "benefit", href: `/${locale}/benefits/calculation-7001`, relatedId: "calculation-7001" },
  ],
});

export const buildInternalBenefitList = (tenantId: string, locale: PortalLocale): WorkflowResponse<InternalBenefitListItem[]> => ({
  data: internalBenefits,
  meta: { tenantId, locale, totalCount: internalBenefits.length },
  permissions: internalPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/ktg-cases/case-2001`, relatedId: "case-2001" }],
});

export const buildInternalBenefitDetail = (tenantId: string, locale: PortalLocale, calculationId: string): WorkflowResponse<InternalBenefitDetail> => ({
  data: withNotFound(internalBenefitDetails[calculationId], "Internal benefit detail"),
  meta: { tenantId, locale },
  permissions: internalPermissions,
  links: [...baseLinks(locale), { label: "case", href: `/${locale}/ktg-cases/case-2001`, relatedId: "case-2001" }],
});
