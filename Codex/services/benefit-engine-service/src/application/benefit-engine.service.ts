import {
  calculateCalculationMutable,
  calculateDailyAllowanceRate,
  calculateInsuredSalary,
  calculatePaymentRouting,
  calculatePeriodPayableAmount,
} from "../domain/formulas.js";
import type {
  BenefitActorRole,
  BenefitAdjustment,
  BenefitCaseCalculation,
  BenefitCaseCalculationDetail,
  BenefitDayBreakdown,
  BenefitEntitlementPeriod,
  CalculationAuditEvent,
  CoordinationWindow,
  InsuredSalarySnapshot,
  PaymentInstruction,
  TaggelddispositivSnapshot,
  UpdateBenefitCaseCalculationPatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  type ValidationIssue,
  validateBenefitAdjustment,
  validateBenefitCaseCalculation,
  validateBenefitCaseCalculationPatch,
  validateBenefitDayBreakdown,
  validateBenefitEntitlementPeriod,
  validateCoordinationWindow,
  validateInsuredSalarySnapshot,
  validatePaymentInstruction,
  validateTaggelddispositivSnapshot,
} from "../domain/validations.js";

export interface BenefitEngineRepositoryContext {
  createCalculation(calculation: BenefitCaseCalculation): Promise<BenefitCaseCalculation>;
  updateCalculation(calculation: BenefitCaseCalculation): Promise<BenefitCaseCalculation>;
  getCalculationById(tenantId: string, calculationId: string): Promise<BenefitCaseCalculation | null>;
  listCalculations(tenantId: string, filters?: {
    ktgCaseId?: string;
    calculationStatus?: BenefitCaseCalculation["calculationStatus"];
  }): Promise<BenefitCaseCalculation[]>;
  findLatestCalculationByCase(tenantId: string, ktgCaseId: string): Promise<BenefitCaseCalculation | null>;

  createInsuredSalarySnapshot(snapshot: InsuredSalarySnapshot): Promise<InsuredSalarySnapshot>;
  getInsuredSalarySnapshotByCalculation(tenantId: string, calculationId: string): Promise<InsuredSalarySnapshot | null>;

  createCoordinationWindow(window: CoordinationWindow): Promise<CoordinationWindow>;
  listCoordinationWindowsByCalculation(tenantId: string, calculationId: string): Promise<CoordinationWindow[]>;

  createEntitlementPeriod(period: BenefitEntitlementPeriod): Promise<BenefitEntitlementPeriod>;
  listEntitlementPeriodsByCalculation(tenantId: string, calculationId: string): Promise<BenefitEntitlementPeriod[]>;

  createDayBreakdown(day: BenefitDayBreakdown): Promise<BenefitDayBreakdown>;
  listDayBreakdownsByCalculation(tenantId: string, calculationId: string): Promise<BenefitDayBreakdown[]>;
  listDayBreakdownsByPeriod(tenantId: string, periodId: string): Promise<BenefitDayBreakdown[]>;
  getEntitlementPeriodById(tenantId: string, periodId: string): Promise<BenefitEntitlementPeriod | null>;

  createAdjustment(adjustment: BenefitAdjustment): Promise<BenefitAdjustment>;
  listAdjustmentsByCalculation(tenantId: string, calculationId: string): Promise<BenefitAdjustment[]>;

  createPaymentInstruction(paymentInstruction: PaymentInstruction): Promise<PaymentInstruction>;
  listPaymentInstructionsByCalculation(tenantId: string, calculationId: string): Promise<PaymentInstruction[]>;
  getPaymentInstructionById(tenantId: string, paymentInstructionId: string): Promise<PaymentInstruction | null>;

  createTaggelddispositiv(snapshot: TaggelddispositivSnapshot): Promise<TaggelddispositivSnapshot>;
  listTaggelddispositiveByCalculation(tenantId: string, calculationId: string): Promise<TaggelddispositivSnapshot[]>;

  createAuditEvent(event: CalculationAuditEvent): Promise<CalculationAuditEvent>;
  listAuditEventsByCalculation(tenantId: string, calculationId: string): Promise<CalculationAuditEvent[]>;
}

export interface BenefitEngineRepository extends BenefitEngineRepositoryContext {
  withTransaction<T>(operation: (repository: BenefitEngineRepositoryContext) => Promise<T>): Promise<T>;
}

export interface ActorContext {
  actorId?: string;
  actorRole: BenefitActorRole;
  correlationId?: string;
  effectiveAt: string;
}

export interface CommandResult<T> {
  data?: T;
  issues: ValidationIssue[];
}

interface RepositoryConstraintErrorLike {
  constraint?: string;
}

const generateId = (): string => crypto.randomUUID();

const isRepositoryConstraintError = (error: unknown): error is RepositoryConstraintErrorLike =>
  typeof error === "object" &&
  error !== null &&
  "constraint" in error &&
  typeof (error as RepositoryConstraintErrorLike).constraint === "string";

const mapRepositoryErrorToIssue = (error: unknown): ValidationIssue | null => {
  if (!isRepositoryConstraintError(error)) {
    return null;
  }

  switch (error.constraint) {
    case "uq_insured_salary_snapshot_calculation":
      return { field: "benefitCaseCalculationId", message: "Fuer diese Berechnung existiert bereits ein versicherter Lohnsnapshot.", severity: "error" };
    case "uq_benefit_day_breakdown_period_date":
      return { field: "benefitDate", message: "Fuer diese Leistungsperiode existiert bereits ein Tageseintrag am selben Datum.", severity: "error" };
    case "uq_taggelddispositiv_payment_instruction":
      return { field: "paymentInstructionId", message: "Fuer diese Zahlungsinstruktion existiert bereits ein Taggelddispositiv.", severity: "error" };
    default:
      return null;
  }
};

export class BenefitEngineService {
  constructor(private readonly repository: BenefitEngineRepository) {}

  private async assertCalculationMutable(
    calculation: BenefitCaseCalculation,
    field = "calculationStatus",
  ): Promise<ValidationIssue[]> {
    const mutable = calculateCalculationMutable({
      calculationStatus: calculation.calculationStatus,
      effectiveAt: calculation.updatedAt,
    });
    if (mutable.value) {
      return [];
    }

    return [{
      field,
      message: "Berechnung ist nicht mehr veraenderbar. Fuer Korrekturen ist eine neue Rechenversion erforderlich.",
      severity: "error",
    }];
  }

  private async appendAuditEvent(
    repository: BenefitEngineRepositoryContext,
    input: {
      tenantId: string;
      ktgCaseId: string;
      benefitCaseCalculationId: string;
      eventType: string;
      payload?: Record<string, unknown>;
    },
    actor: ActorContext,
  ): Promise<CalculationAuditEvent> {
    return repository.createAuditEvent({
      id: generateId(),
      tenantId: input.tenantId,
      ktgCaseId: input.ktgCaseId,
      benefitCaseCalculationId: input.benefitCaseCalculationId,
      eventType: input.eventType,
      occurredAt: actor.effectiveAt,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      correlationId: actor.correlationId,
      payload: input.payload,
    });
  }

  async createCalculation(
    calculation: BenefitCaseCalculation,
    actor: ActorContext,
  ): Promise<CommandResult<BenefitCaseCalculation>> {
    const issues = validateBenefitCaseCalculation(calculation);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const previous = await transaction.findLatestCalculationByCase(calculation.tenantId, calculation.ktgCaseId);
        if (previous && previous.calculationStatus !== "superseded") {
          await transaction.updateCalculation({
            ...previous,
            calculationStatus: "superseded",
            updatedAt: actor.effectiveAt,
          });
          await this.appendAuditEvent(transaction, {
            tenantId: previous.tenantId,
            ktgCaseId: previous.ktgCaseId,
            benefitCaseCalculationId: previous.id,
            eventType: "superseded",
            payload: {
              supersededByCalculationId: calculation.id,
            },
          }, actor);
        }

        const created = await transaction.createCalculation(calculation);
        await this.appendAuditEvent(transaction, {
          tenantId: created.tenantId,
          ktgCaseId: created.ktgCaseId,
          benefitCaseCalculationId: created.id,
          eventType: "calculation_created",
          payload: {
            calculationReason: created.calculationReason,
            referenceDate: created.referenceDate,
          },
        }, actor);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async listCalculations(tenantId: string, filters?: {
    ktgCaseId?: string;
    calculationStatus?: BenefitCaseCalculation["calculationStatus"];
  }): Promise<BenefitCaseCalculation[]> {
    return this.repository.listCalculations(tenantId, filters);
  }

  async createInsuredSalarySnapshot(
    snapshot: InsuredSalarySnapshot,
    actor: ActorContext,
  ): Promise<CommandResult<InsuredSalarySnapshot>> {
    const issues = validateInsuredSalarySnapshot(snapshot);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const calculation = await transaction.getCalculationById(snapshot.tenantId, snapshot.benefitCaseCalculationId);
        if (!calculation) {
          return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
        }

        issues.push(...await this.assertCalculationMutable(calculation));
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const created = await transaction.createInsuredSalarySnapshot(snapshot);
        await this.appendAuditEvent(transaction, {
          tenantId: calculation.tenantId,
          ktgCaseId: calculation.ktgCaseId,
          benefitCaseCalculationId: calculation.id,
          eventType: "insured_salary_snapshot_created",
          payload: {
            snapshotId: created.id,
            insuredSalaryChf: created.insuredSalaryChf,
          },
        }, actor);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async createCoordinationWindow(window: CoordinationWindow, actor: ActorContext): Promise<CommandResult<CoordinationWindow>> {
    const issues = validateCoordinationWindow(window);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(window.tenantId, window.benefitCaseCalculationId);
      if (!calculation) {
        return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }

      issues.push(...await this.assertCalculationMutable(calculation));
      if (hasBlockingIssues(issues)) {
        return { issues };
      }

      const created = await transaction.createCoordinationWindow(window);
      await this.appendAuditEvent(transaction, {
        tenantId: calculation.tenantId,
        ktgCaseId: calculation.ktgCaseId,
        benefitCaseCalculationId: calculation.id,
        eventType: "coordination_window_created",
        payload: {
          windowId: created.id,
          windowType: created.windowType,
          windowStart: created.windowStart,
          windowEnd: created.windowEnd,
        },
      }, actor);
      return { data: created, issues };
    });
  }

  async createEntitlementPeriod(period: BenefitEntitlementPeriod, actor: ActorContext): Promise<CommandResult<BenefitEntitlementPeriod>> {
    const issues = validateBenefitEntitlementPeriod(period);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(period.tenantId, period.benefitCaseCalculationId);
      if (!calculation) {
        return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }

      issues.push(...await this.assertCalculationMutable(calculation));
      if (hasBlockingIssues(issues)) {
        return { issues };
      }

      const created = await transaction.createEntitlementPeriod(period);
      await this.appendAuditEvent(transaction, {
        tenantId: calculation.tenantId,
        ktgCaseId: calculation.ktgCaseId,
        benefitCaseCalculationId: calculation.id,
        eventType: "entitlement_period_created",
        payload: {
          periodId: created.id,
          periodType: created.periodType,
          payableAmountChf: created.payableAmountChf,
        },
      }, actor);
      return { data: created, issues };
    });
  }

  async createDayBreakdown(dayBreakdown: BenefitDayBreakdown, actor: ActorContext): Promise<CommandResult<BenefitDayBreakdown>> {
    const issues = validateBenefitDayBreakdown(dayBreakdown);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const period = await transaction.getEntitlementPeriodById(dayBreakdown.tenantId, dayBreakdown.benefitEntitlementPeriodId);
        if (!period) {
          return { issues: [{ field: "benefitEntitlementPeriodId", message: "Leistungsperiode wurde nicht gefunden.", severity: "error" }] };
        }
        const calculation = await transaction.getCalculationById(dayBreakdown.tenantId, period.benefitCaseCalculationId);
        if (!calculation) {
          return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
        }

        issues.push(...await this.assertCalculationMutable(calculation));
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const created = await transaction.createDayBreakdown(dayBreakdown);
        await this.appendAuditEvent(transaction, {
          tenantId: calculation.tenantId,
          ktgCaseId: calculation.ktgCaseId,
          benefitCaseCalculationId: calculation.id,
          eventType: "day_breakdown_created",
          payload: {
            dayBreakdownId: created.id,
            benefitDate: created.benefitDate,
            netDailyAllowanceChf: created.netDailyAllowanceChf,
          },
        }, actor);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async createAdjustment(adjustment: BenefitAdjustment, actor: ActorContext): Promise<CommandResult<BenefitAdjustment>> {
    const issues = validateBenefitAdjustment(adjustment);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(adjustment.tenantId, adjustment.benefitCaseCalculationId);
      if (!calculation) {
        return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }

      issues.push(...await this.assertCalculationMutable(calculation));
      if (hasBlockingIssues(issues)) {
        return { issues };
      }

      const created = await transaction.createAdjustment(adjustment);
      await this.appendAuditEvent(transaction, {
        tenantId: calculation.tenantId,
        ktgCaseId: calculation.ktgCaseId,
        benefitCaseCalculationId: calculation.id,
        eventType: "adjustment_created",
        payload: {
          adjustmentId: created.id,
          adjustmentOrigin: created.adjustmentOrigin,
          adjustmentType: created.adjustmentType,
          deltaAmountChf: created.deltaAmountChf,
        },
      }, actor);
      return { data: created, issues };
    });
  }

  async createPaymentInstruction(paymentInstruction: PaymentInstruction, actor: ActorContext): Promise<CommandResult<PaymentInstruction>> {
    const issues = validatePaymentInstruction(paymentInstruction);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(paymentInstruction.tenantId, paymentInstruction.benefitCaseCalculationId);
      if (!calculation) {
        return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }

      issues.push(...await this.assertCalculationMutable(calculation));
      if (hasBlockingIssues(issues)) {
        return { issues };
      }

      const created = await transaction.createPaymentInstruction(paymentInstruction);
      await this.appendAuditEvent(transaction, {
        tenantId: calculation.tenantId,
        ktgCaseId: calculation.ktgCaseId,
        benefitCaseCalculationId: calculation.id,
        eventType: "payment_instruction_created",
        payload: {
          paymentInstructionId: created.id,
          payeeType: created.payeeType,
          paymentRouteReason: created.paymentRouteReason,
          netAmountChf: created.netAmountChf,
        },
      }, actor);
      return { data: created, issues };
    });
  }

  async createTaggelddispositiv(
    taggelddispositiv: TaggelddispositivSnapshot,
    actor: ActorContext,
  ): Promise<CommandResult<TaggelddispositivSnapshot>> {
    const issues = validateTaggelddispositivSnapshot(taggelddispositiv);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const paymentInstruction = await transaction.getPaymentInstructionById(taggelddispositiv.tenantId, taggelddispositiv.paymentInstructionId);
        if (!paymentInstruction) {
          return { issues: [{ field: "paymentInstructionId", message: "Zahlungsinstruktion wurde nicht gefunden.", severity: "error" }] };
        }
        const calculation = await transaction.getCalculationById(taggelddispositiv.tenantId, paymentInstruction.benefitCaseCalculationId);
        if (!calculation) {
          return { issues: [{ field: "benefitCaseCalculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
        }

        issues.push(...await this.assertCalculationMutable(calculation));
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const created = await transaction.createTaggelddispositiv(taggelddispositiv);
        await this.appendAuditEvent(transaction, {
          tenantId: calculation.tenantId,
          ktgCaseId: calculation.ktgCaseId,
          benefitCaseCalculationId: calculation.id,
          eventType: "taggelddispositiv_created",
          payload: {
            taggelddispositivId: created.id,
            paymentInstructionId: created.paymentInstructionId,
            totalAmountChf: created.totalAmountChf,
          },
        }, actor);
        return { data: created, issues };
      });
    } catch (error) {
      const mapped = mapRepositoryErrorToIssue(error);
      if (mapped) {
        return { issues: [...issues, mapped] };
      }
      throw error;
    }
  }

  async approveForPayment(params: {
    tenantId: string;
    calculationId: string;
  }, actor: ActorContext): Promise<CommandResult<BenefitCaseCalculation>> {
    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(params.tenantId, params.calculationId);
      if (!calculation) {
        return { issues: [{ field: "calculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }
      if (calculation.calculationStatus === "superseded") {
        return { issues: [{ field: "calculationStatus", message: "Superseded-Berechnungen duerfen nicht zur Zahlung freigegeben werden.", severity: "error" }] };
      }
      if (calculation.calculationStatus !== "calculated") {
        return {
          issues: [{
            field: "calculationStatus",
            message: "Nur Berechnungen im Status calculated duerfen in approved_for_payment ueberfuehrt werden.",
            severity: "error",
          }],
        };
      }

      const updated = await transaction.updateCalculation({
        ...calculation,
        calculationStatus: "approved_for_payment",
        updatedAt: actor.effectiveAt,
      });
      await this.appendAuditEvent(transaction, {
        tenantId: updated.tenantId,
        ktgCaseId: updated.ktgCaseId,
        benefitCaseCalculationId: updated.id,
        eventType: "approved_for_payment",
        payload: {},
      }, actor);
      return { data: updated, issues: [] };
    });
  }

  async supersedeCalculation(params: {
    tenantId: string;
    calculationId: string;
  }, actor: ActorContext): Promise<CommandResult<BenefitCaseCalculation>> {
    return this.repository.withTransaction(async (transaction) => {
      const calculation = await transaction.getCalculationById(params.tenantId, params.calculationId);
      if (!calculation) {
        return { issues: [{ field: "calculationId", message: "Berechnung wurde nicht gefunden.", severity: "error" }] };
      }
      if (calculation.calculationStatus === "superseded") {
        return { data: calculation, issues: [] };
      }

      const updated = await transaction.updateCalculation({
        ...calculation,
        calculationStatus: "superseded",
        updatedAt: actor.effectiveAt,
      });
      await this.appendAuditEvent(transaction, {
        tenantId: updated.tenantId,
        ktgCaseId: updated.ktgCaseId,
        benefitCaseCalculationId: updated.id,
        eventType: "superseded",
        payload: {},
      }, actor);
      return { data: updated, issues: [] };
    });
  }

  async getCalculationDetail(tenantId: string, calculationId: string): Promise<BenefitCaseCalculationDetail | null> {
    const calculation = await this.repository.getCalculationById(tenantId, calculationId);
    if (!calculation) {
      return null;
    }

    const [
      insuredSalarySnapshot,
      coordinationWindows,
      entitlementPeriods,
      adjustments,
      paymentInstructions,
      auditEvents,
      taggelddispositive,
    ] = await Promise.all([
      this.repository.getInsuredSalarySnapshotByCalculation(tenantId, calculationId),
      this.repository.listCoordinationWindowsByCalculation(tenantId, calculationId),
      this.repository.listEntitlementPeriodsByCalculation(tenantId, calculationId),
      this.repository.listAdjustmentsByCalculation(tenantId, calculationId),
      this.repository.listPaymentInstructionsByCalculation(tenantId, calculationId),
      this.repository.listAuditEventsByCalculation(tenantId, calculationId),
      this.repository.listTaggelddispositiveByCalculation(tenantId, calculationId),
    ]);
    const dayBreakdowns = await this.repository.listDayBreakdownsByCalculation(tenantId, calculationId);

    return {
      ...calculation,
      insuredSalarySnapshot: insuredSalarySnapshot ?? undefined,
      coordinationWindows,
      entitlementPeriods,
      dayBreakdowns,
      adjustments,
      paymentInstructions,
      taggelddispositive,
      auditEvents,
    };
  }

  buildInsuredSalaryPreview(input: Parameters<typeof calculateInsuredSalary>[0]) {
    return calculateInsuredSalary(input);
  }

  buildDailyAllowanceRatePreview(input: Parameters<typeof calculateDailyAllowanceRate>[0]) {
    return calculateDailyAllowanceRate(input);
  }

  buildPeriodAmountPreview(input: Parameters<typeof calculatePeriodPayableAmount>[0]) {
    return calculatePeriodPayableAmount(input);
  }

  buildPaymentRoutingPreview(input: Parameters<typeof calculatePaymentRouting>[0]) {
    return calculatePaymentRouting(input);
  }
}
