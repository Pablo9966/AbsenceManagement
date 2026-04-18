import type { PaymentRouteReason, PayeeType, SalaryModel, TransparentBoolean, TransparentMoney } from "./types.js";
export declare const calculateInsuredSalary: (input: {
    salaryModel: SalaryModel;
    baseSalaryAmount: number;
    included13thMonthChf: number;
    insuredBonusChf: number;
    insuredAllowancesChf: number;
    employmentPercentage: number;
    policyCapChf: number;
    effectiveAt: string;
    annualizationFactor?: number;
}) => TransparentMoney;
export declare const calculateDailyAllowanceRate: (input: {
    insuredSalaryChf: number;
    coveragePercentage: number;
    annualDivisor: number;
    effectiveAt: string;
}) => TransparentMoney;
export declare const calculatePeriodPayableAmount: (input: {
    grossAmountChf: number;
    deductionAmountChf: number;
    payableDayCount: number;
    periodType: string;
    effectiveAt: string;
}) => TransparentMoney;
export declare const calculatePaymentRouting: (input: {
    salaryContinuationActiveFlag: boolean;
    employerOverrideFlag?: boolean;
    employerPayeeReference: string;
    employeePayeeReference: string;
    effectiveAt: string;
}) => TransparentMoney & {
    payeeType: PayeeType;
    paymentRouteReason: PaymentRouteReason;
    payeeReference: string;
};
export declare const calculateCalculationMutable: (input: {
    calculationStatus: "draft" | "calculated" | "superseded" | "approved_for_payment";
    effectiveAt: string;
}) => TransparentBoolean;
