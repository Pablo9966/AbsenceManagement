import { randomUUID } from "node:crypto";
import { buildAccidentReportArtifactPayload } from "../domain/report-builder.js";
import type {
  OccupationalContext,
  UvgAccidentIntake,
  UvgAccidentReportArtifact,
  UvgActorRole,
  UvgCase,
  UvgCaseAuditEvent,
  UvgCaseDecision,
  UvgCaseDetail,
  UvgCaseStatus,
  UvgCaseType,
  UvgCircumstanceRecord,
  UvgCoordinationRecord,
  UvgDecisionStatus,
  UvgDocumentReference,
  UvgDocumentRole,
  UvgInjuryRecord,
  UvgReporterRole,
} from "../domain/types.js";
import {
  hasErrors,
  validateAccidentIntake,
  validateCaseTypeContext,
  validateCoordination,
  validateInjury,
  validateStatusTransition,
  validateUvgCase,
  type ValidationIssue,
} from "../domain/validations.js";

export interface ActorContext {
  actorId: string;
  actorRole: UvgActorRole;
  effectiveAt: string;
  correlationId?: string;
}

export interface CommandResult<T> {
  data?: T;
  issues: ValidationIssue[];
}

export interface UvgCaseRepository {
  withTransaction<T>(operation: (repository: UvgCaseRepository) => Promise<T>): Promise<T>;
  createCase(value: UvgCase): Promise<UvgCase>;
  updateCase(value: UvgCase): Promise<UvgCase>;
  getCaseById(tenantId: string, caseId: string): Promise<UvgCase | null>;
  listCases(tenantId: string, filter?: { employeeId?: string; status?: string; type?: string }): Promise<UvgCase[]>;
  createIntake(value: UvgAccidentIntake): Promise<UvgAccidentIntake>;
  getIntakeByCase(tenantId: string, caseId: string): Promise<UvgAccidentIntake | null>;
  createInjury(value: UvgInjuryRecord): Promise<UvgInjuryRecord>;
  listInjuriesByCase(tenantId: string, caseId: string): Promise<UvgInjuryRecord[]>;
  createCircumstance(value: UvgCircumstanceRecord): Promise<UvgCircumstanceRecord>;
  listCircumstancesByCase(tenantId: string, caseId: string): Promise<UvgCircumstanceRecord[]>;
  createDocumentReference(value: UvgDocumentReference): Promise<UvgDocumentReference>;
  listDocumentReferencesByCase(tenantId: string, caseId: string): Promise<UvgDocumentReference[]>;
  upsertDecision(value: UvgCaseDecision): Promise<UvgCaseDecision>;
  listDecisionsByCase(tenantId: string, caseId: string): Promise<UvgCaseDecision[]>;
  upsertCoordinationRecord(value: UvgCoordinationRecord): Promise<UvgCoordinationRecord>;
  listCoordinationRecordsByCase(tenantId: string, caseId: string): Promise<UvgCoordinationRecord[]>;
  createReportArtifact(value: UvgAccidentReportArtifact): Promise<UvgAccidentReportArtifact>;
  listReportArtifactsByCase(tenantId: string, caseId: string): Promise<UvgAccidentReportArtifact[]>;
  createAuditEvent(value: UvgCaseAuditEvent): Promise<UvgCaseAuditEvent>;
  listAuditEventsByCase(tenantId: string, caseId: string): Promise<UvgCaseAuditEvent[]>;
}

export class UvgCaseService {
  constructor(private readonly repository: UvgCaseRepository) {}

  async createAccidentReport(input: {
    tenantId: string;
    employeeId: string;
    policyId: string;
    uvgCaseType: UvgCaseType;
    reporterRole: UvgReporterRole;
    reporterUserId?: string;
    employerReference?: string;
    accidentDate: string;
    accidentTime?: string;
    accidentPlace: string;
    occupationalContext: OccupationalContext;
    accidentDescription: string;
    incidentLocation?: string;
    incidentSummary?: string;
    witnessDetails?: string;
    policeInvolvedFlag: boolean;
    ktgCaseId?: string;
  }, actor: ActorContext): Promise<CommandResult<UvgCaseDetail>> {
    const caseId = randomUUID();
    const reportedAt = actor.effectiveAt;
    const caseNumber = `UVG-${input.accidentDate.slice(0, 4)}-${caseId.slice(0, 8).toUpperCase()}`;
    const uvgCase: UvgCase = {
      id: caseId,
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      policyId: input.policyId,
      caseNumber,
      uvgCaseType: input.uvgCaseType,
      caseStatus: "reported",
      accidentDate: input.accidentDate,
      reportedAt,
      reportedBy: input.reporterUserId ?? actor.actorId,
      incidentLocation: input.incidentLocation ?? input.accidentPlace,
      incidentSummary: input.incidentSummary ?? input.accidentDescription,
      createdAt: reportedAt,
      updatedAt: reportedAt,
      ktgCaseId: input.ktgCaseId,
      coordinationStatus: input.ktgCaseId ? "open" : "not_required",
      coordinationNotes: input.ktgCaseId ? "Potential KTG/UVG parallel tracking." : undefined,
    };
    const intake: UvgAccidentIntake = {
      id: randomUUID(),
      tenantId: input.tenantId,
      uvgCaseId: caseId,
      reporterRole: input.reporterRole,
      reporterUserId: input.reporterUserId,
      employerReference: input.employerReference,
      accidentDate: input.accidentDate,
      accidentTime: input.accidentTime,
      accidentPlace: input.accidentPlace,
      occupationalContext: input.occupationalContext,
      accidentDescription: input.accidentDescription,
      witnessDetails: input.witnessDetails,
      policeInvolvedFlag: input.policeInvolvedFlag,
      submittedAt: reportedAt,
    };
    const issues = [
      ...validateUvgCase(uvgCase),
      ...validateAccidentIntake(intake),
      ...validateCaseTypeContext(input.uvgCaseType, input.occupationalContext),
    ];
    if (hasErrors(issues)) return { issues };

    return this.repository.withTransaction(async (repository) => {
      await repository.createCase(uvgCase);
      await repository.createIntake(intake);
      if (input.ktgCaseId) {
        await repository.upsertCoordinationRecord({
          id: randomUUID(),
          tenantId: input.tenantId,
          uvgCaseId: caseId,
          coordinationType: "ktg_overlap",
          relatedKtgCaseId: input.ktgCaseId,
          coordinationStatus: "open",
          benefitOverlapFlag: true,
          notes: "Created from employer accident report with related KTG case.",
          updatedAt: reportedAt,
        });
      }
      await this.audit(repository, uvgCase, "uvg_case_reported", actor, { uvgCaseType: input.uvgCaseType, ktgCaseId: input.ktgCaseId });
      const detail = await this.getCaseDetail(input.tenantId, caseId);
      if (!detail) {
        return { issues: [{ field: "caseId", message: "UVG case was created but detail could not be loaded.", severity: "error" }] };
      }
      return { data: detail, issues };
    });
  }

  async listCases(tenantId: string, filter?: { employeeId?: string; status?: string; type?: string }): Promise<UvgCase[]> {
    return this.repository.listCases(tenantId, filter);
  }

  async getCaseDetail(tenantId: string, caseId: string): Promise<UvgCaseDetail | null> {
    const uvgCase = await this.repository.getCaseById(tenantId, caseId);
    if (!uvgCase) return null;
    const [intake, injuries, circumstances, documentReferences, decisions, coordinationRecords, reportArtifacts, auditEvents] = await Promise.all([
      this.repository.getIntakeByCase(tenantId, caseId),
      this.repository.listInjuriesByCase(tenantId, caseId),
      this.repository.listCircumstancesByCase(tenantId, caseId),
      this.repository.listDocumentReferencesByCase(tenantId, caseId),
      this.repository.listDecisionsByCase(tenantId, caseId),
      this.repository.listCoordinationRecordsByCase(tenantId, caseId),
      this.repository.listReportArtifactsByCase(tenantId, caseId),
      this.repository.listAuditEventsByCase(tenantId, caseId),
    ]);
    return { ...uvgCase, intake: intake ?? undefined, injuries, circumstances, documentReferences, decisions, coordinationRecords, reportArtifacts, auditEvents };
  }

  async updateCaseStatus(tenantId: string, caseId: string, nextStatus: UvgCaseStatus, actor: ActorContext): Promise<CommandResult<UvgCase>> {
    return this.repository.withTransaction(async (repository) => {
      const existing = await repository.getCaseById(tenantId, caseId);
      if (!existing) return { issues: [{ field: "caseId", message: "UVG case not found.", severity: "error" }] };
      const issues = validateStatusTransition(existing.caseStatus, nextStatus);
      if (hasErrors(issues)) return { issues };
      const updated = await repository.updateCase({ ...existing, caseStatus: nextStatus, updatedAt: actor.effectiveAt });
      await this.audit(repository, updated, "uvg_case_status_changed", actor, { from: existing.caseStatus, to: nextStatus });
      return { data: updated, issues };
    });
  }

  async recordInjury(input: Omit<UvgInjuryRecord, "id">, actor: ActorContext): Promise<CommandResult<UvgInjuryRecord>> {
    const issues = validateInjury(input);
    if (hasErrors(issues)) return { issues };
    return this.repository.withTransaction(async (repository) => {
      const uvgCase = await repository.getCaseById(input.tenantId, input.uvgCaseId);
      if (!uvgCase) return { issues: [{ field: "uvgCaseId", message: "UVG case not found.", severity: "error" }] };
      const injury = await repository.createInjury({ ...input, id: randomUUID() });
      await this.audit(repository, uvgCase, "uvg_injury_recorded", actor, { injuryId: injury.id });
      return { data: injury, issues };
    });
  }

  async recordCircumstance(input: Omit<UvgCircumstanceRecord, "id" | "createdAt">, actor: ActorContext): Promise<CommandResult<UvgCircumstanceRecord>> {
    return this.repository.withTransaction(async (repository) => {
      const uvgCase = await repository.getCaseById(input.tenantId, input.uvgCaseId);
      if (!uvgCase) return { issues: [{ field: "uvgCaseId", message: "UVG case not found.", severity: "error" }] };
      const circumstance = await repository.createCircumstance({ ...input, id: randomUUID(), createdAt: actor.effectiveAt });
      await this.audit(repository, uvgCase, "uvg_circumstance_recorded", actor, { circumstanceId: circumstance.id });
      return { data: circumstance, issues: [] };
    });
  }

  async linkDocument(input: { tenantId: string; uvgCaseId: string; documentId: string; documentRole: UvgDocumentRole }, actor: ActorContext): Promise<CommandResult<UvgDocumentReference>> {
    return this.repository.withTransaction(async (repository) => {
      const uvgCase = await repository.getCaseById(input.tenantId, input.uvgCaseId);
      if (!uvgCase) return { issues: [{ field: "uvgCaseId", message: "UVG case not found.", severity: "error" }] };
      const reference = await repository.createDocumentReference({ ...input, id: randomUUID(), linkedAt: actor.effectiveAt });
      await this.audit(repository, uvgCase, "uvg_document_linked", actor, { documentId: input.documentId, documentRole: input.documentRole });
      return { data: reference, issues: [] };
    });
  }

  async upsertCoordination(input: Omit<UvgCoordinationRecord, "id" | "updatedAt"> & { id?: string }, actor: ActorContext): Promise<CommandResult<UvgCoordinationRecord>> {
    const issues = validateCoordination(input);
    if (hasErrors(issues)) return { issues };
    return this.repository.withTransaction(async (repository) => {
      const uvgCase = await repository.getCaseById(input.tenantId, input.uvgCaseId);
      if (!uvgCase) return { issues: [{ field: "uvgCaseId", message: "UVG case not found.", severity: "error" }] };
      const coordination = await repository.upsertCoordinationRecord({ ...input, id: input.id ?? randomUUID(), updatedAt: actor.effectiveAt });
      await repository.updateCase({ ...uvgCase, ktgCaseId: coordination.relatedKtgCaseId ?? uvgCase.ktgCaseId, coordinationStatus: coordination.coordinationStatus, coordinationNotes: coordination.notes, updatedAt: actor.effectiveAt });
      await this.audit(repository, uvgCase, "uvg_coordination_updated", actor, { coordinationId: coordination.id, relatedKtgCaseId: coordination.relatedKtgCaseId });
      return { data: coordination, issues };
    });
  }

  async upsertDecision(input: Omit<UvgCaseDecision, "id" | "decidedAt"> & { id?: string; decisionStatus: UvgDecisionStatus }, actor: ActorContext): Promise<CommandResult<UvgCaseDecision>> {
    return this.repository.withTransaction(async (repository) => {
      const uvgCase = await repository.getCaseById(input.tenantId, input.uvgCaseId);
      if (!uvgCase) return { issues: [{ field: "uvgCaseId", message: "UVG case not found.", severity: "error" }] };
      const decision = await repository.upsertDecision({ ...input, id: input.id ?? randomUUID(), decidedAt: actor.effectiveAt });
      await this.audit(repository, uvgCase, "uvg_decision_recorded", actor, { decisionId: decision.id, decisionStatus: decision.decisionStatus });
      return { data: decision, issues: [] };
    });
  }

  async generateAccidentReport(tenantId: string, caseId: string, actor: ActorContext): Promise<CommandResult<UvgAccidentReportArtifact & { pdfBase64: string; pdfSizeBytes: number }>> {
    return this.repository.withTransaction(async (repository) => {
      const detail = await this.getCaseDetail(tenantId, caseId);
      if (!detail) return { issues: [{ field: "caseId", message: "UVG case not found.", severity: "error" }] };
      const pdf = buildAccidentReportArtifactPayload(detail);
      const artifact = await repository.createReportArtifact({
        id: randomUUID(),
        tenantId,
        uvgCaseId: caseId,
        reportType: "accident_report_pdf",
        fileName: `${detail.caseNumber}-accident-report.pdf`,
        storageReference: `uvg-reports/${tenantId}/${caseId}/${detail.caseNumber}.pdf`,
        generatedAt: actor.effectiveAt,
        generatedBy: actor.actorId,
      });
      await this.audit(repository, detail, "uvg_accident_report_generated", actor, { artifactId: artifact.id, storageReference: artifact.storageReference });
      return { data: { ...artifact, pdfBase64: pdf.toString("base64"), pdfSizeBytes: pdf.byteLength }, issues: [] };
    });
  }

  async listAuditEvents(tenantId: string, caseId: string): Promise<UvgCaseAuditEvent[]> {
    return this.repository.listAuditEventsByCase(tenantId, caseId);
  }

  private async audit(repository: UvgCaseRepository, uvgCase: UvgCase, eventType: string, actor: ActorContext, payload: Record<string, unknown>) {
    await repository.createAuditEvent({
      id: randomUUID(),
      tenantId: uvgCase.tenantId,
      uvgCaseId: uvgCase.id,
      eventType,
      occurredAt: actor.effectiveAt,
      actorId: actor.actorId,
      actorRole: actor.actorRole,
      correlationId: actor.correlationId,
      payload,
    });
  }
}
