export type LanguageCode = "de-CH" | "fr-CH" | "it-CH" | "en-CH";

export type PortalStatus = "not_invited" | "invited" | "active" | "locked";
export type ContractType =
  | "permanent"
  | "fixed_term"
  | "hourly"
  | "apprenticeship"
  | "executive"
  | "other";
export type WorkPatternType = "full_time" | "part_time" | "shift" | "irregular" | "hourly";
export type WorkingTimeModel = "fixed_schedule" | "annualized_hours" | "shift" | "irregular";
export type EmploymentContractStatus = "active" | "terminated" | "suspended" | "on_leave";
export type SalaryModel = "monthly" | "annual" | "hourly" | "variable";
export type ThirteenthMonthRule = "not_included" | "included_in_base" | "paid_separately";
export type CoverageType = "ktg" | "uvg_bu" | "uvg_nbu" | "uvg_zusatz";
export type EligibilityStatus = "eligible" | "waiting_for_policy_sync" | "excluded" | "suspended";
export type ChangeSource = "api" | "ui" | "integration" | "batch";
export type ChangeType = "created" | "updated" | "corrected" | "terminated" | "reactivated" | "merged";

export interface Tenant {
  id: string;
  elipsClientNumber: string;
  legalName: string;
  defaultLanguage: LanguageCode;
}

export interface Employee {
  id: string;
  tenantId: string;
  personnelNumber: string;
  externalPersonId?: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  ahvNumberHash?: string;
  ahvNumberLast4?: string;
  nationalityCode?: string;
  workEmail?: string;
  privateEmail?: string;
  mobilePhone?: string;
  preferredLanguage: LanguageCode;
  portalStatus: PortalStatus;
  activeFlag: boolean;
}

export interface EmploymentContract {
  id: string;
  tenantId: string;
  employeeId: string;
  legalEntityId: string;
  employmentNumber: string;
  contractType: ContractType;
  workPatternType: WorkPatternType;
  workingTimeModel: WorkingTimeModel;
  startDate: string;
  endDate?: string;
  employmentPercentage: number;
  weeklyHours?: number;
  managerEmployeeId?: string;
  orgUnitId?: string;
  payrollReference?: string;
  status: EmploymentContractStatus;
}

export interface SalaryRecord {
  id: string;
  tenantId: string;
  employmentContractId: string;
  validFrom: string;
  validTo?: string;
  salaryModel: SalaryModel;
  baseSalaryAmount: number;
  currency: "CHF";
  thirteenthMonthRule: ThirteenthMonthRule;
  bonusTargetAmount: number;
  bonusInsuredFlag: boolean;
  allowancesAmount: number;
  ahvRelevantSalaryAmount?: number;
  fteReferencePercentage: number;
}

export interface CoverageEligibility {
  id: string;
  tenantId: string;
  employmentContractId: string;
  policyId: string;
  coverageType: CoverageType;
  insuredFrom: string;
  insuredTo?: string;
  eligibilityStatus: EligibilityStatus;
  occupationClass?: string;
  riskGroup?: string;
  salaryBasisRuleVersion: string;
}

export interface ConsentRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  consentType: "employee_portal_access" | "medical_document_processing" | "notifications" | "data_sharing";
  grantedAt: string;
  revokedAt?: string;
  captureChannel: string;
  policyVersion: string;
}

export interface MasterDataChangeEvent {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  changeType: ChangeType;
  source: ChangeSource;
  effectiveAt: string;
  actorId?: string;
  correlationId?: string;
  payloadBefore?: Record<string, unknown>;
  payloadAfter?: Record<string, unknown>;
}

export interface PolicySalaryBasisRule {
  policyId: string;
  coverageType: CoverageType;
  salaryCap: number;
  includeThirteenthMonth: boolean;
  includeBonus: boolean;
  includeAllowances: boolean;
  formulaVersion: string;
}

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface InsuredSalaryPreview extends TransparentValue<number> {
  effectiveAt: string;
  warnings: string[];
}

export interface InsuredSalaryPreviewInput {
  effectiveAt: string;
  contract: EmploymentContract;
  salaryRecord: SalaryRecord;
  coverageEligibility: CoverageEligibility;
  policyRule: PolicySalaryBasisRule;
}

export interface EmployeeProfile {
  employee: Employee;
  contracts: EmploymentContract[];
  salaryRecords: SalaryRecord[];
  coverageEligibilities: CoverageEligibility[];
  consents: ConsentRecord[];
}

export interface UpdateEmployeePatch {
  preferredName?: string;
  nationalityCode?: string;
  workEmail?: string;
  privateEmail?: string;
  mobilePhone?: string;
  preferredLanguage?: LanguageCode;
  activeFlag?: boolean;
}
