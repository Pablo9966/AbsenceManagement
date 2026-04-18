import type {
  PaymentRouteReason,
  PayeeType,
  SalaryModel,
  TransparentBoolean,
  TransparentMoney,
} from "./types.js";

const toAnnualBaseSalary = (input: {
  baseSalaryAmount: number;
  salaryModel: SalaryModel;
  annualizationFactor?: number;
}): number => {
  if (input.salaryModel === "monthly") {
    return input.baseSalaryAmount * 12;
  }

  if (input.salaryModel === "hourly" || input.salaryModel === "variable") {
    return input.baseSalaryAmount * (input.annualizationFactor ?? 1);
  }

  return input.baseSalaryAmount;
};

export const calculateInsuredSalary = (input: {
  salaryModel: SalaryModel;
  baseSalaryAmount: number;
  included13thMonthChf: number;
  insuredBonusChf: number;
  insuredAllowancesChf: number;
  employmentPercentage: number;
  policyCapChf: number;
  effectiveAt: string;
  annualizationFactor?: number;
}): TransparentMoney => {
  const annualBaseSalary = toAnnualBaseSalary(input);
  const preCapAnnualSalary =
    annualBaseSalary +
    input.included13thMonthChf +
    input.insuredBonusChf +
    input.insuredAllowancesChf;
  const cappedAnnualSalary = Math.min(input.policyCapChf, preCapAnnualSalary);
  const value = Number(((cappedAnnualSalary * input.employmentPercentage) / 100).toFixed(2));

  return {
    value,
    currency: "CHF",
    effectiveAt: input.effectiveAt,
    formula:
      "insured_salary = min(policy_cap, annual_base_salary + included_13th_month + insured_bonus + insured_allowances) * employment_percentage / 100",
    inputs: {
      salaryModel: input.salaryModel,
      baseSalaryAmount: input.baseSalaryAmount,
      annualBaseSalary,
      annualizationFactor: input.annualizationFactor,
      included13thMonthChf: input.included13thMonthChf,
      insuredBonusChf: input.insuredBonusChf,
      insuredAllowancesChf: input.insuredAllowancesChf,
      preCapAnnualSalary,
      policyCapChf: input.policyCapChf,
      employmentPercentage: input.employmentPercentage,
    },
  };
};

export const calculateDailyAllowanceRate = (input: {
  insuredSalaryChf: number;
  coveragePercentage: number;
  annualDivisor: number;
  effectiveAt: string;
}): TransparentMoney => {
  const value = Number(((input.insuredSalaryChf * input.coveragePercentage) / 100 / input.annualDivisor).toFixed(2));
  return {
    value,
    currency: "CHF",
    effectiveAt: input.effectiveAt,
    formula: "daily_allowance_rate = insured_salary * coverage_percentage / 100 / annual_divisor",
    inputs: {
      insuredSalaryChf: input.insuredSalaryChf,
      coveragePercentage: input.coveragePercentage,
      annualDivisor: input.annualDivisor,
    },
  };
};

export const calculatePeriodPayableAmount = (input: {
  grossAmountChf: number;
  deductionAmountChf: number;
  payableDayCount: number;
  periodType: string;
  effectiveAt: string;
}): TransparentMoney => ({
  value: Number((input.grossAmountChf - input.deductionAmountChf).toFixed(2)),
  currency: "CHF",
  effectiveAt: input.effectiveAt,
  formula: "payable_amount = gross_amount - deduction_amount",
  inputs: {
    grossAmountChf: input.grossAmountChf,
    deductionAmountChf: input.deductionAmountChf,
    payableDayCount: input.payableDayCount,
    periodType: input.periodType,
  },
});

export const calculatePaymentRouting = (input: {
  salaryContinuationActiveFlag: boolean;
  employerOverrideFlag?: boolean;
  employerPayeeReference: string;
  employeePayeeReference: string;
  effectiveAt: string;
}): TransparentMoney & {
  payeeType: PayeeType;
  paymentRouteReason: PaymentRouteReason;
  payeeReference: string;
} => {
  let payeeType: PayeeType;
  let paymentRouteReason: PaymentRouteReason;
  let payeeReference: string;

  if (input.employerOverrideFlag) {
    payeeType = "employer";
    paymentRouteReason = "employer_reimbursement_override";
    payeeReference = input.employerPayeeReference;
  } else if (input.salaryContinuationActiveFlag) {
    payeeType = "employer";
    paymentRouteReason = "salary_continuation_active";
    payeeReference = input.employerPayeeReference;
  } else {
    payeeType = "employee";
    paymentRouteReason = "direct_employee_payment";
    payeeReference = input.employeePayeeReference;
  }

  return {
    value: 0,
    currency: "CHF",
    effectiveAt: input.effectiveAt,
    payeeType,
    paymentRouteReason,
    payeeReference,
    formula: "route_to = employer if salary_continuation_active else employee unless override",
    inputs: {
      salaryContinuationActiveFlag: input.salaryContinuationActiveFlag,
      employerOverrideFlag: input.employerOverrideFlag ?? false,
      employerPayeeReference: input.employerPayeeReference,
      employeePayeeReference: input.employeePayeeReference,
    },
  };
};

export const calculateCalculationMutable = (input: {
  calculationStatus: "draft" | "calculated" | "superseded" | "approved_for_payment";
  effectiveAt: string;
}): TransparentBoolean => ({
  value: input.calculationStatus === "draft",
  effectiveAt: input.effectiveAt,
  formula: "calculation_status = draft",
  inputs: {
    calculationStatus: input.calculationStatus,
  },
});

