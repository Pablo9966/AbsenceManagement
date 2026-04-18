import {
  calculateCertificateCoverageWindow,
  calculateReviewRequired,
} from "../domain/formulas.js";
import type {
  CertificateCoverageWindow,
  CertificateCoverageWindowDetail,
  DocumentAccessEvent,
  DocumentActorRole,
  DocumentConsentReference,
  DocumentDetail,
  DocumentExtractionJob,
  DocumentLink,
  DocumentRecord,
  DocumentVersion,
  MedicalCertificateFact,
  MedicalCertificateFactDetail,
  RetentionStatus,
  UpdateDocumentExtractionJobPatch,
  UpdateDocumentPatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  validateDocumentAccessEvent,
  validateDocumentConsentReference,
  validateDocumentExtractionJob,
  validateDocumentExtractionJobPatch,
  validateDocumentLink,
  validateDocumentPatch,
  validateDocumentRecord,
  validateDocumentVersion,
  validateMedicalCertificateFact,
  type ValidationIssue,
} from "../domain/validations.js";

export interface DocumentRepositoryContext {
  createDocument(document: DocumentRecord): Promise<DocumentRecord>;
  updateDocument(document: DocumentRecord): Promise<DocumentRecord>;
  getDocumentById(tenantId: string, documentId: string): Promise<DocumentRecord | null>;
  listDocuments(tenantId: string, filters?: {
    employeeId?: string;
    documentType?: DocumentRecord["documentType"];
    status?: DocumentRecord["status"];
  }): Promise<DocumentRecord[]>;
  createDocumentLink(link: DocumentLink): Promise<DocumentLink>;
  listDocumentLinksByDocument(tenantId: string, documentId: string): Promise<DocumentLink[]>;
  createDocumentVersion(version: DocumentVersion): Promise<DocumentVersion>;
  listDocumentVersionsByDocument(tenantId: string, documentId: string): Promise<DocumentVersion[]>;
  createDocumentExtractionJob(job: DocumentExtractionJob): Promise<DocumentExtractionJob>;
  updateDocumentExtractionJob(job: DocumentExtractionJob): Promise<DocumentExtractionJob>;
  getDocumentExtractionJobById(tenantId: string, jobId: string): Promise<DocumentExtractionJob | null>;
  listDocumentExtractionJobsByDocument(tenantId: string, documentId: string): Promise<DocumentExtractionJob[]>;
  createMedicalCertificateFact(fact: MedicalCertificateFact): Promise<MedicalCertificateFact>;
  updateMedicalCertificateFact(fact: MedicalCertificateFact): Promise<MedicalCertificateFact>;
  getMedicalCertificateFactByDocument(tenantId: string, documentId: string): Promise<MedicalCertificateFact | null>;
  createCertificateCoverageWindow(window: CertificateCoverageWindow): Promise<CertificateCoverageWindow>;
  updateCertificateCoverageWindow(window: CertificateCoverageWindow): Promise<CertificateCoverageWindow>;
  getCertificateCoverageWindowByFact(
    tenantId: string,
    medicalCertificateFactId: string,
  ): Promise<CertificateCoverageWindow | null>;
  listCertificateCoverageWindowsByEpisode(
    tenantId: string,
    absenceEpisodeId: string,
  ): Promise<CertificateCoverageWindow[]>;
  createDocumentAccessEvent(event: DocumentAccessEvent): Promise<DocumentAccessEvent>;
  listDocumentAccessEventsByDocument(tenantId: string, documentId: string): Promise<DocumentAccessEvent[]>;
  createDocumentConsentReference(reference: DocumentConsentReference): Promise<DocumentConsentReference>;
  listDocumentConsentReferencesByDocument(tenantId: string, documentId: string): Promise<DocumentConsentReference[]>;
}

export interface DocumentRepository extends DocumentRepositoryContext {
  withTransaction<T>(operation: (repository: DocumentRepositoryContext) => Promise<T>): Promise<T>;
}

export interface ActorContext {
  actorId?: string;
  actorRole: DocumentActorRole;
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
    case "uq_document_record_checksum_active":
      return { field: "checksumSha256", message: "Aktives Dokument mit derselben Checksumme existiert bereits.", severity: "error" };
    case "uq_document_link_tenant_document_target":
      return { field: "linkTargetId", message: "Dokument ist bereits mit diesem Ziel verknuepft.", severity: "error" };
    case "uq_document_link_primary_target":
      return { field: "isPrimary", message: "Primaere Verknuepfung fuer dieses Ziel existiert bereits.", severity: "error" };
    case "uq_document_version_document_version_number":
      return { field: "versionNumber", message: "Versionsnummer existiert bereits.", severity: "error" };
    case "uq_medical_certificate_fact_document":
      return { field: "documentId", message: "Zu diesem Dokument existiert bereits ein Zertifikatsfakt.", severity: "error" };
    case "uq_medical_certificate_fact_certificate_reference":
      return { field: "certificateReferenceId", message: "Zertifikatsreferenz existiert bereits.", severity: "error" };
    case "uq_certificate_coverage_window_fact":
      return { field: "medicalCertificateFactId", message: "Coverage Window existiert bereits.", severity: "error" };
    case "uq_document_consent_reference":
      return { field: "consentRecordId", message: "Consent-Referenz fuer diesen Zweck existiert bereits.", severity: "error" };
    case "fk_document_link_document":
    case "fk_document_version_document":
    case "fk_document_extraction_job_document":
    case "fk_medical_certificate_fact_document":
    case "fk_document_access_event_document":
    case "fk_document_consent_reference_document":
      return { field: "documentId", message: "Dokument wurde nicht gefunden oder gehoert nicht zum Tenant.", severity: "error" };
    case "fk_certificate_coverage_window_fact":
      return { field: "medicalCertificateFactId", message: "Zertifikatsfakt wurde nicht gefunden.", severity: "error" };
    default:
      return null;
  }
};

const deriveDocumentStatus = (currentStatus: DocumentRecord["status"], reviewRequiredFlag: boolean): DocumentRecord["status"] => {
  if (currentStatus === "quarantined" || currentStatus === "deleted") {
    return currentStatus;
  }

  return reviewRequiredFlag ? "under_review" : "available";
};

const calculateRetentionStatus = (input: {
  legalHoldFlag: boolean;
  retentionUntil?: string;
  deletedAt?: string;
  effectiveAt: string;
}): RetentionStatus => {
  if (input.legalHoldFlag) {
    return "legal_hold";
  }

  if (input.deletedAt) {
    return "deleted_retained";
  }

  if (input.retentionUntil && input.effectiveAt.slice(0, 10) >= input.retentionUntil) {
    return "deletion_eligible";
  }

  return "active_retention";
};

const buildMedicalCertificateFactDetail = (
  fact: MedicalCertificateFact,
  effectiveAt: string,
): MedicalCertificateFactDetail => ({
  ...fact,
  reviewRequired: calculateReviewRequired({
    extractionStatus: fact.extractionStatus,
    extractionConfidence: fact.extractionConfidence,
    confidenceThreshold: 0.85,
    certificateStartDate: fact.certificateStartDate,
    certificateEndDate: fact.certificateEndDate,
    incapacityPercentage: fact.incapacityPercentage,
    issuingProviderName: fact.issuingProviderName,
    effectiveAt,
  }),
});

const buildCertificateCoverageWindowDetail = (
  window: CertificateCoverageWindow,
  effectiveAt: string,
): CertificateCoverageWindowDetail => ({
  ...window,
  coverageEvaluation: calculateCertificateCoverageWindow({
    certificateStartDate: window.coveredFrom,
    certificateEndDate: window.coveredTo,
    referenceDate: effectiveAt.slice(0, 10),
    expiryAlertLeadDays: 3,
    replacedFlag: window.certificateStatus === "replaced",
    invalidatedFlag: window.certificateStatus === "invalidated",
  }),
});

export class DocumentService {
  constructor(private readonly repository: DocumentRepository) {}

  private validateDeletionGuardrail(document: DocumentRecord, deletedAt?: string): ValidationIssue[] {
    if (!deletedAt) {
      return [];
    }

    const issues: ValidationIssue[] = [];
    if (document.legalHoldFlag) {
      issues.push({
        field: "deletedAt",
        message: "Dokument unter Legal Hold darf nicht operativ geloescht werden.",
        severity: "error",
      });
    }

    if (document.retentionUntil && deletedAt.slice(0, 10) < document.retentionUntil) {
      issues.push({
        field: "deletedAt",
        message: `Dokument darf erst nach Ablauf der Retention am ${document.retentionUntil} geloescht werden.`,
        severity: "error",
      });
    }

    return issues;
  }

  private async upsertCoverageWindow(
    repository: DocumentRepositoryContext,
    fact: MedicalCertificateFact,
    document: DocumentRecord,
    effectiveAt: string,
  ): Promise<CertificateCoverageWindow> {
    const evaluation = calculateCertificateCoverageWindow({
      certificateStartDate: fact.certificateStartDate,
      certificateEndDate: fact.certificateEndDate,
      referenceDate: effectiveAt.slice(0, 10),
      expiryAlertLeadDays: 3,
      replacedFlag: Boolean(fact.supersededByDocumentVersionId ?? document.supersededByDocumentVersionId),
      invalidatedFlag: fact.extractionStatus === "rejected",
    });
    const existingWindow = await repository.getCertificateCoverageWindowByFact(fact.tenantId, fact.id);
    const payload: CertificateCoverageWindow = {
      id: existingWindow?.id ?? generateId(),
      tenantId: fact.tenantId,
      absenceEpisodeId: fact.absenceEpisodeId,
      medicalCertificateFactId: fact.id,
      coveredFrom: evaluation.value.coveredFrom,
      coveredTo: evaluation.value.coveredTo,
      certificateStatus: evaluation.value.certificateStatus,
      expiryAlertAt: evaluation.value.expiryAlertAt
        ? `${evaluation.value.expiryAlertAt}T00:00:00Z`
        : undefined,
    };

    if (existingWindow) {
      return repository.updateCertificateCoverageWindow(payload);
    }

    return repository.createCertificateCoverageWindow(payload);
  }

  async createDocument(document: DocumentRecord): Promise<CommandResult<DocumentRecord>> {
    const issues = validateDocumentRecord(document);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createDocument({
        ...document,
        retentionStatus: calculateRetentionStatus({
          legalHoldFlag: document.legalHoldFlag,
          retentionUntil: document.retentionUntil,
          deletedAt: document.deletedAt,
          effectiveAt: document.uploadedAt,
        }),
      });
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateDocument(params: {
    tenantId: string;
    documentId: string;
    patch: UpdateDocumentPatch;
  }): Promise<CommandResult<DocumentRecord>> {
    const issues = validateDocumentPatch(params.patch);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getDocumentById(params.tenantId, params.documentId);
        if (!existing) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const candidate: DocumentRecord = {
          ...existing,
          ...params.patch,
        };
        const deletionGuardIssues = this.validateDeletionGuardrail(candidate, params.patch.deletedAt);
        issues.push(...deletionGuardIssues);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateDocument({
          ...candidate,
          retentionStatus: calculateRetentionStatus({
            legalHoldFlag: candidate.legalHoldFlag,
            retentionUntil: candidate.retentionUntil,
            deletedAt: candidate.deletedAt,
            effectiveAt: params.patch.deletedAt ?? new Date().toISOString(),
          }),
        });

        const fact = await transaction.getMedicalCertificateFactByDocument(updated.tenantId, updated.id);
        if (fact) {
          await this.upsertCoverageWindow(transaction, fact, updated, new Date().toISOString());
        }

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

  async createDocumentLink(link: DocumentLink): Promise<CommandResult<DocumentLink>> {
    const issues = validateDocumentLink(link);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(link.tenantId, link.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createDocumentLink(link);
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

  async createDocumentVersion(version: DocumentVersion): Promise<CommandResult<DocumentVersion>> {
    const issues = validateDocumentVersion(version);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(version.tenantId, version.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const existingVersions = await transaction.listDocumentVersionsByDocument(version.tenantId, version.documentId);
        const latestVersionNumber = existingVersions.reduce((maximum, item) => Math.max(maximum, item.versionNumber), 0);
        if (version.versionNumber !== latestVersionNumber + 1) {
          return {
            issues: [{
              field: "versionNumber",
              message: `Naechste Versionsnummer muss ${latestVersionNumber + 1} sein.`,
              severity: "error",
            }],
          };
        }

        if (
          version.replacedDocumentVersionId &&
          !existingVersions.some((item) => item.id === version.replacedDocumentVersionId)
        ) {
          return {
            issues: [{
              field: "replacedDocumentVersionId",
              message: "Zu ersetzende Dokumentversion wurde nicht gefunden.",
              severity: "error",
            }],
          };
        }

        const created = await transaction.createDocumentVersion(version);
        if (version.replacedDocumentVersionId) {
          const supersededDocument = await transaction.updateDocument({
            ...document,
            status: "superseded",
            supersededByDocumentVersionId: created.id,
            supersededAt: created.createdAt,
            retentionStatus: calculateRetentionStatus({
              legalHoldFlag: document.legalHoldFlag,
              retentionUntil: document.retentionUntil,
              deletedAt: document.deletedAt,
              effectiveAt: created.createdAt,
            }),
          });
          const fact = await transaction.getMedicalCertificateFactByDocument(version.tenantId, version.documentId);
          if (fact) {
            const supersededFact = await transaction.updateMedicalCertificateFact({
              ...fact,
              supersededByDocumentVersionId: created.id,
              supersededAt: created.createdAt,
            });
            await this.upsertCoverageWindow(transaction, supersededFact, supersededDocument, created.createdAt);
          }
        }

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

  async createDocumentExtractionJob(job: DocumentExtractionJob): Promise<CommandResult<DocumentExtractionJob>> {
    const issues = validateDocumentExtractionJob(job);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(job.tenantId, job.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createDocumentExtractionJob(job);
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

  async updateDocumentExtractionJob(params: {
    tenantId: string;
    documentId: string;
    jobId: string;
    patch: UpdateDocumentExtractionJobPatch;
  }): Promise<CommandResult<DocumentExtractionJob>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(params.tenantId, params.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const job = await transaction.getDocumentExtractionJobById(params.tenantId, params.jobId);
        if (!job || job.documentId !== params.documentId) {
          return { issues: [{ field: "jobId", message: "Extraktionsjob wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateDocumentExtractionJobPatch(job.status, params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateDocumentExtractionJob({
          ...job,
          ...params.patch,
        });
        return { data: updated, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createMedicalCertificateFact(
    fact: MedicalCertificateFact,
    actor: ActorContext,
  ): Promise<CommandResult<MedicalCertificateFactDetail>> {
    const issues = validateMedicalCertificateFact(fact);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(fact.tenantId, fact.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const reviewRequired = calculateReviewRequired({
          extractionStatus: fact.extractionStatus,
          extractionConfidence: fact.extractionConfidence,
          confidenceThreshold: 0.85,
          certificateStartDate: fact.certificateStartDate,
          certificateEndDate: fact.certificateEndDate,
          incapacityPercentage: fact.incapacityPercentage,
          issuingProviderName: fact.issuingProviderName,
          effectiveAt: actor.effectiveAt,
        });
        const payload: MedicalCertificateFact = {
          ...fact,
          reviewRequiredFlag: reviewRequired.value,
          supersededByDocumentVersionId: undefined,
          supersededAt: undefined,
        };

        const existing = await transaction.getMedicalCertificateFactByDocument(fact.tenantId, fact.documentId);
        const persisted = existing
          ? await transaction.updateMedicalCertificateFact({
              ...existing,
              ...payload,
            })
          : await transaction.createMedicalCertificateFact(payload);

        const nextDocumentStatus = deriveDocumentStatus(document.status, persisted.reviewRequiredFlag);
        const updatedDocument =
          nextDocumentStatus === document.status
            && !document.supersededByDocumentVersionId
            && !document.supersededAt
            ? document
            : await transaction.updateDocument({
                ...document,
                status: nextDocumentStatus,
                supersededByDocumentVersionId: undefined,
                supersededAt: undefined,
                retentionStatus: calculateRetentionStatus({
                  legalHoldFlag: document.legalHoldFlag,
                  retentionUntil: document.retentionUntil,
                  deletedAt: document.deletedAt,
                  effectiveAt: actor.effectiveAt,
                }),
              });

        await this.upsertCoverageWindow(transaction, persisted, updatedDocument, actor.effectiveAt);

        return { data: buildMedicalCertificateFactDetail(persisted, actor.effectiveAt), issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createDocumentAccessEvent(event: DocumentAccessEvent): Promise<CommandResult<DocumentAccessEvent>> {
    const issues = validateDocumentAccessEvent(event);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(event.tenantId, event.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createDocumentAccessEvent(event);
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

  async createDocumentConsentReference(
    reference: DocumentConsentReference,
  ): Promise<CommandResult<DocumentConsentReference>> {
    const issues = validateDocumentConsentReference(reference);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const document = await transaction.getDocumentById(reference.tenantId, reference.documentId);
        if (!document) {
          return { issues: [{ field: "documentId", message: "Dokument wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createDocumentConsentReference(reference);
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

  async getDocumentDetail(tenantId: string, documentId: string, referenceDate?: string): Promise<DocumentDetail | null> {
    const document = await this.repository.getDocumentById(tenantId, documentId);
    if (!document) {
      return null;
    }

    const effectiveAt = referenceDate ?? new Date().toISOString();
    const [links, versions, extractionJobs, fact, accessEvents, consentReferences] = await Promise.all([
      this.repository.listDocumentLinksByDocument(tenantId, documentId),
      this.repository.listDocumentVersionsByDocument(tenantId, documentId),
      this.repository.listDocumentExtractionJobsByDocument(tenantId, documentId),
      this.repository.getMedicalCertificateFactByDocument(tenantId, documentId),
      this.repository.listDocumentAccessEventsByDocument(tenantId, documentId),
      this.repository.listDocumentConsentReferencesByDocument(tenantId, documentId),
    ]);
    const coverageWindow = fact
      ? await this.repository.getCertificateCoverageWindowByFact(tenantId, fact.id)
      : null;

    return {
      ...document,
      links,
      versions,
      extractionJobs,
      medicalCertificateFact: fact ? buildMedicalCertificateFactDetail(fact, effectiveAt) : undefined,
      certificateCoverageWindow: coverageWindow ? buildCertificateCoverageWindowDetail(coverageWindow, effectiveAt) : undefined,
      accessEvents,
      consentReferences,
    };
  }

  async getCertificateCoverageByEpisode(
    tenantId: string,
    absenceEpisodeId: string,
    referenceDate?: string,
  ): Promise<CertificateCoverageWindowDetail[]> {
    const windows = await this.repository.listCertificateCoverageWindowsByEpisode(tenantId, absenceEpisodeId);
    const effectiveAt = referenceDate ?? new Date().toISOString();
    return windows.map((window) => buildCertificateCoverageWindowDetail(window, effectiveAt));
  }
}
