export type UvgCaseType = "bu" | "nbu";
export type UvgCaseStatus =
  | "reported"
  | "intake_in_progress"
  | "under_review"
  | "awaiting_documents"
  | "coordinating"
  | "approved"
  | "rejected"
  | "closed";
export type OccupationalContext = "occupational" | "non_occupational" | "unknown";
export type UvgDecisionStatus = "pending" | "approved" | "rejected" | "partially_approved";
export type UvgCoordinationType = "ktg_overlap" | "complementary_uvg" | "benefit_overlap_review";
export type UvgCoordinationStatus = "not_required" | "open" | "in_review" | "resolved";
export type UvgReporterRole = "employer" | "employee" | "claims_handler" | "system";
export type UvgActorRole = "employer_user" | "claims_handler" | "medical_reviewer" | "system";
export type UvgDocumentRole = "accident_report" | "medical_certificate" | "police_report" | "correspondence" | "other";
export type UvgReportType = "accident_report_pdf" | "accident_report_json";

export interface UvgCase {
  id: string;
  tenantId: string;
  employeeId: string;
  policyId: string;
  caseNumber: string;
  uvgCaseType: UvgCaseType;
  caseStatus: UvgCaseStatus;
  accidentDate: string;
  reportedAt: string;
  reportedBy: string;
  incidentLocation: string;
  incidentSummary: string;
  createdAt: string;
  updatedAt: string;
  ktgCaseId?: string;
  coordinationStatus: UvgCoordinationStatus;
  coordinationNotes?: string;
}

export interface UvgAccidentIntake {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  reporterRole: UvgReporterRole;
  reporterUserId?: string;
  employerReference?: string;
  accidentDate: string;
  accidentTime?: string;
  accidentPlace: string;
  occupationalContext: OccupationalContext;
  accidentDescription: string;
  witnessDetails?: string;
  policeInvolvedFlag: boolean;
  submittedAt: string;
}

export interface UvgInjuryRecord {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  injuryType: string;
  bodyPart: string;
  severity: "minor" | "moderate" | "severe" | "critical";
  medicalTreatmentFlag: boolean;
  hospitalizedFlag: boolean;
  notes?: string;
}

export interface UvgCircumstanceRecord {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  causeCategory: string;
  activityContext: string;
  thirdPartyInvolvedFlag: boolean;
  vehicleInvolvedFlag: boolean;
  narrative: string;
  createdAt: string;
}

export interface UvgDocumentReference {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  documentId: string;
  documentRole: UvgDocumentRole;
  linkedAt: string;
}

export interface UvgCaseDecision {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  decisionStatus: UvgDecisionStatus;
  decisionReason: string;
  effectiveFrom: string;
  effectiveTo?: string;
  decidedAt: string;
  decidedBy: string;
}

export interface UvgCoordinationRecord {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  coordinationType: UvgCoordinationType;
  relatedKtgCaseId?: string;
  overlapStart?: string;
  overlapEnd?: string;
  coordinationStatus: UvgCoordinationStatus;
  benefitOverlapFlag: boolean;
  notes?: string;
  updatedAt: string;
}

export interface UvgAccidentReportArtifact {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  reportType: UvgReportType;
  fileName: string;
  storageReference: string;
  generatedAt: string;
  generatedBy: string;
}

export interface UvgCaseAuditEvent {
  id: string;
  tenantId: string;
  uvgCaseId: string;
  eventType: string;
  occurredAt: string;
  actorId: string;
  actorRole: UvgActorRole;
  correlationId?: string;
  payload: Record<string, unknown>;
}

export interface UvgCaseDetail extends UvgCase {
  intake?: UvgAccidentIntake;
  injuries: UvgInjuryRecord[];
  circumstances: UvgCircumstanceRecord[];
  documentReferences: UvgDocumentReference[];
  decisions: UvgCaseDecision[];
  coordinationRecords: UvgCoordinationRecord[];
  reportArtifacts: UvgAccidentReportArtifact[];
  auditEvents: UvgCaseAuditEvent[];
}
