import { calculateCalculationMutable, calculateDailyAllowanceRate, calculateInsuredSalary, calculatePaymentRouting, calculatePeriodPayableAmount, } from "../domain/formulas.js";
import { hasBlockingIssues, validateBenefitAdjustment, validateBenefitCaseCalculation, validateBenefitDayBreakdown, validateBenefitEntitlementPeriod, validateCoordinationWindow, validateInsuredSalarySnapshot, validatePaymentInstruction, validateTaggelddispositivSnapshot, } from "../domain/validations.js";
const generateId = () => crypto.randomUUID();
const isRepositoryConstraintError = (error) => typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string";
const mapRepositoryErrorToIssue = (error) => {
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
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async assertCalculationMutable(calculation, field = "calculationStatus") {
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
    async appendAuditEvent(repository, input, actor) {
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
    async createCalculation(calculation, actor) {
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
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async listCalculations(tenantId, filters) {
        return this.repository.listCalculations(tenantId, filters);
    }
    async createInsuredSalarySnapshot(snapshot, actor) {
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
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async createCoordinationWindow(window, actor) {
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
    async createEntitlementPeriod(period, actor) {
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
    async createDayBreakdown(dayBreakdown, actor) {
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
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async createAdjustment(adjustment, actor) {
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
    async createPaymentInstruction(paymentInstruction, actor) {
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
    async createTaggelddispositiv(taggelddispositiv, actor) {
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
        }
        catch (error) {
            const mapped = mapRepositoryErrorToIssue(error);
            if (mapped) {
                return { issues: [...issues, mapped] };
            }
            throw error;
        }
    }
    async approveForPayment(params, actor) {
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
    async supersedeCalculation(params, actor) {
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
    async getCalculationDetail(tenantId, calculationId) {
        const calculation = await this.repository.getCalculationById(tenantId, calculationId);
        if (!calculation) {
            return null;
        }
        const [insuredSalarySnapshot, coordinationWindows, entitlementPeriods, adjustments, paymentInstructions, auditEvents, taggelddispositive,] = await Promise.all([
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
    buildInsuredSalaryPreview(input) {
        return calculateInsuredSalary(input);
    }
    buildDailyAllowanceRatePreview(input) {
        return calculateDailyAllowanceRate(input);
    }
    buildPeriodAmountPreview(input) {
        return calculatePeriodPayableAmount(input);
    }
    buildPaymentRoutingPreview(input) {
        return calculatePaymentRouting(input);
    }
}
//# sourceMappingURL=benefit-engine.service.js.map