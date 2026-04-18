import type {
  CertificateStatus,
  ExtractionStatus,
  TransparentBoolean,
  TransparentCoverageWindow,
  TransparentDate,
} from "./types.js";

const formatDate = (value: Date): string => value.toISOString().slice(0, 10);

const addCalendarDays = (date: string, days: number): string => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return formatDate(next);
};

export const subtractCalendarDays = (date: string, days: number): string =>
  addCalendarDays(date, days * -1);

export const calculateReviewRequired = (input: {
  extractionStatus: ExtractionStatus;
  extractionConfidence?: number;
  confidenceThreshold: number;
  certificateStartDate?: string;
  certificateEndDate?: string;
  incapacityPercentage?: number;
  issuingProviderName?: string;
  openEndedCertificate?: boolean;
  effectiveAt: string;
}): TransparentBoolean => {
  const missingFields = [
    input.certificateStartDate ? null : "certificate_start_date",
    input.certificateEndDate || input.openEndedCertificate ? null : "certificate_end_date_or_open_ended_marker",
    input.incapacityPercentage !== undefined ? null : "incapacity_percentage",
    input.issuingProviderName ? null : "issuing_provider_name",
  ].filter((value): value is string => value !== null);
  const criticalFieldsPresent = missingFields.length === 0;
  const belowConfidenceThreshold =
    input.extractionConfidence !== undefined ? input.extractionConfidence < input.confidenceThreshold : true;
  const extractionIncomplete = input.extractionStatus === "pending" || input.extractionStatus === "rejected";
  const value = belowConfidenceThreshold || !criticalFieldsPresent || extractionIncomplete;

  return {
    value,
    formula: "extraction_confidence < confidence_threshold or critical_fields_missing or extraction_status in (pending, rejected)",
    inputs: {
      extractionStatus: input.extractionStatus,
      extractionConfidence: input.extractionConfidence,
      confidenceThreshold: input.confidenceThreshold,
      criticalFieldsPresent,
      missingFields,
      belowConfidenceThreshold,
      extractionIncomplete,
    },
    effectiveAt: input.effectiveAt,
  };
};

export const calculateExpiryAlertAt = (input: {
  certificateEndDate?: string;
  expiryAlertLeadDays: number;
  effectiveAt: string;
}): TransparentDate | undefined => {
  if (!input.certificateEndDate) {
    return undefined;
  }

  const value = subtractCalendarDays(input.certificateEndDate, input.expiryAlertLeadDays);
  return {
    value,
    formula: "certificate_end_date - expiry_alert_lead_days",
    inputs: {
      certificateEndDate: input.certificateEndDate,
      expiryAlertLeadDays: input.expiryAlertLeadDays,
    },
    effectiveAt: input.effectiveAt,
  };
};

export const calculateCertificateCoverageWindow = (input: {
  certificateStartDate: string;
  certificateEndDate?: string;
  referenceDate: string;
  expiryAlertLeadDays: number;
  replacedFlag?: boolean;
  invalidatedFlag?: boolean;
}): TransparentCoverageWindow => {
  const expiryAlert = calculateExpiryAlertAt({
    certificateEndDate: input.certificateEndDate,
    expiryAlertLeadDays: input.expiryAlertLeadDays,
    effectiveAt: input.referenceDate,
  });

  let certificateStatus: CertificateStatus = "active";
  if (input.replacedFlag) {
    certificateStatus = "replaced";
  } else if (input.invalidatedFlag) {
    certificateStatus = "invalidated";
  } else if (input.certificateEndDate && input.referenceDate > input.certificateEndDate) {
    certificateStatus = "expired";
  } else if (expiryAlert && input.referenceDate >= expiryAlert.value) {
    certificateStatus = "expiring";
  }

  return {
    value: {
      coveredFrom: input.certificateStartDate,
      coveredTo: input.certificateEndDate,
      certificateStatus,
      expiryAlertAt: expiryAlert?.value,
    },
    formula: "status = replaced | invalidated | expired | expiring | active based on replacement, review outcome, certificate_end_date, and expiry_alert_at",
    inputs: {
      certificateStartDate: input.certificateStartDate,
      certificateEndDate: input.certificateEndDate,
      referenceDate: input.referenceDate,
      expiryAlertLeadDays: input.expiryAlertLeadDays,
      replacedFlag: input.replacedFlag ?? false,
      invalidatedFlag: input.invalidatedFlag ?? false,
      expiryAlertAt: expiryAlert?.value,
    },
    effectiveAt: input.referenceDate,
  };
};
