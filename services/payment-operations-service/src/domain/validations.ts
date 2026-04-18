import type { PaymentRun, PaymentRunItem, PaymentStatement, PaymentReconciliationRecord } from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export const hasBlockingIssues = (issues: ValidationIssue[]): boolean =>
  issues.some((issue) => issue.severity === "error");

export const validatePaymentRun = (run: PaymentRun): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!run.tenantId) {
    issues.push({ field: "tenantId", message: "Mandant-ID ist erforderlich.", severity: "error" });
  }
  if (!run.runNumber || run.runNumber.trim().length === 0) {
    issues.push({ field: "runNumber", message: "Laufnummer ist erforderlich.", severity: "error" });
  }
  if (!run.createdBy) {
    issues.push({ field: "createdBy", message: "Ersteller ist erforderlich.", severity: "error" });
  }
  if (run.totalGrossAmountChf < 0) {
    issues.push({ field: "totalGrossAmountChf", message: "Bruttobetrag darf nicht negativ sein.", severity: "error" });
  }
  if (run.totalNetAmountChf < 0) {
    issues.push({ field: "totalNetAmountChf", message: "Nettobetrag darf nicht negativ sein.", severity: "error" });
  }
  if (run.instructionCount < 0) {
    issues.push({ field: "instructionCount", message: "Anzahl Instruktionen darf nicht negativ sein.", severity: "error" });
  }
  return issues;
};

export const validatePaymentRunItem = (item: PaymentRunItem): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!item.paymentInstructionId) {
    issues.push({ field: "paymentInstructionId", message: "Zahlungsinstruktion-ID ist erforderlich.", severity: "error" });
  }
  if (!item.ktgCaseId) {
    issues.push({ field: "ktgCaseId", message: "KTG-Fall-ID ist erforderlich.", severity: "error" });
  }
  if (!item.payeeReference) {
    issues.push({ field: "payeeReference", message: "Zahlungsempfaenger-Referenz ist erforderlich.", severity: "error" });
  }
  if (!item.paymentPeriodStart || !item.paymentPeriodEnd) {
    issues.push({ field: "paymentPeriodStart", message: "Zahlungszeitraum ist erforderlich.", severity: "error" });
  }
  if (item.grossAmountChf < 0) {
    issues.push({ field: "grossAmountChf", message: "Bruttobetrag darf nicht negativ sein.", severity: "error" });
  }
  if (item.netAmountChf < 0) {
    issues.push({ field: "netAmountChf", message: "Nettobetrag darf nicht negativ sein.", severity: "error" });
  }
  return issues;
};

export const validatePaymentStatement = (stmt: PaymentStatement): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!stmt.ktgCaseId) {
    issues.push({ field: "ktgCaseId", message: "KTG-Fall-ID ist erforderlich.", severity: "error" });
  }
  if (!stmt.paymentRunId) {
    issues.push({ field: "paymentRunId", message: "Zahlungslauf-ID ist erforderlich.", severity: "error" });
  }
  if (!stmt.statementPeriodStart || !stmt.statementPeriodEnd) {
    issues.push({ field: "statementPeriodStart", message: "Abrechnungszeitraum ist erforderlich.", severity: "error" });
  }
  return issues;
};

export const validateReconciliationUpdate = (record: PaymentReconciliationRecord): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!record.paymentRunId) {
    issues.push({ field: "paymentRunId", message: "Zahlungslauf-ID ist erforderlich.", severity: "error" });
  }
  if (record.reconciliationStatus === "mismatch" && !record.mismatchReason) {
    issues.push({ field: "mismatchReason", message: "Abweichungsgrund ist bei Mismatch erforderlich.", severity: "warning" });
  }
  return issues;
};
