import {
  buildEmploymentWarnings,
  calculateAggregateEmploymentPercentage,
  calculateInsuredSalaryPreview,
} from "../domain/formulas.js";
import type {
  CoverageEligibility,
  Employee,
  EmployeeProfile,
  EmploymentContract,
  InsuredSalaryPreview,
  MasterDataChangeEvent,
  PolicySalaryBasisRule,
  SalaryRecord,
  UpdateEmployeePatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  validateCoverageEligibility,
  validateEmployee,
  validateEmployeePatch,
  validateEmploymentContract,
  validateNoOverlappingRanges,
  validateSalaryRecord,
  type ValidationIssue,
} from "../domain/validations.js";

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

interface RepositoryConstraintErrorLike {
  code?: string;
  constraint?: string;
}

const generateEventId = (): string => crypto.randomUUID();

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
  constructor(private readonly repository: PeopleRepository) {}

  async createEmployee(employee: Employee & { ahvNumber?: string }, actor: ActorContext): Promise<CommandResult<Employee>> {
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
          payloadAfter: created as unknown as Record<string, unknown>,
        });

        return { data: created, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateEmployee(params: {
    tenantId: string;
    employeeId: string;
    patch: UpdateEmployeePatch;
  }, actor: ActorContext): Promise<CommandResult<Employee>> {
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

        const updatedEmployee: Employee = {
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
          payloadBefore: existing as unknown as Record<string, unknown>,
          payloadAfter: updated as unknown as Record<string, unknown>,
        });

        return { data: updated, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createEmploymentContract(
    contract: EmploymentContract,
    actor: ActorContext,
  ): Promise<CommandResult<EmploymentContract>> {
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
          severity: "warning" as const,
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
          payloadAfter: created as unknown as Record<string, unknown>,
        });

        return { data: created, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createSalaryRecord(
    salaryRecord: SalaryRecord,
    actor: ActorContext,
  ): Promise<CommandResult<SalaryRecord>> {
    const issues = validateSalaryRecord(salaryRecord);

    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.listSalaryRecordsByContract(
          salaryRecord.tenantId,
          salaryRecord.employmentContractId,
        );
        issues.push(
          ...validateNoOverlappingRanges(existing, {
            id: salaryRecord.id,
            validFrom: salaryRecord.validFrom,
            validTo: salaryRecord.validTo,
          }, "salaryRecord"),
        );

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
          payloadAfter: created as unknown as Record<string, unknown>,
        });

        return { data: created, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createCoverageEligibility(
    coverageEligibility: CoverageEligibility,
    actor: ActorContext,
  ): Promise<CommandResult<CoverageEligibility>> {
    const issues = validateCoverageEligibility(coverageEligibility);

    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.listCoverageByContract(
          coverageEligibility.tenantId,
          coverageEligibility.employmentContractId,
        );

        const sameType = existing.filter(
          (item) =>
            item.coverageType === coverageEligibility.coverageType && item.policyId === coverageEligibility.policyId,
        );

        issues.push(
          ...validateNoOverlappingRanges(sameType.map((item) => ({
            id: item.id,
            validFrom: item.insuredFrom,
            validTo: item.insuredTo,
          })), {
            id: coverageEligibility.id,
            validFrom: coverageEligibility.insuredFrom,
            validTo: coverageEligibility.insuredTo,
          }, "coverageEligibility"),
        );

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
          payloadAfter: created as unknown as Record<string, unknown>,
        });

        return { data: created, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async getInsuredSalaryPreview(params: {
    tenantId: string;
    employeeId: string;
    contractId: string;
    effectiveAt: string;
    policyRule: PolicySalaryBasisRule;
  }): Promise<InsuredSalaryPreview | null> {
    const profile = await this.repository.getEmployeeProfile(params.tenantId, params.employeeId);
    if (!profile) {
      return null;
    }

    const contract = profile.contracts.find((item) => item.id === params.contractId);
    if (!contract) {
      return null;
    }

    const salaryRecord = pickEffectiveSalaryRecord(profile.salaryRecords, params.contractId, params.effectiveAt);
    const coverageEligibility = pickEffectiveCoverageEligibility(
      profile.coverageEligibilities,
      params.contractId,
      params.policyRule.policyId,
      params.policyRule.coverageType,
      params.effectiveAt,
    );

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

const pickEffectiveSalaryRecord = (
  salaryRecords: ReadonlyArray<SalaryRecord>,
  contractId: string,
  effectiveAt: string,
): SalaryRecord | undefined =>
  salaryRecords
    .filter((record) => record.employmentContractId === contractId)
    .sort((left, right) => right.validFrom.localeCompare(left.validFrom))
    .find((record) => record.validFrom <= effectiveAt && (!record.validTo || record.validTo >= effectiveAt));

const pickEffectiveCoverageEligibility = (
  coverages: ReadonlyArray<CoverageEligibility>,
  contractId: string,
  policyId: string,
  coverageType: PolicySalaryBasisRule["coverageType"],
  effectiveAt: string,
): CoverageEligibility | undefined =>
  coverages
    .filter(
      (coverage) =>
        coverage.employmentContractId === contractId &&
        coverage.policyId === policyId &&
        coverage.coverageType === coverageType,
    )
    .sort((left, right) => right.insuredFrom.localeCompare(left.insuredFrom))
    .find((coverage) => coverage.insuredFrom <= effectiveAt && (!coverage.insuredTo || coverage.insuredTo >= effectiveAt));
