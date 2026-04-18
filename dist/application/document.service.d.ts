import type { CertificateCoverageWindow, CertificateCoverageWindowDetail, DocumentAccessEvent, DocumentActorRole, DocumentConsentReference, DocumentDetail, DocumentExtractionJob, DocumentLink, DocumentRecord, DocumentVersion, MedicalCertificateFact, MedicalCertificateFactDetail, UpdateDocumentExtractionJobPatch, UpdateDocumentPatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
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
    getCertificateCoverageWindowByFact(tenantId: string, medicalCertificateFactId: string): Promise<CertificateCoverageWindow | null>;
    listCertificateCoverageWindowsByEpisode(tenantId: string, absenceEpisodeId: string): Promise<CertificateCoverageWindow[]>;
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
export declare class DocumentService {
    private readonly repository;
    constructor(repository: DocumentRepository);
    private validateDeletionGuardrail;
    private upsertCoverageWindow;
    createDocument(document: DocumentRecord): Promise<CommandResult<DocumentRecord>>;
    updateDocument(params: {
        tenantId: string;
        documentId: string;
        patch: UpdateDocumentPatch;
    }): Promise<CommandResult<DocumentRecord>>;
    createDocumentLink(link: DocumentLink): Promise<CommandResult<DocumentLink>>;
    createDocumentVersion(version: DocumentVersion): Promise<CommandResult<DocumentVersion>>;
    createDocumentExtractionJob(job: DocumentExtractionJob): Promise<CommandResult<DocumentExtractionJob>>;
    updateDocumentExtractionJob(params: {
        tenantId: string;
        documentId: string;
        jobId: string;
        patch: UpdateDocumentExtractionJobPatch;
    }): Promise<CommandResult<DocumentExtractionJob>>;
    createMedicalCertificateFact(fact: MedicalCertificateFact, actor: ActorContext): Promise<CommandResult<MedicalCertificateFactDetail>>;
    createDocumentAccessEvent(event: DocumentAccessEvent): Promise<CommandResult<DocumentAccessEvent>>;
    createDocumentConsentReference(reference: DocumentConsentReference): Promise<CommandResult<DocumentConsentReference>>;
    getDocumentDetail(tenantId: string, documentId: string, referenceDate?: string): Promise<DocumentDetail | null>;
    getCertificateCoverageByEpisode(tenantId: string, absenceEpisodeId: string, referenceDate?: string): Promise<CertificateCoverageWindowDetail[]>;
}
