import type { EmploymentContract, InsuredSalaryPreview, InsuredSalaryPreviewInput, TransparentValue } from "./types.js";

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const dateInOpenRange = (date: string, from: string, to?: string): boolean => {
  if (date < from) {
    return false;
  }

  if (to && date > to) {
    return false;
  }

  return true;
};

const normalizeBaseSalaryToAnnual = (salaryModel: InsuredSalaryPreviewInput["salaryRecord"]["salaryModel"], baseSalaryAmount: number): TransparentValue<number> => {
  if (salaryModel === "monthly") {
    return {
      value: roundMoney(baseSalaryAmount * 12),
      formula: "base_salary_amount * 12",
      inputs: {
        salaryModel,
        baseSalaryAmount,
      },
    };
  }

  return {
    value: roundMoney(baseSalaryAmount),
    formula: "base_salary_amount",
    inputs: {
      salaryModel,
      baseSalaryAmount,
    },
  };
};

export const calculateAggregateEmploymentPercentage = (
  contracts: ReadonlyArray<EmploymentContract>,
  effectiveAt: string,
): TransparentValue<number> => {
  const activeContracts = contracts.filter((contract) =>
    dateInOpenRange(effectiveAt, contract.startDate, contract.endDate),
  );

  const total = roundMoney(
    activeContracts.reduce((sum, contract) => sum + contract.employmentPercentage, 0),
  );

  return {
    value: total,
    formula: "sum(active_contract.employment_percentage)",
    inputs: {
      effectiveAt,
      contractCount: activeContracts.length,
      employmentPercentages: activeContracts.map((contract) => ({
        contractId: contract.id,
        employmentPercentage: contract.employmentPercentage,
      })),
    },
  };
};

export const calculateInsuredSalaryPreview = (
  input: InsuredSalaryPreviewInput,
): InsuredSalaryPreview => {
  const annualBaseSalary = normalizeBaseSalaryToAnnual(
    input.salaryRecord.salaryModel,
    input.salaryRecord.baseSalaryAmount,
  );
  const thirteenthMonthHandling = !input.policyRule.includeThirteenthMonth
    ? "not_applicable"
    : input.salaryRecord.thirteenthMonthRule === "included_in_base"
      ? "skipped_already_in_base"
      : "added";
  const includeThirteenthMonth =
    thirteenthMonthHandling === "added";
  const includedThirteenthMonth = includeThirteenthMonth
    ? annualBaseSalary.value / 12
    : 0;
  const insuredBonus =
    input.policyRule.includeBonus && input.salaryRecord.bonusInsuredFlag
      ? input.salaryRecord.bonusTargetAmount
      : 0;
  const insuredAllowances = input.policyRule.includeAllowances
    ? input.salaryRecord.allowancesAmount
    : 0;

  const insuredSalaryComponentsTotal =
    annualBaseSalary.value +
    includedThirteenthMonth +
    insuredBonus +
    insuredAllowances;

  const beforeFteProration = Math.min(input.policyRule.salaryCap, insuredSalaryComponentsTotal);
  const employmentFactor = input.contract.employmentPercentage / 100;
  const value = roundMoney(beforeFteProration * employmentFactor);

  const warnings: string[] = [];

  if (input.coverageEligibility.eligibilityStatus !== "eligible") {
    warnings.push("Deckung ist nicht aktiv; Vorschau nur informativ.");
  }

  if (input.salaryRecord.currency !== "CHF") {
    warnings.push("Nicht-CHF-Salaer ist in Phase 1 nicht unterstuetzt.");
  }

  if (input.contract.employmentPercentage > 100) {
    warnings.push("Beschaeftigungsgrad ueber 100% erkannt; Mehrfachanstellung pruefen.");
  }

  return {
    value,
    formula:
      "min(policy_salary_cap, annual_base_salary + included_13th_month + insured_bonus + insured_allowances) * employment_percentage / 100",
    inputs: {
      effectiveAt: input.effectiveAt,
      policyId: input.policyRule.policyId,
      salaryCap: input.policyRule.salaryCap,
      salaryModel: input.salaryRecord.salaryModel,
      baseSalaryInput: input.salaryRecord.baseSalaryAmount,
      annualBaseSalary: annualBaseSalary.value,
      annualBaseSalaryFormula: annualBaseSalary.formula,
      annualBaseSalaryInputs: annualBaseSalary.inputs,
      included13thMonth: roundMoney(includedThirteenthMonth),
      thirteenthMonthHandling,
      insuredBonus: roundMoney(insuredBonus),
      insuredAllowances: roundMoney(insuredAllowances),
      insuredSalaryComponentsTotal: roundMoney(insuredSalaryComponentsTotal),
      beforeFteProration: roundMoney(beforeFteProration),
      employmentPercentage: input.contract.employmentPercentage,
      salaryBasisRuleVersion: input.coverageEligibility.salaryBasisRuleVersion,
      formulaVersion: input.policyRule.formulaVersion,
    },
    effectiveAt: input.effectiveAt,
    warnings,
  };
};

export const buildEmploymentWarnings = (
  aggregateEmploymentPercentage: number,
  warningThreshold = 100,
): string[] => {
  const warnings: string[] = [];

  if (aggregateEmploymentPercentage > warningThreshold) {
    warnings.push(
      `Gesamtbeschaeftigungsgrad ${aggregateEmploymentPercentage}% ueberschreitet Warnschwelle ${warningThreshold}%.`,
    );
  }

  return warnings;
};
