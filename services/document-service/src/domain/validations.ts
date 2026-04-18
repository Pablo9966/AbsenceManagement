import type {
  DocumentAccessEvent,
  DocumentExtractionJob,
  DocumentLink,
  DocumentRecord,
  DocumentVersion,
  MedicalCertificateFact,
  UpdateDocumentExtractionJobPatch,
  UpdateDocumentPatch,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);
const isSha256 = (value: string): boolean => /^[A-Fa-f0-9]{64}$/.test(value);

const allowedExtractionJobTransitions: Record<DocumentExtractionJob["status"], DocumentExtractionJob["status"][]> = {
  pending: ["running", "cancelled"],
  running: ["completed", "failed", "cancelled"],
  failed: ["pending"],
  completed: [],
  cancelled: [],
};

export const validateDocumentRecord = (
  input: Pick<
    DocumentRecord,
    | "documentType"
    | "documentCategory"
    | "storageObjectKey"
    | "storageRegion"
    | "mimeType"
    | "fileName"
    | "fileSizeBytes"
    | "checksumSha256"
    | "encryptionKeyRef"
    | "legalHoldFlag"
    | "legalHoldReason"
    | "retentionUntil"
    | "retentionPolicyCode"
    | "uploadedAt"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.documentType) {
    issues.push({ field: "documentType", message: "Dokumenttyp ist erforderlich.", severity: "error" });
  }

  if (!input.documentCategory) {
    issues.push({ field: "documentCategory", message: "Dokumentkategorie ist erforderlich.", severity: "error" });
  }

  if (input.storageRegion !== "CH") {
    issues.push({ field: "storageRegion", message: "Speicherregion muss CH sein.", severity: "error" });
  }

  if (!input.storageObjectKey.trim()) {
    issues.push({ field: "storageObjectKey", message: "Storage-Key ist erforderlich.", severity: "error" });
  }

  if (!input.mimeType.trim()) {
    issues.push({ field: "mimeType", message: "MIME-Type ist erforderlich.", severity: "error" });
  }

  if (!input.fileName.trim()) {
    issues.push({ field: "fileName", message: "Dateiname ist erforderlich.", severity: "error" });
  }

  if (input.fileSizeBytes <= 0) {
    issues.push({ field: "fileSizeBytes", message: "Dateigroesse muss groesser als 0 sein.", severity: "error" });
  }

  if (!isSha256(input.checksumSha256)) {
    issues.push({ field: "checksumSha256", message: "SHA-256 Checksumme ist ungueltig.", severity: "error" });
  }

  if (!input.encryptionKeyRef.trim()) {
    issues.push({ field: "encryptionKeyRef", message: "KMS-Referenz ist erforderlich.", severity: "error" });
  }

  if (input.legalHoldFlag && !input.legalHoldReason?.trim()) {
    issues.push({ field: "legalHoldReason", message: "Begruendung fuer Legal Hold ist erforderlich.", severity: "error" });
  }

  if (input.retentionUntil !== undefined && !isIsoDate(input.retentionUntil)) {
    issues.push({ field: "retentionUntil", message: "Retention-Datum ist ungueltig.", severity: "error" });
  }

  if (input.retentionPolicyCode !== undefined && !input.retentionPolicyCode.trim()) {
    issues.push({ field: "retentionPolicyCode", message: "Retention-Policy darf nicht leer sein.", severity: "error" });
  }

  if (!isIsoDateTime(input.uploadedAt)) {
    issues.push({ field: "uploadedAt", message: "Upload-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateDocumentPatch = (input: UpdateDocumentPatch): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.legalHoldReason !== undefined && !input.legalHoldReason.trim()) {
    issues.push({ field: "legalHoldReason", message: "Begruendung fuer Legal Hold darf nicht leer sein.", severity: "error" });
  }

  if (input.retentionUntil !== undefined && !isIsoDate(input.retentionUntil)) {
    issues.push({ field: "retentionUntil", message: "Retention-Datum ist ungueltig.", severity: "error" });
  }

  if (input.retentionPolicyCode !== undefined && !input.retentionPolicyCode.trim()) {
    issues.push({ field: "retentionPolicyCode", message: "Retention-Policy darf nicht leer sein.", severity: "error" });
  }

  if (input.deletedAt !== undefined && !isIsoDateTime(input.deletedAt)) {
    issues.push({ field: "deletedAt", message: "Loeschzeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateDocumentLink = (
  input: Pick<DocumentLink, "linkTargetId" | "linkedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.linkTargetId.trim()) {
    issues.push({ field: "linkTargetId", message: "Verknuepfungsziel ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.linkedAt)) {
    issues.push({ field: "linkedAt", message: "Verknuepfungszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateDocumentVersion = (
  input: Pick<DocumentVersion, "versionNumber" | "storageObjectKey" | "checksumSha256" | "createdAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (input.versionNumber <= 0) {
    issues.push({ field: "versionNumber", message: "Versionsnummer muss groesser als 0 sein.", severity: "error" });
  }

  if (!input.storageObjectKey.trim()) {
    issues.push({ field: "storageObjectKey", message: "Storage-Key ist erforderlich.", severity: "error" });
  }

  if (!isSha256(input.checksumSha256)) {
    issues.push({ field: "checksumSha256", message: "SHA-256 Checksumme ist ungueltig.", severity: "error" });
  }

  if (!isIsoDateTime(input.createdAt)) {
    issues.push({ field: "createdAt", message: "Versionszeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const validateDocumentExtractionJob = (
  input: Pick<DocumentExtractionJob, "requestedAt" | "startedAt" | "completedAt" | "provider">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!isIsoDateTime(input.requestedAt)) {
    issues.push({ field: "requestedAt", message: "Anforderungszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.startedAt !== undefined && !isIsoDateTime(input.startedAt)) {
    issues.push({ field: "startedAt", message: "Startzeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.completedAt !== undefined && !isIsoDateTime(input.completedAt)) {
    issues.push({ field: "completedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.provider !== undefined && !input.provider.trim()) {
    issues.push({ field: "provider", message: "Provider darf nicht leer sein.", severity: "error" });
  }

  return issues;
};

export const validateDocumentExtractionJobPatch = (
  currentStatus: DocumentExtractionJob["status"],
  patch: UpdateDocumentExtractionJobPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (patch.startedAt !== undefined && !isIsoDateTime(patch.startedAt)) {
    issues.push({ field: "startedAt", message: "Startzeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.completedAt !== undefined && !isIsoDateTime(patch.completedAt)) {
    issues.push({ field: "completedAt", message: "Abschlusszeitpunkt ist ungueltig.", severity: "error" });
  }

  if (patch.provider !== undefined && !patch.provider.trim()) {
    issues.push({ field: "provider", message: "Provider darf nicht leer sein.", severity: "error" });
  }

  if (patch.errorMessage !== undefined && !patch.errorMessage.trim()) {
    issues.push({ field: "errorMessage", message: "Fehlermeldung darf nicht leer sein.", severity: "error" });
  }

  if (patch.status && patch.status !== currentStatus && !allowedExtractionJobTransitions[currentStatus].includes(patch.status)) {
    issues.push({
      field: "status",
      message: `Statuswechsel von ${currentStatus} nach ${patch.status} ist nicht zulaessig.`,
      severity: "error",
    });
  }

  return issues;
};

export const validateMedicalCertificateFact = (
  input: Pick<
    MedicalCertificateFact,
    | "certificateReferenceId"
    | "firstDayOfIncapacity"
    | "certificateStartDate"
    | "certificateEndDate"
    | "incapacityPercentage"
    | "issuedOn"
    | "issuingProviderName"
    | "extractionStatus"
    | "extractionConfidence"
    | "reviewedAt"
    | "supersededAt"
  >,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.certificateReferenceId.trim()) {
    issues.push({ field: "certificateReferenceId", message: "Zertifikatsreferenz ist erforderlich.", severity: "error" });
  }

  if (!isIsoDate(input.firstDayOfIncapacity)) {
    issues.push({ field: "firstDayOfIncapacity", message: "Erster Tag der Arbeitsunfaehigkeit ist ungueltig.", severity: "error" });
  }

  if (!isIsoDate(input.certificateStartDate)) {
    issues.push({ field: "certificateStartDate", message: "Zertifikatsbeginn ist ungueltig.", severity: "error" });
  }

  if (input.certificateEndDate !== undefined && !isIsoDate(input.certificateEndDate)) {
    issues.push({ field: "certificateEndDate", message: "Zertifikatsende ist ungueltig.", severity: "error" });
  }

  if (isIsoDate(input.firstDayOfIncapacity) && isIsoDate(input.certificateStartDate) && input.firstDayOfIncapacity > input.certificateStartDate) {
    issues.push({
      field: "firstDayOfIncapacity",
      message: "Erster Tag der Arbeitsunfaehigkeit darf nicht nach Zertifikatsbeginn liegen.",
      severity: "error",
    });
  }

  if (input.certificateEndDate && isIsoDate(input.certificateStartDate) && input.certificateEndDate < input.certificateStartDate) {
    issues.push({ field: "certificateEndDate", message: "Zertifikatsende darf nicht vor Zertifikatsbeginn liegen.", severity: "error" });
  }

  if (input.incapacityPercentage <= 0 || input.incapacityPercentage > 100) {
    issues.push({ field: "incapacityPercentage", message: "Arbeitsunfaehigkeit muss zwischen 0 und 100 liegen.", severity: "error" });
  }

  if (input.issuedOn !== undefined && !isIsoDate(input.issuedOn)) {
    issues.push({ field: "issuedOn", message: "Ausstellungsdatum ist ungueltig.", severity: "error" });
  }

  if (input.issuingProviderName !== undefined && !input.issuingProviderName.trim()) {
    issues.push({ field: "issuingProviderName", message: "Ausstellende Stelle darf nicht leer sein.", severity: "error" });
  }

  if (input.extractionConfidence !== undefined && (input.extractionConfidence < 0 || input.extractionConfidence > 1)) {
    issues.push({ field: "extractionConfidence", message: "Extraktionskonfidenz muss zwischen 0 und 1 liegen.", severity: "error" });
  }

  if (input.reviewedAt !== undefined && !isIsoDateTime(input.reviewedAt)) {
    issues.push({ field: "reviewedAt", message: "Review-Zeitpunkt ist ungueltig.", severity: "error" });
  }

  if (input.supersededAt !== undefined && !isIsoDateTime(input.supersededAt)) {
    issues.push({ field: "supersededAt", message: "Zeitpunkt der Ersetzung ist ungueltig.", severity: "error" });
  }

  if (input.extractionStatus === "reviewed" && input.reviewedAt === undefined) {
    issues.push({ field: "reviewedAt", message: "Review-Zeitpunkt ist fuer reviewed erforderlich.", severity: "warning" });
  }

  return issues;
};

export const validateDocumentAccessEvent = (
  input: Pick<DocumentAccessEvent, "accessedAt">,
): ValidationIssue[] => {
  if (!isIsoDateTime(input.accessedAt)) {
    return [{ field: "accessedAt", message: "Zugriffszeitpunkt ist ungueltig.", severity: "error" }];
  }

  return [];
};

export const validateDocumentConsentReference = (
  input: { recordedAt: string; employeeId: string; consentRecordId: string },
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  if (!input.employeeId.trim()) {
    issues.push({ field: "employeeId", message: "Mitarbeitende Person ist erforderlich.", severity: "error" });
  }

  if (!input.consentRecordId.trim()) {
    issues.push({ field: "consentRecordId", message: "Consent-Referenz ist erforderlich.", severity: "error" });
  }

  if (!isIsoDateTime(input.recordedAt)) {
    issues.push({ field: "recordedAt", message: "Zeitpunkt ist ungueltig.", severity: "error" });
  }

  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");
