export type DocumentType =
  | "medical_certificate"
  | "hospital_discharge"
  | "specialist_referral"
  | "physio_confirmation"
  | "accident_report"
  | "other";

export type DocumentCategory = "health_sensitive" | "claims_correspondence" | "payroll_support" | "administrative";
export type DocumentSourceChannel = "employee_portal" | "hr_portal" | "claims_portal" | "integration" | "api" | "batch";
export type DocumentActorRole = "employee" | "hr_manager" | "claims_handler" | "compliance_user" | "system" | "api";
export type DocumentStatus = "uploaded" | "available" | "under_review" | "superseded" | "quarantined" | "deleted";
export type LinkTargetType = "employee" | "absence_episode" | "absence_daily_record" | "ktg_case" | "uvg_case";
export type ExtractionStatus = "pending" | "extracted" | "reviewed" | "rejected";
export type ExtractionJobType = "ocr" | "medical_certificate_extraction" | "virus_scan" | "checksum_verification";
export type ExtractionJobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";
export type AccessType = "view_metadata" | "generate_download" | "download_file" | "view_extraction" | "export_package";
export type AccessResult = "allowed" | "denied";
export type ProcessingPurpose =
  | "absence_tracking"
  | "claims_assessment"
  | "certificate_validation"
  | "legal_retention"
  | "data_subject_request";
export type CertificateStatus = "active" | "expiring" | "expired" | "replaced" | "invalidated";
export type RetentionStatus = "active_retention" | "legal_hold" | "deletion_eligible" | "deleted_retained";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface TransparentDate extends TransparentValue<string> {
  effectiveAt: string;
}

export interface TransparentCoverageWindow
  extends TransparentValue<{
    coveredFrom: string;
    coveredTo?: string;
    certificateStatus: CertificateStatus;
    expiryAlertAt?: string;
  }> {
  effectiveAt: string;
}

export interface DocumentRecord {
  id: string;
  tenantId: string;
  employeeId?: string;
  uploaderUserId?: string;
  uploaderRole: DocumentActorRole;
  documentType: DocumentType;
  documentCategory: DocumentCategory;
  sourceChannel: DocumentSourceChannel;
  storageObjectKey: string;
  storageRegion: "CH";
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
  checksumSha256: string;
  encryptionKeyRef: string;
  status: DocumentStatus;
  retentionStatus: RetentionStatus;
  legalHoldFlag: boolean;
  legalHoldReason?: string;
  retentionUntil?: string;
  retentionPolicyCode?: string;
  supersededByDocumentVersionId?: string;
  supersededAt?: string;
  uploadedAt: string;
  deletedAt?: string;
}

export interface DocumentLink {
  id: string;
  tenantId: string;
  documentId: string;
  linkTargetType: LinkTargetType;
  linkTargetId: string;
  isPrimary: boolean;
  linkedAt: string;
}

export interface DocumentVersion {
  id: string;
  tenantId: string;
  documentId: string;
  versionNumber: number;
  storageObjectKey: string;
  checksumSha256: string;
  replacedDocumentVersionId?: string;
  createdAt: string;
}

export interface DocumentExtractionJob {
  id: string;
  tenantId: string;
  documentId: string;
  jobType: ExtractionJobType;
  status: ExtractionJobStatus;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  provider?: string;
  rawResultPayload?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface MedicalCertificateFact {
  id: string;
  tenantId: string;
  documentId: string;
  absenceEpisodeId?: string;
  certificateReferenceId: string;
  firstDayOfIncapacity: string;
  certificateStartDate: string;
  certificateEndDate?: string;
  incapacityPercentage: number;
  issuedOn?: string;
  issuingProviderName?: string;
  extractionStatus: ExtractionStatus;
  extractionConfidence?: number;
  reviewRequiredFlag: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  supersededByDocumentVersionId?: string;
  supersededAt?: string;
}

export interface CertificateCoverageWindow {
  id: string;
  tenantId: string;
  absenceEpisodeId?: string;
  medicalCertificateFactId: string;
  coveredFrom: string;
  coveredTo?: string;
  certificateStatus: CertificateStatus;
  expiryAlertAt?: string;
}

export interface DocumentAccessEvent {
  id: string;
  tenantId: string;
  documentId: string;
  actorId?: string;
  actorRole: DocumentActorRole;
  accessType: AccessType;
  purposeOfUse: ProcessingPurpose;
  correlationId?: string;
  accessedAt: string;
  result: AccessResult;
}

export interface DocumentConsentReference {
  id: string;
  tenantId: string;
  documentId: string;
  employeeId: string;
  consentRecordId: string;
  processingPurpose: ProcessingPurpose;
  recordedAt: string;
}

export interface MedicalCertificateFactDetail extends MedicalCertificateFact {
  reviewRequired: TransparentBoolean;
}

export interface CertificateCoverageWindowDetail extends CertificateCoverageWindow {
  coverageEvaluation: TransparentCoverageWindow;
}

export interface DocumentDetail extends DocumentRecord {
  links: DocumentLink[];
  versions: DocumentVersion[];
  extractionJobs: DocumentExtractionJob[];
  medicalCertificateFact?: MedicalCertificateFactDetail;
  certificateCoverageWindow?: CertificateCoverageWindowDetail;
  accessEvents: DocumentAccessEvent[];
  consentReferences: DocumentConsentReference[];
}

export interface UpdateDocumentPatch {
  documentCategory?: DocumentCategory;
  status?: DocumentStatus;
  legalHoldFlag?: boolean;
  legalHoldReason?: string;
  retentionUntil?: string;
  retentionPolicyCode?: string;
  deletedAt?: string;
}

export interface UpdateDocumentExtractionJobPatch {
  status?: ExtractionJobStatus;
  startedAt?: string;
  completedAt?: string;
  provider?: string;
  rawResultPayload?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}
