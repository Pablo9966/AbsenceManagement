import { buildEmploymentWarnings, calculateAggregateEmploymentPercentage, calculateInsuredSalaryPreview, } from "../domain/formulas.js";
import { hasBlockingIssues, validateCoverageEligibility, validateEmployee, validateEmployeePatch, validateEmploymentContract, validateNoOverlappingRanges, validateSalaryRecord, } from "../domain/validations.js";
const generateEventId = () => crypto.randomUUID();
const isRepositoryConstraintError = (error) => typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string";
const mapRepositoryErrorToIssue = (error) => {
    if (!isRepositoryConstraintError(error)) {
        return null;
    }
    switch (error.constraint) {
        case "uq_employee_personnel_number":
            return {
                field: "personnelNumber",
                message: "Personalnummer ist innerhalb des Mandanten bereits vorhanden.",
                severity: "error",
            };
        case "uq_employee_ahv_hash":
            return {
                field: "ahvNumber",
                message: "AHV-Nummer ist innerhalb des Mandanten bereits vorhanden.",
                severity: "error",
            };
        case "uq_employment_number":
            return {
                field: "employmentNumber",
                message: "Anstellungsnummer ist innerhalb des Mandanten bereits vorhanden.",
                severity: "error",
            };
        case "ex_salary_record_effective_range":
            return {
                field: "salaryRecord.validFrom",
                message: "Salaerperiode ueberschneidet sich mit bestehender Salaerhistorie.",
                severity: "error",
            };
        case "ex_coverage_eligibility_range":
            return {
                field: "coverageEligibility.insuredFrom",
                message: "Deckungszeitraum ueberschneidet sich mit bestehender Deckung.",
                severity: "error",
            };
        case "ck_employment_percentage":
            return {
                field: "employmentPercentage",
                message: "Beschaeftigungsgrad pro Vertrag muss zwischen 0 und 100 liegen.",
                severity: "error",
            };
        case "ck_fte_reference_percentage":
            return {
                field: "fteReferencePercentage",
                message: "FTE-Referenz muss zwischen 0 und 100 liegen.",
                severity: "error",
            };
        default:
            return null;
    }
};
export class EmployeeMasterDataService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createEmployee(employee, actor) {
        const issues = validateEmployee(employee);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createEmployee(employee);
                await transaction.appendChangeEvent({
                    id: generateEventId(),
                    tenantId: created.tenantId,
                    entityType: "employee",
                    entityId: created.id,
                    changeType: "created",
                    source: actor.source,
                    actorId: actor.actorId,
                    correlationId: actor.correlationId,
                    effectiveAt: actor.effectiveAt,
                    payloadAfter: created,
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async updateEmployee(params, actor) {
        const issues = validateEmployeePatch(params.patch);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const existing = await transaction.getEmployeeById(params.tenantId, params.employeeId);
                if (!existing) {
                    return {
                        issues: [
                            {
                                field: "employeeId",
                                message: "Mitarbeitende Person wurde nicht gefunden.",
                                severity: "error",
                            },
                        ],
                    };
                }
                const updatedEmployee = {
                    ...existing,
                    ...params.patch,
                };
                const updated = await transaction.updateEmployee(updatedEmployee);
                await transaction.appendChangeEvent({
                    id: generateEventId(),
                    tenantId: updated.tenantId,
                    entityType: "employee",
                    entityId: updated.id,
                    changeType: "updated",
                    source: actor.source,
                    actorId: actor.actorId,
                    correlationId: actor.correlationId,
                    effectiveAt: actor.effectiveAt,
                    payloadBefore: existing,
                    payloadAfter: updated,
                });
                return { data: updated, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createEmploymentContract(contract, actor) {
        const issues = validateEmploymentContract(contract);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const contracts = await transaction.listEmploymentContractsByEmployee(contract.tenantId, contract.employeeId);
                const created = await transaction.createEmploymentContract(contract);
                const aggregate = calculateAggregateEmploymentPercentage([...contracts, created], created.startDate);
                issues.push(...buildEmploymentWarnings(aggregate.value).map((message) => ({
                    field: "employmentPercentage",
                    message,
                    severity: "warning",
                })));
                await transaction.appendChangeEvent({
                    id: generateEventId(),
                    tenantId: created.tenantId,
                    entityType: "employment_contract",
                    entityId: created.id,
                    changeType: "created",
                    source: actor.source,
                    actorId: actor.actorId,
                    correlationId: actor.correlationId,
                    effectiveAt: actor.effectiveAt,
                    payloadAfter: created,
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createSalaryRecord(salaryRecord, actor) {
        const issues = validateSalaryRecord(salaryRecord);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const existing = await transaction.listSalaryRecordsByContract(salaryRecord.tenantId, salaryRecord.employmentContractId);
                issues.push(...validateNoOverlappingRanges(existing, {
                    id: salaryRecord.id,
                    validFrom: salaryRecord.validFrom,
                    validTo: salaryRecord.validTo,
                }, "salaryRecord"));
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const created = await transaction.createSalaryRecord(salaryRecord);
                await transaction.appendChangeEvent({
                    id: generateEventId(),
                    tenantId: created.tenantId,
                    entityType: "salary_record",
                    entityId: created.id,
                    changeType: "created",
                    source: actor.source,
                    actorId: actor.actorId,
                    correlationId: actor.correlationId,
                    effectiveAt: actor.effectiveAt,
                    payloadAfter: created,
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createCoverageEligibility(coverageEligibility, actor) {
        const issues = validateCoverageEligibility(coverageEligibility);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const existing = await transaction.listCoverageByContract(coverageEligibility.tenantId, coverageEligibility.employmentContractId);
                const sameType = existing.filter((item) => item.coverageType === coverageEligibility.coverageType && item.policyId === coverageEligibility.policyId);
                issues.push(...validateNoOverlappingRanges(sameType.map((item) => ({
                    id: item.id,
                    validFrom: item.insuredFrom,
                    validTo: item.insuredTo,
                })), {
                    id: coverageEligibility.id,
                    validFrom: coverageEligibility.insuredFrom,
                    validTo: coverageEligibility.insuredTo,
                }, "coverageEligibility"));
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const created = await transaction.createCoverageEligibility(coverageEligibility);
                await transaction.appendChangeEvent({
                    id: generateEventId(),
                    tenantId: created.tenantId,
                    entityType: "coverage_eligibility",
                    entityId: created.id,
                    changeType: "created",
                    source: actor.source,
                    actorId: actor.actorId,
                    correlationId: actor.correlationId,
                    effectiveAt: actor.effectiveAt,
                    payloadAfter: created,
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async getInsuredSalaryPreview(params) {
        const profile = await this.repository.getEmployeeProfile(params.tenantId, params.employeeId);
        if (!profile) {
            return null;
        }
        const contract = profile.contracts.find((item) => item.id === params.contractId);
        if (!contract) {
            return null;
        }
        const salaryRecord = pickEffectiveSalaryRecord(profile.salaryRecords, params.contractId, params.effectiveAt);
        const coverageEligibility = pickEffectiveCoverageEligibility(profile.coverageEligibilities, params.contractId, params.policyRule.policyId, params.policyRule.coverageType, params.effectiveAt);
        if (!salaryRecord || !coverageEligibility) {
            return null;
        }
        return calculateInsuredSalaryPreview({
            effectiveAt: params.effectiveAt,
            contract,
            salaryRecord,
            coverageEligibility,
            policyRule: params.policyRule,
        });
    }
}
const pickEffectiveSalaryRecord = (salaryRecords, contractId, effectiveAt) => salaryRecords
    .filter((record) => record.employmentContractId === contractId)
    .sort((left, right) => right.validFrom.localeCompare(left.validFrom))
    .find((record) => record.validFrom <= effectiveAt && (!record.validTo || record.validTo >= effectiveAt));
const pickEffectiveCoverageEligibility = (coverages, contractId, policyId, coverageType, effectiveAt) => coverages
    .filter((coverage) => coverage.employmentContractId === contractId &&
    coverage.policyId === policyId &&
    coverage.coverageType === coverageType)
    .sort((left, right) => right.insuredFrom.localeCompare(left.insuredFrom))
    .find((coverage) => coverage.insuredFrom <= effectiveAt && (!coverage.insuredTo || coverage.insuredTo >= effectiveAt));
//# sourceMappingURL=employee-master-data.service.js.map