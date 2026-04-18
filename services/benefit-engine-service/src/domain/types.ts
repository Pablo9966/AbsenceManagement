export type CalculationStatus = "draft" | "calculated" | "superseded" | "approved_for_payment";
export type CalculationReason = "initial" | "salary_change" | "incapacity_change" | "relapse_extension" | "manual_correction";
export type WindowType = "lohnfortzahlung" | "wartezeit_overlap" | "non_payable_coordination";
export type PeriodType = "wartezeit" | "coordination_non_payable" | "payable" | "exhausted" | "excluded";
export type AdjustmentOrigin = "derived_recalculation" | "manual_correction";
export type AdjustmentType =
  | "retroactive_increase"
  | "retroactive_decrease"
  | "salary_basis_correction"
  | "incapacity_correction";
export type PayeeType = "employer" | "employee";
export type PaymentRouteReason =
  | "salary_continuation_active"
  | "direct_employee_payment"
  | "employer_reimbursement_override";
export type InstructionStatus = "pending" | "exported" | "cancelled";
export type SalaryModel = "monthly" | "annual" | "hourly" | "variable";
export type BenefitActorRole = "claims_handler" | "team_lead" | "finance_operator" | "system";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentMoney extends TransparentValue<number> {
  currency: "CHF";
  effectiveAt: string;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface BenefitCaseCalculation {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  calculationStatus: CalculationStatus;
  calculationReason: CalculationReason;
  referenceDate: string;
  coverageSnapshotId: string;
  benefitDaysConsumed: number;
  benefitDaysRemaining: number;
  maxBenefitDays: number;
  waitingDaysConsumed: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsuredSalarySnapshot {
  id: string;
  tenantId: string;
  benefitCaseCalculationId: string;
  ktgCaseId?: string;
  salaryBasisDate: string;
  salaryModel: SalaryModel;
  annualBaseSalaryChf: number;
  included13thMonthChf: number;
  insuredBonusChf: number;
  insuredAllowancesChf: number;
  employmentPercentage: number;
  policyCapChf: number;
  insuredSalaryChf: number;
  formula: string;
  inputsJson: Record<string, unknown>;
  createdAt: string;
}

export interface CoordinationWindow {
  id: string;
  tenantId: string;
  benefitCaseCalculationId: string;
  windowType: WindowType;
  windowStart: string;
  windowEnd: string;
  daysCount: number;
  legalBasis: string;
  sourceMethod: string;
  formula: string;
  inputsJson: Record<string, unknown>;
  createdAt: string;
}

export interface BenefitEntitlementPeriod {
  id: string;
  tenantId: string;
  benefitCaseCalculationId: string;
  periodStart: string;
  periodEnd: string;
  periodType: PeriodType;
  absenceEpisodeId?: string;
  sourceReferenceJson: Record<string, unknown>;
  incapacityPercentage: number;
  wartezeitApplicableFlag: boolean;
  coordinationApplicableFlag: boolean;
  benefitDays: number;
  dailyAllowanceRateChf: number;
  payableAmountChf: number;
  formula: string;
  inputsJson: Record<string, unknown>;
  createdAt: string;
}

export interface BenefitDayBreakdown {
  id: string;
  tenantId: string;
  benefitEntitlementPeriodId: string;
  benefitDate: string;
  absenceEpisodeId?: string;
  sourceReferenceJson: Record<string, unknown>;
  incapacityPercentage: number;
  salaryBasisPerDayChf: number;
  coveragePercentage: number;
  grossDailyAllowanceChf: number;
  deductionReason?: string;
  deductionAmountChf: number;
  netDailyAllowanceChf: number;
  payableFlag: boolean;
  createdAt: string;
}

export interface BenefitAdjustment {
  id: string;
  tenantId: string;
  benefitCaseCalculationId: string;
  adjustmentOrigin: AdjustmentOrigin;
  adjustmentType: AdjustmentType;
  effectiveFrom: string;
  effectiveTo: string;
  reasonCode: string;
  deltaAmountChf: number;
  formula: string;
  inputsJson: Record<string, unknown>;
  createdAt: string;
}

export interface PaymentInstruction {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  benefitCaseCalculationId: string;
  payeeType: PayeeType;
  payeeReference: string;
  payeeIbanReference?: string;
  paymentRouteReason: PaymentRouteReason;
  salaryContinuationActiveFlag: boolean;
  routingFormula: string;
  routingInputsJson: Record<string, unknown>;
  paymentPeriodStart: string;
  paymentPeriodEnd: string;
  grossAmountChf: number;
  netAmountChf: number;
  currency: "CHF";
  instructionStatus: InstructionStatus;
  createdAt: string;
}

export interface TaggelddispositivSnapshot {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  paymentInstructionId: string;
  statementPeriodStart: string;
  statementPeriodEnd: string;
  totalClaimedDays: number;
  totalPayableDays: number;
  totalAmountChf: number;
  statementPayloadJson: Record<string, unknown>;
  generatedAt: string;
}

export interface CalculationAuditEvent {
  id: string;
  tenantId: string;
  ktgCaseId: string;
  benefitCaseCalculationId: string;
  eventType: string;
  occurredAt: string;
  actorId?: string;
  actorRole: BenefitActorRole;
  correlationId?: string;
  payload?: Record<string, unknown>;
}

export interface BenefitCaseCalculationDetail extends BenefitCaseCalculation {
  insuredSalarySnapshot?: InsuredSalarySnapshot;
  coordinationWindows: CoordinationWindow[];
  entitlementPeriods: BenefitEntitlementPeriod[];
  dayBreakdowns: BenefitDayBreakdown[];
  adjustments: BenefitAdjustment[];
  paymentInstructions: PaymentInstruction[];
  taggelddispositive: TaggelddispositivSnapshot[];
  auditEvents: CalculationAuditEvent[];
}

export interface UpdateBenefitCaseCalculationPatch {
  calculationStatus?: CalculationStatus;
  benefitDaysConsumed?: number;
  benefitDaysRemaining?: number;
  maxBenefitDays?: number;
  waitingDaysConsumed?: number;
  updatedAt?: string;
}

