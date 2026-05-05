const fs = require('fs');
const path = require('path');

const serviceContextPath = path.join(__dirname, 'service-context.ts');
let content = fs.readFileSync(serviceContextPath, 'utf8');
const lines = content.split('\n');

const imports = lines.slice(0, 50);
const constantsAndPermissions = lines.slice(113, 147);
const paginateItemsFn = lines.slice(163, 187);
const routeHandlers = lines.slice(1257);

const newImports = `
import { WorkflowForbiddenError, WorkflowNotFoundError } from "./errors.js";
import type {
  AbsenceEpisode, AbsenceDailyRecord, AbsenceStatusEvent, AbsenceComment,
  KtgCase, KtgCaseAbsenceLink, KtgDeadline, KtgCaseDecision,
  CertificateCoverageWindow,
} from "./adapters/memory-repositories.js";

export interface PortalWorkflowContext {
  repositories: {
    absenceRepository: AbsenceRepository;
    ktgCaseRepository: KtgCaseRepository;
    documentRepository: DocumentRepository;
    claimsRepository: ClaimsIntakeWorkspaceRepository;
    benefitRepository: BenefitEngineRepository;
    dashboardRepository: DashboardProjectionRepository;
    inboxRepository: InboxNotificationRepository;
  };
  services: {
    absenceService: AbsenceRecordingService;
    ktgCaseService: KtgCaseService;
    documentService: DocumentService;
    claimsService: ClaimsIntakeWorkspaceService;
    benefitService: BenefitEngineService;
    dashboardService: DashboardProjectionService;
    inboxService: InboxNotificationService;
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
`;

let newContent = [
  ...imports,
  newImports,
  ...constantsAndPermissions,
  ...paginateItemsFn,
  ...routeHandlers
].join('\n');

newContent = newContent.replace(/const \{ repositories, services \} = createServices\(\);/g, 'const { repositories, services } = getPortalWorkflowServices();');
newContent = newContent.replace(/const \{ services \} = createServices\(\);/g, 'const { services } = getPortalWorkflowServices();');
newContent = newContent.replace(/const \{ repositories \} = createServices\(\);/g, 'const { repositories } = getPortalWorkflowServices();');

newContent = newContent.replace(/AbsenceMemoryRepository/g, 'AbsenceRepository');
newContent = newContent.replace(/KtgCaseMemoryRepository/g, 'KtgCaseRepository');
newContent = newContent.replace(/DocumentMemoryRepository/g, 'DocumentRepository');

const employerDetailMethods = [
  'getEmployerAbsenceDetail',
  'getEmployerCaseDetail'
];

for (const method of employerDetailMethods) {
  const regex = new RegExp('(export const ' + method + ' = async \\([\\s\\S]*?\\): Promise<WorkflowResponse<.*?> \\| null> => \\{)');
  newContent = newContent.replace(regex, (match) => {
    return match.replace(' | null', '') + '\\n  if (tenantId !== EMPLOYER_TENANT_ID) {\\n    throw new WorkflowForbiddenError("Employer routes are only accessible to employer tenants.");\\n  }';
  });
}

const internalDetailMethods = [
  'getInternalIntakeDetail',
  'getInternalCaseDetail',
  'getInternalBenefitDetail'
];

for (const method of internalDetailMethods) {
  const regex = new RegExp('(export const ' + method + ' = async \\([\\s\\S]*?\\): Promise<WorkflowResponse<.*?> \\| null> => \\{)');
  newContent = newContent.replace(regex, (match) => {
    return match.replace(' | null', '') + '\\n  if (tenantId !== INTERNAL_TENANT_ID) {\\n    throw new WorkflowForbiddenError("Internal routes are only accessible to internal tenants.");\\n  }';
  });
}

newContent = newContent.replace(/if \(!detail\) \{\n\s*return null;\n\s*\}/g, 'if (!detail) {\n    throw new WorkflowNotFoundError();\n  }');

fs.writeFileSync(serviceContextPath, newContent);
console.log('Successfully updated service-context.ts');
