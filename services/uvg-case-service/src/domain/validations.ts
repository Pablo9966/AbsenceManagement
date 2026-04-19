import type {
  OccupationalContext,
  UvgAccidentIntake,
  UvgCase,
  UvgCaseStatus,
  UvgCaseType,
  UvgCoordinationRecord,
  UvgInjuryRecord,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);

const statusTransitions: Record<UvgCaseStatus, UvgCaseStatus[]> = {
  reported: ["intake_in_progress", "under_review", "awaiting_documents", "coordinating", "closed"],
  intake_in_progress: ["under_review", "awaiting_documents", "coordinating", "closed"],
  under_review: ["awaiting_documents", "coordinating", "approved", "rejected", "closed"],
  awaiting_documents: ["under_review", "coordinating", "closed"],
  coordinating: ["under_review", "approved", "rejected", "closed"],
  approved: ["coordinating", "closed"],
  rejected: ["closed"],
  closed: [],
};

export const validateCaseTypeContext = (uvgCaseType: UvgCaseType, occupationalContext: OccupationalContext): ValidationIssue[] => {
  if (uvgCaseType === "bu" && occupationalContext === "non_occupational") {
    return [{ field: "occupationalContext", message: "BU cases require occupational context.", severity: "error" }];
  }
  if (uvgCaseType === "nbu" && occupationalContext === "occupational") {
    return [{ field: "occupationalContext", message: "NBU cases require non-occupational context.", severity: "error" }];
  }
  return [];
};

export const validateUvgCase = (input: Pick<UvgCase, "tenantId" | "employeeId" | "policyId" | "caseNumber" | "uvgCaseType" | "accidentDate" | "reportedAt" | "incidentLocation" | "incidentSummary">): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  for (const field of ["tenantId", "employeeId", "policyId", "caseNumber", "incidentLocation", "incidentSummary"] as const) {
    if (!input[field].trim()) {
      issues.push({ field, message: `${field} is required.`, severity: "error" });
    }
  }
  if (input.uvgCaseType !== "bu" && input.uvgCaseType !== "nbu") {
    issues.push({ field: "uvgCaseType", message: "UVG case type must be bu or nbu.", severity: "error" });
  }
  if (!isIsoDate(input.accidentDate)) {
    issues.push({ field: "accidentDate", message: "Accident date must be an ISO date.", severity: "error" });
  }
  if (!isIsoDateTime(input.reportedAt)) {
    issues.push({ field: "reportedAt", message: "Reported at must be an ISO datetime.", severity: "error" });
  }
  return issues;
};

export const validateAccidentIntake = (input: Pick<UvgAccidentIntake, "accidentDate" | "accidentPlace" | "occupationalContext" | "accidentDescription" | "submittedAt">): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!isIsoDate(input.accidentDate)) issues.push({ field: "accidentDate", message: "Accident date must be an ISO date.", severity: "error" });
  if (!input.accidentPlace.trim()) issues.push({ field: "accidentPlace", message: "Accident place is required.", severity: "error" });
  if (!["occupational", "non_occupational", "unknown"].includes(input.occupationalContext)) {
    issues.push({ field: "occupationalContext", message: "Occupational context is invalid.", severity: "error" });
  }
  if (!input.accidentDescription.trim()) issues.push({ field: "accidentDescription", message: "Accident description is required.", severity: "error" });
  if (!isIsoDateTime(input.submittedAt)) issues.push({ field: "submittedAt", message: "Submitted at must be an ISO datetime.", severity: "error" });
  return issues;
};

export const validateInjury = (input: Pick<UvgInjuryRecord, "injuryType" | "bodyPart" | "severity">): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.injuryType.trim()) issues.push({ field: "injuryType", message: "Injury type is required.", severity: "error" });
  if (!input.bodyPart.trim()) issues.push({ field: "bodyPart", message: "Body part is required.", severity: "error" });
  if (!["minor", "moderate", "severe", "critical"].includes(input.severity)) {
    issues.push({ field: "severity", message: "Severity is invalid.", severity: "error" });
  }
  return issues;
};

export const validateCoordination = (input: Pick<UvgCoordinationRecord, "coordinationType" | "overlapStart" | "overlapEnd">): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!["ktg_overlap", "complementary_uvg", "benefit_overlap_review"].includes(input.coordinationType)) {
    issues.push({ field: "coordinationType", message: "Coordination type is invalid.", severity: "error" });
  }
  if (input.overlapStart && !isIsoDate(input.overlapStart)) issues.push({ field: "overlapStart", message: "Overlap start must be an ISO date.", severity: "error" });
  if (input.overlapEnd && !isIsoDate(input.overlapEnd)) issues.push({ field: "overlapEnd", message: "Overlap end must be an ISO date.", severity: "error" });
  if (input.overlapStart && input.overlapEnd && input.overlapEnd < input.overlapStart) {
    issues.push({ field: "overlapEnd", message: "Overlap end cannot be before overlap start.", severity: "error" });
  }
  return issues;
};

export const validateStatusTransition = (from: UvgCaseStatus, to: UvgCaseStatus): ValidationIssue[] => {
  if (from === to) return [];
  return statusTransitions[from].includes(to)
    ? []
    : [{ field: "caseStatus", message: `UVG status transition from ${from} to ${to} is not allowed.`, severity: "error" }];
};

export const hasErrors = (issues: ValidationIssue[]): boolean => issues.some((issue) => issue.severity === "error");
