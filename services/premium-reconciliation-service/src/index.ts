import { randomUUID } from "node:crypto";

export type PremiumPeriodType = "annual" | "monthly" | "correction";
export type PremiumReportingStatus = "draft" | "submitted" | "under_review" | "reconciled" | "closed";
export type SalaryMassReportStatus = "draft" | "submitted" | "validated" | "rejected";
export type PremiumSnapshotStatus = "draft" | "calculated" | "published";
export type PremiumAdjustmentStatus = "draft" | "calculated" | "approved" | "superseded";
export type PremiumAdjustmentType = "refund" | "additional_invoice" | "no_adjustment";
export type PremiumRecommendationType = "refund" | "invoice" | "carry_forward";
export type PremiumInstallmentPlanStatus = "draft" | "active" | "completed" | "cancelled";
export type PremiumInstallmentStatus = "scheduled" | "due" | "paid" | "overdue" | "cancelled";
export type PremiumActorRole = "employer_finance" | "hr_manager" | "system";

export interface PremiumReportingPeriod {
  id: string;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
  reportingYear: number;
  reportingMonth?: number;
  periodType: PremiumPeriodType;
  reportingStatus: PremiumReportingStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedBy?: string;
}

export interface SalaryMassReport {
  id: string;
  tenantId: string;
  premiumReportingPeriodId: string;
  reportStatus: SalaryMassReportStatus;
  currency: "CHF";
  annualSalaryMassChf: number;
  insuredSalaryMassChf: number;
  employeeCount: number;
  submissionSource: string;
  submittedAt: string;
  submittedBy: string;
  notes?: string;
}

export interface SalaryMassReportLine {
  id: string;
  tenantId: string;
  salaryMassReportId: string;
  employeeReference: string;
  contractReference?: string;
  employmentPercentage: number;
  annualSalaryChf: number;
  insuredSalaryChf: number;
  salaryCategory: string;
  lineStatus: "valid" | "warning" | "rejected";
  validationNotes?: string;
}

export interface PremiumExposureSnapshot {
  id: string;
  tenantId: string;
  premiumReportingPeriodId: string;
  exposureBasis: string;
  insuredSalaryMassChf: number;
  claimsPaidChf: number;
  claimsReservedChf?: number;
  claimsRatio: number;
  premiumRateApplied: number;
  expectedPremiumChf: number;
  snapshotStatus: PremiumSnapshotStatus;
  createdAt: string;
}

export interface PremiumAdjustmentCalculation {
  id: string;
  tenantId: string;
  premiumReportingPeriodId: string;
  salaryMassReportId: string;
  adjustmentStatus: PremiumAdjustmentStatus;
  priorPremiumChf: number;
  recalculatedPremiumChf: number;
  deltaAmountChf: number;
  adjustmentType: PremiumAdjustmentType;
  formula: string;
  inputsJson: Record<string, unknown>;
  calculatedAt: string;
}

export interface PremiumSettlementRecommendation {
  id: string;
  tenantId: string;
  premiumAdjustmentCalculationId: string;
  recommendationType: PremiumRecommendationType;
  grossAmountChf: number;
  netAmountChf: number;
  vatAmountChf?: number;
  settlementReason: string;
  installmentEligibleFlag: boolean;
  createdAt: string;
}

export interface PremiumInstallmentPlan {
  id: string;
  tenantId: string;
  premiumReportingPeriodId: string;
  planStatus: PremiumInstallmentPlanStatus;
  installmentCount: number;
  totalAmountChf: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface PremiumInstallmentItem {
  id: string;
  tenantId: string;
  premiumInstallmentPlanId: string;
  dueDate: string;
  amountChf: number;
  installmentStatus: PremiumInstallmentStatus;
  paidAt?: string;
  reference?: string;
}

export interface EmployerPremiumDashboardSnapshot {
  id: string;
  tenantId: string;
  premiumReportingPeriodId: string;
  exposureStatus: string;
  claimsRatio: number;
  expectedPremiumChf: number;
  adjustmentDeltaChf: number;
  openInstallmentAmountChf: number;
  snapshotPayloadJson: Record<string, unknown>;
  createdAt: string;
}

export interface PremiumReconciliationAuditEvent {
  id: string;
  tenantId: string;
  premiumReportingPeriodId?: string;
  salaryMassReportId?: string;
  eventType: string;
  occurredAt: string;
  actorId: string;
  actorRole: PremiumActorRole;
  correlationId?: string;
  payload: Record<string, unknown>;
}

export interface PremiumActorContext {
  actorId: string;
  actorRole: PremiumActorRole;
  effectiveAt: string;
  correlationId?: string;
}

export interface PremiumRepository {
  withTransaction<T>(operation: (repository: PremiumRepository) => Promise<T>): Promise<T>;
  upsertReportingPeriod(value: PremiumReportingPeriod): Promise<PremiumReportingPeriod>;
  getReportingPeriod(tenantId: string, periodId: string): Promise<PremiumReportingPeriod | null>;
  listReportingPeriods(tenantId: string): Promise<PremiumReportingPeriod[]>;
  upsertSalaryMassReport(value: SalaryMassReport): Promise<SalaryMassReport>;
  getSalaryMassReport(tenantId: string, reportId: string): Promise<SalaryMassReport | null>;
  listSalaryMassReports(tenantId: string, periodId?: string): Promise<SalaryMassReport[]>;
  replaceSalaryMassReportLines(reportId: string, lines: SalaryMassReportLine[]): Promise<SalaryMassReportLine[]>;
  listSalaryMassReportLines(tenantId: string, reportId: string): Promise<SalaryMassReportLine[]>;
  upsertExposureSnapshot(value: PremiumExposureSnapshot): Promise<PremiumExposureSnapshot>;
  listExposureSnapshots(tenantId: string, periodId: string): Promise<PremiumExposureSnapshot[]>;
  upsertAdjustmentCalculation(value: PremiumAdjustmentCalculation): Promise<PremiumAdjustmentCalculation>;
  getAdjustmentCalculation(tenantId: string, calculationId: string): Promise<PremiumAdjustmentCalculation | null>;
  listAdjustmentCalculations(tenantId: string, periodId?: string): Promise<PremiumAdjustmentCalculation[]>;
  upsertSettlementRecommendation(value: PremiumSettlementRecommendation): Promise<PremiumSettlementRecommendation>;
  getSettlementRecommendation(tenantId: string, recommendationId: string): Promise<PremiumSettlementRecommendation | null>;
  listSettlementRecommendationsByCalculation(tenantId: string, calculationId: string): Promise<PremiumSettlementRecommendation[]>;
  upsertInstallmentPlan(value: PremiumInstallmentPlan): Promise<PremiumInstallmentPlan>;
  getInstallmentPlan(tenantId: string, planId: string): Promise<PremiumInstallmentPlan | null>;
  listInstallmentPlans(tenantId: string, periodId?: string): Promise<PremiumInstallmentPlan[]>;
  replaceInstallmentItems(planId: string, items: PremiumInstallmentItem[]): Promise<PremiumInstallmentItem[]>;
  listInstallmentItems(tenantId: string, planId: string): Promise<PremiumInstallmentItem[]>;
  upsertDashboardSnapshot(value: EmployerPremiumDashboardSnapshot): Promise<EmployerPremiumDashboardSnapshot>;
  getLatestDashboardSnapshot(tenantId: string, periodId: string): Promise<EmployerPremiumDashboardSnapshot | null>;
  createAuditEvent(value: PremiumReconciliationAuditEvent): Promise<PremiumReconciliationAuditEvent>;
  listAuditEvents(tenantId: string, filters?: { periodId?: string; reportId?: string }): Promise<PremiumReconciliationAuditEvent[]>;
}

const replaceById = <T extends { id: string }>(items: T[], next: T): T => {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) items.push(next);
  else items[index] = next;
  return next;
};

export class PremiumReconciliationMemoryRepository implements PremiumRepository {
  constructor(
    private readonly periods: PremiumReportingPeriod[] = [],
    private readonly reports: SalaryMassReport[] = [],
    private readonly reportLines: SalaryMassReportLine[] = [],
    private readonly exposureSnapshots: PremiumExposureSnapshot[] = [],
    private readonly calculations: PremiumAdjustmentCalculation[] = [],
    private readonly recommendations: PremiumSettlementRecommendation[] = [],
    private readonly plans: PremiumInstallmentPlan[] = [],
    private readonly planItems: PremiumInstallmentItem[] = [],
    private readonly dashboardSnapshots: EmployerPremiumDashboardSnapshot[] = [],
    private readonly auditEvents: PremiumReconciliationAuditEvent[] = [],
  ) {}

  async withTransaction<T>(operation: (repository: PremiumRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async upsertReportingPeriod(value: PremiumReportingPeriod) { return replaceById(this.periods, value); }
  async getReportingPeriod(tenantId: string, periodId: string) { return this.periods.find((p) => p.tenantId === tenantId && p.id === periodId) ?? null; }
  async listReportingPeriods(tenantId: string) { return this.periods.filter((p) => p.tenantId === tenantId).sort((a, b) => b.periodStart.localeCompare(a.periodStart)); }
  async upsertSalaryMassReport(value: SalaryMassReport) { return replaceById(this.reports, value); }
  async getSalaryMassReport(tenantId: string, reportId: string) { return this.reports.find((r) => r.tenantId === tenantId && r.id === reportId) ?? null; }
  async listSalaryMassReports(tenantId: string, periodId?: string) { return this.reports.filter((r) => r.tenantId === tenantId && (!periodId || r.premiumReportingPeriodId === periodId)); }
  async replaceSalaryMassReportLines(reportId: string, lines: SalaryMassReportLine[]) {
    for (let index = this.reportLines.length - 1; index >= 0; index -= 1) if (this.reportLines[index]?.salaryMassReportId === reportId) this.reportLines.splice(index, 1);
    this.reportLines.push(...lines);
    return lines;
  }
  async listSalaryMassReportLines(tenantId: string, reportId: string) { return this.reportLines.filter((line) => line.tenantId === tenantId && line.salaryMassReportId === reportId); }
  async upsertExposureSnapshot(value: PremiumExposureSnapshot) { return replaceById(this.exposureSnapshots, value); }
  async listExposureSnapshots(tenantId: string, periodId: string) { return this.exposureSnapshots.filter((s) => s.tenantId === tenantId && s.premiumReportingPeriodId === periodId); }
  async upsertAdjustmentCalculation(value: PremiumAdjustmentCalculation) { return replaceById(this.calculations, value); }
  async getAdjustmentCalculation(tenantId: string, calculationId: string) { return this.calculations.find((c) => c.tenantId === tenantId && c.id === calculationId) ?? null; }
  async listAdjustmentCalculations(tenantId: string, periodId?: string) { return this.calculations.filter((c) => c.tenantId === tenantId && (!periodId || c.premiumReportingPeriodId === periodId)); }
  async upsertSettlementRecommendation(value: PremiumSettlementRecommendation) { return replaceById(this.recommendations, value); }
  async getSettlementRecommendation(tenantId: string, recommendationId: string) { return this.recommendations.find((r) => r.tenantId === tenantId && r.id === recommendationId) ?? null; }
  async listSettlementRecommendationsByCalculation(tenantId: string, calculationId: string) { return this.recommendations.filter((r) => r.tenantId === tenantId && r.premiumAdjustmentCalculationId === calculationId); }
  async upsertInstallmentPlan(value: PremiumInstallmentPlan) { return replaceById(this.plans, value); }
  async getInstallmentPlan(tenantId: string, planId: string) { return this.plans.find((p) => p.tenantId === tenantId && p.id === planId) ?? null; }
  async listInstallmentPlans(tenantId: string, periodId?: string) { return this.plans.filter((p) => p.tenantId === tenantId && (!periodId || p.premiumReportingPeriodId === periodId)); }
  async replaceInstallmentItems(planId: string, items: PremiumInstallmentItem[]) {
    for (let index = this.planItems.length - 1; index >= 0; index -= 1) if (this.planItems[index]?.premiumInstallmentPlanId === planId) this.planItems.splice(index, 1);
    this.planItems.push(...items);
    return items;
  }
  async listInstallmentItems(tenantId: string, planId: string) { return this.planItems.filter((item) => item.tenantId === tenantId && item.premiumInstallmentPlanId === planId); }
  async upsertDashboardSnapshot(value: EmployerPremiumDashboardSnapshot) { return replaceById(this.dashboardSnapshots, value); }
  async getLatestDashboardSnapshot(tenantId: string, periodId: string) {
    return this.dashboardSnapshots.filter((s) => s.tenantId === tenantId && s.premiumReportingPeriodId === periodId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }
  async createAuditEvent(value: PremiumReconciliationAuditEvent) { this.auditEvents.push(value); return value; }
  async listAuditEvents(tenantId: string, filters?: { periodId?: string; reportId?: string }) {
    return this.auditEvents.filter((e) => e.tenantId === tenantId && (!filters?.periodId || e.premiumReportingPeriodId === filters.periodId) && (!filters?.reportId || e.salaryMassReportId === filters.reportId)).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
}

export class PremiumReconciliationService {
  constructor(private readonly repository: PremiumRepository) {}

  async createReportingPeriod(input: {
    tenantId: string; periodStart: string; periodEnd: string; reportingYear: number; reportingMonth?: number; periodType: PremiumPeriodType;
  }, actor: PremiumActorContext): Promise<PremiumReportingPeriod> {
    return this.repository.withTransaction(async (repository) => {
      const period: PremiumReportingPeriod = {
        id: randomUUID(),
        tenantId: input.tenantId,
        periodStart: input.periodStart,
        periodEnd: input.periodEnd,
        reportingYear: input.reportingYear,
        reportingMonth: input.reportingMonth,
        periodType: input.periodType,
        reportingStatus: "draft",
        createdAt: actor.effectiveAt,
        updatedAt: actor.effectiveAt,
      };
      await repository.upsertReportingPeriod(period);
      await this.audit(repository, { tenantId: input.tenantId, periodId: period.id, eventType: "premium_period_created", actor, payload: { periodType: input.periodType } });
      return period;
    });
  }

  async listReportingPeriods(tenantId: string) { return this.repository.listReportingPeriods(tenantId); }

  async createDraftSalaryMassReport(input: {
    tenantId: string; premiumReportingPeriodId: string; currency?: "CHF"; annualSalaryMassChf: number; insuredSalaryMassChf: number; employeeCount: number; submissionSource: string; submittedBy: string; notes?: string; lines?: Array<Omit<SalaryMassReportLine, "id" | "tenantId" | "salaryMassReportId">>;
  }, actor: PremiumActorContext): Promise<SalaryMassReport> {
    return this.repository.withTransaction(async (repository) => {
      const period = await repository.getReportingPeriod(input.tenantId, input.premiumReportingPeriodId);
      if (!period) throw new Error("Premium reporting period not found.");
      const report: SalaryMassReport = {
        id: randomUUID(),
        tenantId: input.tenantId,
        premiumReportingPeriodId: input.premiumReportingPeriodId,
        reportStatus: "draft",
        currency: input.currency ?? "CHF",
        annualSalaryMassChf: input.annualSalaryMassChf,
        insuredSalaryMassChf: input.insuredSalaryMassChf,
        employeeCount: input.employeeCount,
        submissionSource: input.submissionSource,
        submittedAt: actor.effectiveAt,
        submittedBy: input.submittedBy,
        notes: input.notes,
      };
      await repository.upsertSalaryMassReport(report);
      await repository.replaceSalaryMassReportLines(report.id, (input.lines ?? []).map((line) => ({ ...line, id: randomUUID(), tenantId: input.tenantId, salaryMassReportId: report.id })));
      await this.audit(repository, { tenantId: input.tenantId, periodId: input.premiumReportingPeriodId, reportId: report.id, eventType: "salary_mass_report_draft_created", actor, payload: { employeeCount: input.employeeCount } });
      return report;
    });
  }

  async submitSalaryMassReport(tenantId: string, reportId: string, actor: PremiumActorContext): Promise<SalaryMassReport> {
    return this.repository.withTransaction(async (repository) => {
      const report = await repository.getSalaryMassReport(tenantId, reportId);
      if (!report) throw new Error("Salary mass report not found.");
      const submitted = { ...report, reportStatus: "submitted" as const, submittedAt: actor.effectiveAt, submittedBy: actor.actorId };
      await repository.upsertSalaryMassReport(submitted);
      const period = await repository.getReportingPeriod(tenantId, report.premiumReportingPeriodId);
      if (period) await repository.upsertReportingPeriod({ ...period, reportingStatus: "submitted", submittedAt: actor.effectiveAt, submittedBy: actor.actorId, updatedAt: actor.effectiveAt });
      await this.audit(repository, { tenantId, periodId: report.premiumReportingPeriodId, reportId, eventType: "salary_mass_report_submitted", actor, payload: { insuredSalaryMassChf: report.insuredSalaryMassChf } });
      return submitted;
    });
  }

  async listSalaryMassReports(tenantId: string, periodId?: string) { return this.repository.listSalaryMassReports(tenantId, periodId); }
  async getSalaryMassReportDetail(tenantId: string, reportId: string) {
    const report = await this.repository.getSalaryMassReport(tenantId, reportId);
    if (!report) return null;
    return { ...report, lines: await this.repository.listSalaryMassReportLines(tenantId, reportId) };
  }

  async calculatePremiumAdjustment(input: {
    tenantId: string; premiumReportingPeriodId: string; salaryMassReportId: string; priorPremiumChf: number; premiumRate: number; claimsPaidChf: number; claimsReservedChf?: number; exposureBasis: string;
  }, actor: PremiumActorContext): Promise<PremiumAdjustmentCalculation> {
    return this.repository.withTransaction(async (repository) => {
      const report = await repository.getSalaryMassReport(input.tenantId, input.salaryMassReportId);
      if (!report) throw new Error("Salary mass report not found.");
      const expectedPremiumChf = round(report.insuredSalaryMassChf * input.premiumRate);
      const deltaAmountChf = round(expectedPremiumChf - input.priorPremiumChf);
      const adjustmentType: PremiumAdjustmentType = deltaAmountChf > 0 ? "additional_invoice" : deltaAmountChf < 0 ? "refund" : "no_adjustment";
      const claimsTotal = input.claimsPaidChf + (input.claimsReservedChf ?? 0);
      const exposure: PremiumExposureSnapshot = {
        id: randomUUID(),
        tenantId: input.tenantId,
        premiumReportingPeriodId: input.premiumReportingPeriodId,
        exposureBasis: input.exposureBasis,
        insuredSalaryMassChf: report.insuredSalaryMassChf,
        claimsPaidChf: input.claimsPaidChf,
        claimsReservedChf: input.claimsReservedChf,
        claimsRatio: expectedPremiumChf === 0 ? 0 : round(claimsTotal / expectedPremiumChf),
        premiumRateApplied: input.premiumRate,
        expectedPremiumChf,
        snapshotStatus: "calculated",
        createdAt: actor.effectiveAt,
      };
      const calculation: PremiumAdjustmentCalculation = {
        id: randomUUID(),
        tenantId: input.tenantId,
        premiumReportingPeriodId: input.premiumReportingPeriodId,
        salaryMassReportId: input.salaryMassReportId,
        adjustmentStatus: "calculated",
        priorPremiumChf: input.priorPremiumChf,
        recalculatedPremiumChf: expectedPremiumChf,
        deltaAmountChf,
        adjustmentType,
        formula: "delta_amount_chf = insured_salary_mass_chf * premium_rate - prior_premium_chf",
        inputsJson: { insuredSalaryMassChf: report.insuredSalaryMassChf, premiumRate: input.premiumRate, priorPremiumChf: input.priorPremiumChf, claimsPaidChf: input.claimsPaidChf, claimsReservedChf: input.claimsReservedChf ?? 0 },
        calculatedAt: actor.effectiveAt,
      };
      await repository.upsertExposureSnapshot(exposure);
      await repository.upsertAdjustmentCalculation(calculation);
      await repository.upsertSalaryMassReport({ ...report, reportStatus: "validated" });
      await this.audit(repository, { tenantId: input.tenantId, periodId: input.premiumReportingPeriodId, reportId: input.salaryMassReportId, eventType: "premium_adjustment_calculated", actor, payload: { adjustmentType, deltaAmountChf } });
      await this.refreshDashboard(repository, input.tenantId, input.premiumReportingPeriodId, actor.effectiveAt);
      return calculation;
    });
  }

  async listAdjustmentCalculations(tenantId: string, periodId?: string) { return this.repository.listAdjustmentCalculations(tenantId, periodId); }
  async getAdjustmentCalculation(tenantId: string, calculationId: string) { return this.repository.getAdjustmentCalculation(tenantId, calculationId); }

  async generateSettlementRecommendation(tenantId: string, calculationId: string, actor: PremiumActorContext): Promise<PremiumSettlementRecommendation> {
    return this.repository.withTransaction(async (repository) => {
      const calculation = await repository.getAdjustmentCalculation(tenantId, calculationId);
      if (!calculation) throw new Error("Premium adjustment calculation not found.");
      const absDelta = Math.abs(calculation.deltaAmountChf);
      const recommendationType: PremiumRecommendationType = calculation.adjustmentType === "additional_invoice" ? "invoice" : calculation.adjustmentType === "refund" ? "refund" : "carry_forward";
      const recommendation: PremiumSettlementRecommendation = {
        id: randomUUID(),
        tenantId,
        premiumAdjustmentCalculationId: calculationId,
        recommendationType,
        grossAmountChf: absDelta,
        netAmountChf: absDelta,
        settlementReason: calculation.adjustmentType === "no_adjustment" ? "No material premium delta." : `Premium adjustment ${calculation.adjustmentType}.`,
        installmentEligibleFlag: recommendationType === "invoice" && absDelta >= 10000,
        createdAt: actor.effectiveAt,
      };
      await repository.upsertSettlementRecommendation(recommendation);
      await this.audit(repository, { tenantId, periodId: calculation.premiumReportingPeriodId, reportId: calculation.salaryMassReportId, eventType: "premium_settlement_recommendation_generated", actor, payload: { recommendationType, grossAmountChf: absDelta } });
      await this.refreshDashboard(repository, tenantId, calculation.premiumReportingPeriodId, actor.effectiveAt);
      return recommendation;
    });
  }

  async getSettlementRecommendation(tenantId: string, recommendationId: string) { return this.repository.getSettlementRecommendation(tenantId, recommendationId); }

  async createInstallmentPlan(input: { tenantId: string; premiumReportingPeriodId: string; totalAmountChf: number; installmentCount: number; startDate: string }, actor: PremiumActorContext): Promise<PremiumInstallmentPlan & { items: PremiumInstallmentItem[] }> {
    return this.repository.withTransaction(async (repository) => {
      const amount = round(input.totalAmountChf / input.installmentCount);
      const plan: PremiumInstallmentPlan = { id: randomUUID(), tenantId: input.tenantId, premiumReportingPeriodId: input.premiumReportingPeriodId, planStatus: "active", installmentCount: input.installmentCount, totalAmountChf: input.totalAmountChf, startDate: input.startDate, endDate: addMonths(input.startDate, input.installmentCount - 1), createdAt: actor.effectiveAt };
      const items = Array.from({ length: input.installmentCount }, (_, index): PremiumInstallmentItem => ({ id: randomUUID(), tenantId: input.tenantId, premiumInstallmentPlanId: plan.id, dueDate: addMonths(input.startDate, index), amountChf: index === input.installmentCount - 1 ? round(input.totalAmountChf - amount * (input.installmentCount - 1)) : amount, installmentStatus: "scheduled", reference: `PREM-${plan.id.slice(0, 8)}-${index + 1}` }));
      await repository.upsertInstallmentPlan(plan);
      await repository.replaceInstallmentItems(plan.id, items);
      await this.audit(repository, { tenantId: input.tenantId, periodId: input.premiumReportingPeriodId, eventType: "premium_installment_plan_created", actor, payload: { installmentCount: input.installmentCount, totalAmountChf: input.totalAmountChf } });
      await this.refreshDashboard(repository, input.tenantId, input.premiumReportingPeriodId, actor.effectiveAt);
      return { ...plan, items };
    });
  }

  async listInstallmentPlans(tenantId: string, periodId?: string) { return this.repository.listInstallmentPlans(tenantId, periodId); }
  async getInstallmentPlanDetail(tenantId: string, planId: string) {
    const plan = await this.repository.getInstallmentPlan(tenantId, planId);
    if (!plan) return null;
    return { ...plan, items: await this.repository.listInstallmentItems(tenantId, planId) };
  }

  async getEmployerPremiumDashboard(tenantId: string, periodId?: string) {
    const periods = await this.repository.listReportingPeriods(tenantId);
    const period = periodId ? await this.repository.getReportingPeriod(tenantId, periodId) : periods[0];
    if (!period) return null;
    const snapshot = await this.repository.getLatestDashboardSnapshot(tenantId, period.id);
    return { period, snapshot, reports: await this.repository.listSalaryMassReports(tenantId, period.id), calculations: await this.repository.listAdjustmentCalculations(tenantId, period.id), plans: await this.repository.listInstallmentPlans(tenantId, period.id), exposures: await this.repository.listExposureSnapshots(tenantId, period.id) };
  }

  async listAuditEvents(tenantId: string, filters?: { periodId?: string; reportId?: string }) { return this.repository.listAuditEvents(tenantId, filters); }

  private async refreshDashboard(repository: PremiumRepository, tenantId: string, periodId: string, createdAt: string) {
    const [exposure] = (await repository.listExposureSnapshots(tenantId, periodId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const [calculation] = (await repository.listAdjustmentCalculations(tenantId, periodId)).sort((a, b) => b.calculatedAt.localeCompare(a.calculatedAt));
    const plans = await repository.listInstallmentPlans(tenantId, periodId);
    const openInstallmentAmountChf = plans.reduce((sum, plan) => sum + (plan.planStatus === "active" ? plan.totalAmountChf : 0), 0);
    await repository.upsertDashboardSnapshot({ id: randomUUID(), tenantId, premiumReportingPeriodId: periodId, exposureStatus: exposure?.snapshotStatus ?? "draft", claimsRatio: exposure?.claimsRatio ?? 0, expectedPremiumChf: exposure?.expectedPremiumChf ?? 0, adjustmentDeltaChf: calculation?.deltaAmountChf ?? 0, openInstallmentAmountChf, snapshotPayloadJson: { latestExposureId: exposure?.id, latestCalculationId: calculation?.id, planCount: plans.length }, createdAt });
  }

  private async audit(repository: PremiumRepository, input: { tenantId: string; periodId?: string; reportId?: string; eventType: string; actor: PremiumActorContext; payload: Record<string, unknown> }) {
    await repository.createAuditEvent({ id: randomUUID(), tenantId: input.tenantId, premiumReportingPeriodId: input.periodId, salaryMassReportId: input.reportId, eventType: input.eventType, occurredAt: input.actor.effectiveAt, actorId: input.actor.actorId, actorRole: input.actor.actorRole, correlationId: input.actor.correlationId, payload: input.payload });
  }
}

const round = (value: number): number => Math.round(value * 100) / 100;
const addMonths = (isoDate: string, months: number): string => {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
};
