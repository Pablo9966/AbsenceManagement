import type { CoverageEligibility, Employee, EmployeeProfile, EmploymentContract, InsuredSalaryPreview, MasterDataChangeEvent, PolicySalaryBasisRule, SalaryRecord, UpdateEmployeePatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
export interface PeopleRepositoryContext {
    createEmployee(employee: Employee): Promise<Employee>;
    updateEmployee(employee: Employee): Promise<Employee>;
    getEmployeeById(tenantId: string, employeeId: string): Promise<Employee | null>;
    createEmploymentContract(contract: EmploymentContract): Promise<EmploymentContract>;
    createSalaryRecord(salaryRecord: SalaryRecord): Promise<SalaryRecord>;
    createCoverageEligibility(coverageEligibility: CoverageEligibility): Promise<CoverageEligibility>;
    listEmploymentContractsByEmployee(tenantId: string, employeeId: string): Promise<EmploymentContract[]>;
    listSalaryRecordsByContract(tenantId: string, contractId: string): Promise<SalaryRecord[]>;
    listCoverageByContract(tenantId: string, contractId: string): Promise<CoverageEligibility[]>;
    getEmployeeProfile(tenantId: string, employeeId: string): Promise<EmployeeProfile | null>;
    appendChangeEvent(event: MasterDataChangeEvent): Promise<void>;
}
export interface PeopleRepository extends PeopleRepositoryContext {
    withTransaction<T>(operation: (repository: PeopleRepositoryContext) => Promise<T>): Promise<T>;
}
export interface ActorContext {
    actorId?: string;
    source: "api" | "ui" | "integration" | "batch";
    correlationId?: string;
    effectiveAt: string;
}
export interface CommandResult<T> {
    data?: T;
    issues: ValidationIssue[];
}
export declare class EmployeeMasterDataService {
    private readonly repository;
    constructor(repository: PeopleRepository);
    createEmployee(employee: Employee & {
        ahvNumber?: string;
    }, actor: ActorContext): Promise<CommandResult<Employee>>;
    updateEmployee(params: {
        tenantId: string;
        employeeId: string;
        patch: UpdateEmployeePatch;
    }, actor: ActorContext): Promise<CommandResult<Employee>>;
    createEmploymentContract(contract: EmploymentContract, actor: ActorContext): Promise<CommandResult<EmploymentContract>>;
    createSalaryRecord(salaryRecord: SalaryRecord, actor: ActorContext): Promise<CommandResult<SalaryRecord>>;
    createCoverageEligibility(coverageEligibility: CoverageEligibility, actor: ActorContext): Promise<CommandResult<CoverageEligibility>>;
    getInsuredSalaryPreview(params: {
        tenantId: string;
        employeeId: string;
        contractId: string;
        effectiveAt: string;
        policyRule: PolicySalaryBasisRule;
    }): Promise<InsuredSalaryPreview | null>;
}
