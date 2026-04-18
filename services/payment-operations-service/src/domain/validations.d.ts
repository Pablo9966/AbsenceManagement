import type { PaymentRun, PaymentRunItem, PaymentStatement, PaymentReconciliationRecord } from "./types.js";
export interface ValidationIssue {
    field: string;
    message: string;
    severity: "error" | "warning";
}
export declare const hasBlockingIssues: (issues: ValidationIssue[]) => boolean;
export declare const validatePaymentRun: (run: PaymentRun) => ValidationIssue[];
export declare const validatePaymentRunItem: (item: PaymentRunItem) => ValidationIssue[];
export declare const validatePaymentStatement: (stmt: PaymentStatement) => ValidationIssue[];
export declare const validateReconciliationUpdate: (record: PaymentReconciliationRecord) => ValidationIssue[];
