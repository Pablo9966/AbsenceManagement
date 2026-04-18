import { calculateDailyAllowanceRate, calculateInsuredSalary, calculatePaymentRouting, calculatePeriodPayableAmount } from "../domain/formulas.js";
import type { BenefitActorRole, BenefitAdjustment, BenefitCaseCalculation, BenefitCaseCalculationDetail, BenefitDayBreakdown, BenefitEntitlementPeriod, CalculationAuditEvent, CoordinationWindow, InsuredSalarySnapshot, PaymentInstruction, TaggelddispositivSnapshot } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
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
export declare class BenefitEngineService {
    private readonly repository;
    constructor(repository: BenefitEngineRepository);
    private assertCalculationMutable;
    private appendAuditEvent;
    createCalculation(calculation: BenefitCaseCalculation, actor: ActorContext): Promise<CommandResult<BenefitCaseCalculation>>;
    listCalculations(tenantId: string, filters?: {
        ktgCaseId?: string;
        calculationStatus?: BenefitCaseCalculation["calculationStatus"];
    }): Promise<BenefitCaseCalculation[]>;
    createInsuredSalarySnapshot(snapshot: InsuredSalarySnapshot, actor: ActorContext): Promise<CommandResult<InsuredSalarySnapshot>>;
    createCoordinationWindow(window: CoordinationWindow, actor: ActorContext): Promise<CommandResult<CoordinationWindow>>;
    createEntitlementPeriod(period: BenefitEntitlementPeriod, actor: ActorContext): Promise<CommandResult<BenefitEntitlementPeriod>>;
    createDayBreakdown(dayBreakdown: BenefitDayBreakdown, actor: ActorContext): Promise<CommandResult<BenefitDayBreakdown>>;
    createAdjustment(adjustment: BenefitAdjustment, actor: ActorContext): Promise<CommandResult<BenefitAdjustment>>;
    createPaymentInstruction(paymentInstruction: PaymentInstruction, actor: ActorContext): Promise<CommandResult<PaymentInstruction>>;
    createTaggelddispositiv(taggelddispositiv: TaggelddispositivSnapshot, actor: ActorContext): Promise<CommandResult<TaggelddispositivSnapshot>>;
    approveForPayment(params: {
        tenantId: string;
        calculationId: string;
    }, actor: ActorContext): Promise<CommandResult<BenefitCaseCalculation>>;
    supersedeCalculation(params: {
        tenantId: string;
        calculationId: string;
    }, actor: ActorContext): Promise<CommandResult<BenefitCaseCalculation>>;
    getCalculationDetail(tenantId: string, calculationId: string): Promise<BenefitCaseCalculationDetail | null>;
    buildInsuredSalaryPreview(input: Parameters<typeof calculateInsuredSalary>[0]): import("../domain/types.js").TransparentMoney;
    buildDailyAllowanceRatePreview(input: Parameters<typeof calculateDailyAllowanceRate>[0]): import("../domain/types.js").TransparentMoney;
    buildPeriodAmountPreview(input: Parameters<typeof calculatePeriodPayableAmount>[0]): import("../domain/types.js").TransparentMoney;
    buildPaymentRoutingPreview(input: Parameters<typeof calculatePaymentRouting>[0]): import("../domain/types.js").TransparentMoney & {
        payeeType: import("../domain/types.js").PayeeType;
        paymentRouteReason: import("../domain/types.js").PaymentRouteReason;
        payeeReference: string;
    };
}
