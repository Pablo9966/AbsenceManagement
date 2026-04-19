import type { UvgCaseRepository } from "../application/uvg-case.service.js";
import type {
  UvgAccidentIntake,
  UvgAccidentReportArtifact,
  UvgCase,
  UvgCaseAuditEvent,
  UvgCaseDecision,
  UvgCircumstanceRecord,
  UvgCoordinationRecord,
  UvgDocumentReference,
  UvgInjuryRecord,
} from "../domain/types.js";

const replaceById = <T extends { id: string }>(items: T[], next: T): T => {
  const index = items.findIndex((item) => item.id === next.id);
  if (index === -1) {
    items.push(next);
  } else {
    items[index] = next;
  }
  return next;
};

const append = <T>(items: T[], value: T): T => {
  items.push(value);
  return value;
};

export class UvgCaseMemoryRepository implements UvgCaseRepository {
  constructor(
    private readonly cases: UvgCase[] = [],
    private readonly intakes: UvgAccidentIntake[] = [],
    private readonly injuries: UvgInjuryRecord[] = [],
    private readonly circumstances: UvgCircumstanceRecord[] = [],
    private readonly documentReferences: UvgDocumentReference[] = [],
    private readonly decisions: UvgCaseDecision[] = [],
    private readonly coordinationRecords: UvgCoordinationRecord[] = [],
    private readonly reportArtifacts: UvgAccidentReportArtifact[] = [],
    private readonly auditEvents: UvgCaseAuditEvent[] = [],
  ) {}

  async withTransaction<T>(operation: (repository: UvgCaseRepository) => Promise<T>): Promise<T> {
    return operation(this);
  }

  async createCase(value: UvgCase): Promise<UvgCase> {
    return append(this.cases, value);
  }

  async updateCase(value: UvgCase): Promise<UvgCase> {
    return replaceById(this.cases, value);
  }

  async getCaseById(tenantId: string, caseId: string): Promise<UvgCase | null> {
    return this.cases.find((uvgCase) => uvgCase.tenantId === tenantId && uvgCase.id === caseId) ?? null;
  }

  async listCases(tenantId: string, filter?: { employeeId?: string; status?: string; type?: string }): Promise<UvgCase[]> {
    return this.cases
      .filter((uvgCase) =>
        uvgCase.tenantId === tenantId &&
        (!filter?.employeeId || uvgCase.employeeId === filter.employeeId) &&
        (!filter?.status || uvgCase.caseStatus === filter.status) &&
        (!filter?.type || uvgCase.uvgCaseType === filter.type))
      .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
  }

  async createIntake(value: UvgAccidentIntake): Promise<UvgAccidentIntake> {
    return append(this.intakes, value);
  }

  async getIntakeByCase(tenantId: string, caseId: string): Promise<UvgAccidentIntake | null> {
    return this.intakes.find((intake) => intake.tenantId === tenantId && intake.uvgCaseId === caseId) ?? null;
  }

  async createInjury(value: UvgInjuryRecord): Promise<UvgInjuryRecord> {
    return append(this.injuries, value);
  }

  async listInjuriesByCase(tenantId: string, caseId: string): Promise<UvgInjuryRecord[]> {
    return this.injuries.filter((injury) => injury.tenantId === tenantId && injury.uvgCaseId === caseId);
  }

  async createCircumstance(value: UvgCircumstanceRecord): Promise<UvgCircumstanceRecord> {
    return append(this.circumstances, value);
  }

  async listCircumstancesByCase(tenantId: string, caseId: string): Promise<UvgCircumstanceRecord[]> {
    return this.circumstances.filter((circumstance) => circumstance.tenantId === tenantId && circumstance.uvgCaseId === caseId);
  }

  async createDocumentReference(value: UvgDocumentReference): Promise<UvgDocumentReference> {
    return append(this.documentReferences, value);
  }

  async listDocumentReferencesByCase(tenantId: string, caseId: string): Promise<UvgDocumentReference[]> {
    return this.documentReferences.filter((reference) => reference.tenantId === tenantId && reference.uvgCaseId === caseId);
  }

  async upsertDecision(value: UvgCaseDecision): Promise<UvgCaseDecision> {
    return replaceById(this.decisions, value);
  }

  async listDecisionsByCase(tenantId: string, caseId: string): Promise<UvgCaseDecision[]> {
    return this.decisions.filter((decision) => decision.tenantId === tenantId && decision.uvgCaseId === caseId);
  }

  async upsertCoordinationRecord(value: UvgCoordinationRecord): Promise<UvgCoordinationRecord> {
    return replaceById(this.coordinationRecords, value);
  }

  async listCoordinationRecordsByCase(tenantId: string, caseId: string): Promise<UvgCoordinationRecord[]> {
    return this.coordinationRecords.filter((record) => record.tenantId === tenantId && record.uvgCaseId === caseId);
  }

  async createReportArtifact(value: UvgAccidentReportArtifact): Promise<UvgAccidentReportArtifact> {
    return append(this.reportArtifacts, value);
  }

  async listReportArtifactsByCase(tenantId: string, caseId: string): Promise<UvgAccidentReportArtifact[]> {
    return this.reportArtifacts.filter((artifact) => artifact.tenantId === tenantId && artifact.uvgCaseId === caseId);
  }

  async createAuditEvent(value: UvgCaseAuditEvent): Promise<UvgCaseAuditEvent> {
    return append(this.auditEvents, value);
  }

  async listAuditEventsByCase(tenantId: string, caseId: string): Promise<UvgCaseAuditEvent[]> {
    return this.auditEvents
      .filter((event) => event.tenantId === tenantId && event.uvgCaseId === caseId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }
}
