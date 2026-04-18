import type { BenefitAdjustment, BenefitCaseCalculation, BenefitDayBreakdown, BenefitEntitlementPeriod, CalculationStatus, CoordinationWindow, InsuredSalarySnapshot, PaymentInstruction, TaggelddispositivSnapshot, UpdateBenefitCaseCalculationPatch } from "./types.js";
export interface ValidationIssue {
    field: string;
    message: string;
    severity: "error" | "warning";
}
export declare const validateBenefitCaseCalculation: (input: Pick<BenefitCaseCalculation, "ktgCaseId" | "referenceDate" | "coverageSnapshotId" | "benefitDaysConsumed" | "benefitDaysRemaining" | "maxBenefitDays" | "waitingDaysConsumed" | "createdAt" | "updatedAt">) => ValidationIssue[];
export declare const validateBenefitCaseCalculationPatch: (currentStatus: CalculationStatus, patch: UpdateBenefitCaseCalculationPatch) => ValidationIssue[];
export declare const validateInsuredSalarySnapshot: (input: InsuredSalarySnapshot) => ValidationIssue[];
export declare const validateCoordinationWindow: (input: CoordinationWindow) => ValidationIssue[];
export declare const validateBenefitEntitlementPeriod: (input: BenefitEntitlementPeriod) => ValidationIssue[];
export declare const validateBenefitDayBreakdown: (input: BenefitDayBreakdown) => ValidationIssue[];
export declare const validateBenefitAdjustment: (input: BenefitAdjustment) => ValidationIssue[];
export declare const validatePaymentInstruction: (input: PaymentInstruction) => ValidationIssue[];
export declare const validateTaggelddispositivSnapshot: (input: TaggelddispositivSnapshot) => ValidationIssue[];
export declare const hasBlockingIssues: (issues: ReadonlyArray<ValidationIssue>) => boolean;
