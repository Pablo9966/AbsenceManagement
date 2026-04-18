import { buildStatementPdf } from "../domain/pdf-builder.js";
import { hasBlockingIssues, validatePaymentRun, validatePaymentRunItem, validatePaymentStatement, validateReconciliationUpdate, } from "../domain/validations.js";
const generateId = () => crypto.randomUUID();
export class PaymentOperationsService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async appendAuditEvent(repo, input, actor) {
        await repo.createAuditEvent({
            id: generateId(),
            tenantId: input.tenantId,
            paymentRunId: input.paymentRunId,
            paymentInstructionId: input.paymentInstructionId,
            eventType: input.eventType,
            occurredAt: actor.effectiveAt,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            correlationId: actor.correlationId,
            payload: input.payload,
        });
    }
    async createPaymentRun(input, actor) {
        const existingRuns = await this.repository.listPaymentRuns(input.tenantId);
        const runNumber = `RUN-${new Date(actor.effectiveAt).getFullYear()}-${String(existingRuns.length + 1).padStart(3, "0")}`;
        const run = {
            id: generateId(),
            tenantId: input.tenantId,
            runNumber,
            runType: input.runType,
            runStatus: "draft",
            createdAt: actor.effectiveAt,
            createdBy: actor.actorId,
            scheduledExecutionAt: input.scheduledExecutionAt,
            currency: "CHF",
            totalGrossAmountChf: 0,
            totalNetAmountChf: 0,
            instructionCount: 0,
            reconciliationStatus: "not_started",
            notes: input.notes,
        };
        const issues = validatePaymentRun(run);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        return this.repository.withTransaction(async (repo) => {
            const created = await repo.createPaymentRun(run);
            await this.appendAuditEvent(repo, {
                tenantId: input.tenantId,
                paymentRunId: created.id,
                eventType: "run_created",
                payload: { runNumber: created.runNumber, runType: created.runType },
            }, actor);
            return { data: created, issues };
        });
    }
    async addInstructionToRun(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            if (run.runStatus !== "draft") {
                return { issues: [{ field: "runStatus", message: "Instruktionen koennen nur zu einem Entwurf-Lauf hinzugefuegt werden.", severity: "error" }] };
            }
            const existing = await repo.findActiveRunItemByInstruction(params.tenantId, params.paymentInstruction.id);
            if (existing) {
                return {
                    issues: [{
                            field: "paymentInstructionId",
                            message: "Diese Zahlungsinstruktion ist bereits in einem aktiven Lauf enthalten.",
                            severity: "error",
                        }],
                };
            }
            const item = {
                id: generateId(),
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                paymentInstructionId: params.paymentInstruction.id,
                ktgCaseId: params.paymentInstruction.ktgCaseId,
                payeeType: params.paymentInstruction.payeeType,
                payeeReference: params.paymentInstruction.payeeReference,
                paymentPeriodStart: params.paymentInstruction.paymentPeriodStart,
                paymentPeriodEnd: params.paymentInstruction.paymentPeriodEnd,
                grossAmountChf: params.paymentInstruction.grossAmountChf,
                netAmountChf: params.paymentInstruction.netAmountChf,
                itemStatus: "included",
                includedAt: actor.effectiveAt,
            };
            const itemIssues = validatePaymentRunItem(item);
            if (hasBlockingIssues(itemIssues)) {
                return { issues: itemIssues };
            }
            const created = await repo.createPaymentRunItem(item);
            await repo.updatePaymentRun({
                ...run,
                totalGrossAmountChf: run.totalGrossAmountChf + item.grossAmountChf,
                totalNetAmountChf: run.totalNetAmountChf + item.netAmountChf,
                instructionCount: run.instructionCount + 1,
            });
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                paymentInstructionId: params.paymentInstruction.id,
                eventType: "instruction_added_to_run",
                payload: { paymentInstructionId: params.paymentInstruction.id, netAmountChf: item.netAmountChf },
            }, actor);
            return { data: created, issues: [] };
        });
    }
    async removeInstructionFromRun(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            if (run.runStatus !== "draft") {
                return { issues: [{ field: "runStatus", message: "Instruktionen koennen nur aus einem Entwurf-Lauf entfernt werden.", severity: "error" }] };
            }
            const items = await repo.listPaymentRunItemsByRun(params.tenantId, params.runId);
            const item = items.find((i) => i.id === params.runItemId);
            if (!item) {
                return { issues: [{ field: "runItemId", message: "Laufposition nicht gefunden.", severity: "error" }] };
            }
            const updated = await repo.updatePaymentRunItem({
                ...item,
                itemStatus: "excluded",
                excludedReason: params.reason,
            });
            await repo.updatePaymentRun({
                ...run,
                totalGrossAmountChf: Math.max(0, run.totalGrossAmountChf - item.grossAmountChf),
                totalNetAmountChf: Math.max(0, run.totalNetAmountChf - item.netAmountChf),
                instructionCount: Math.max(0, run.instructionCount - 1),
            });
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                paymentInstructionId: item.paymentInstructionId,
                eventType: "instruction_removed_from_run",
                payload: { runItemId: params.runItemId, reason: params.reason },
            }, actor);
            return { data: updated, issues: [] };
        });
    }
    async markReadyForExport(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            if (run.runStatus !== "draft") {
                return { issues: [{ field: "runStatus", message: "Nur Entwuerfe koennen zur Exportfreigabe markiert werden.", severity: "error" }] };
            }
            const items = await repo.listPaymentRunItemsByRun(params.tenantId, params.runId);
            const includedItems = items.filter((i) => i.itemStatus === "included");
            if (includedItems.length === 0) {
                return { issues: [{ field: "instructionCount", message: "Zahlungslauf muss mindestens eine aktive Position enthalten.", severity: "error" }] };
            }
            const updated = await repo.updatePaymentRun({ ...run, runStatus: "ready_for_export" });
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                eventType: "run_marked_ready_for_export",
                payload: { instructionCount: includedItems.length },
            }, actor);
            return { data: updated, issues: [] };
        });
    }
    async cancelPaymentRun(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            if (run.runStatus === "completed" || run.runStatus === "cancelled") {
                return { issues: [{ field: "runStatus", message: "Abgeschlossene oder stornierte Laeufe koennen nicht storniert werden.", severity: "error" }] };
            }
            const items = await repo.listPaymentRunItemsByRun(params.tenantId, params.runId);
            for (const item of items) {
                if (item.itemStatus === "included" || item.itemStatus === "exported") {
                    await repo.updatePaymentRunItem({ ...item, itemStatus: "excluded", excludedReason: "run_cancelled" });
                }
            }
            const updated = await repo.updatePaymentRun({
                ...run,
                runStatus: "cancelled",
                cancelledAt: actor.effectiveAt,
            });
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                eventType: "run_cancelled",
                payload: {},
            }, actor);
            return { data: updated, issues: [] };
        });
    }
    async generateExportPackage(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            if (run.runStatus !== "ready_for_export" && run.runStatus !== "exported") {
                return {
                    issues: [{
                            field: "runStatus",
                            message: "Export ist nur fuer Laeufe im Status ready_for_export moeglich.",
                            severity: "error",
                        }],
                };
            }
            const items = await repo.listPaymentRunItemsByRun(params.tenantId, params.runId);
            const activeItems = items.filter((i) => i.itemStatus === "included" || i.itemStatus === "exported");
            let content;
            let extension;
            if (params.format === "pain_001") {
                extension = "xml";
                content = buildPain001Xml(run, activeItems);
            }
            else if (params.format === "csv") {
                extension = "csv";
                content = buildCsvExport(run, activeItems);
            }
            else {
                extension = "json";
                content = JSON.stringify({ run, items: activeItems }, null, 2);
            }
            const checksum = computeSimpleChecksum(content);
            const fileName = `${run.runNumber}.${extension}`;
            const storageRef = `memory://exports/${run.id}.${extension}`;
            const pkg = {
                id: generateId(),
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                exportFormat: params.format,
                fileName,
                storageReference: storageRef,
                checksum,
                generatedAt: actor.effectiveAt,
                generatedBy: params.generatedBy,
                exportStatus: "generated",
            };
            const created = await repo.createExportPackage(pkg);
            for (const item of activeItems) {
                await repo.updatePaymentRunItem({ ...item, itemStatus: "exported" });
            }
            const existingRecon = await repo.getReconciliationRecordByRun(params.tenantId, params.runId);
            if (!existingRecon) {
                await repo.createReconciliationRecord({
                    id: generateId(),
                    tenantId: params.tenantId,
                    paymentRunId: params.runId,
                    reconciliationStatus: "not_started",
                });
            }
            await repo.updatePaymentRun({
                ...run,
                runStatus: "exported",
                exportedAt: actor.effectiveAt,
            });
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                eventType: "export_package_generated",
                payload: { exportFormat: params.format, fileName },
            }, actor);
            return { data: created, issues: [] };
        });
    }
    async generateStatement(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            const lines = buildStatementLines(params.statementType, run, params);
            const pdfBuffer = buildStatementPdf(lines);
            const statementId = generateId();
            const fileName = `${params.statementType}-${statementId}.pdf`;
            const stmt = {
                id: statementId,
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                paymentInstructionId: params.paymentInstructionId,
                ktgCaseId: params.ktgCaseId,
                statementType: params.statementType,
                statementPeriodStart: params.taggelddispositivData?.statementPeriodStart ?? run.createdAt.slice(0, 10),
                statementPeriodEnd: params.taggelddispositivData?.statementPeriodEnd ?? actor.effectiveAt.slice(0, 10),
                fileName,
                storageReference: `memory://statements/${statementId}.pdf`,
                pdfSizeBytes: pdfBuffer.byteLength,
                generatedAt: actor.effectiveAt,
            };
            const issues = validatePaymentStatement(stmt);
            if (hasBlockingIssues(issues)) {
                return { issues };
            }
            const created = await repo.createPaymentStatement(stmt);
            const existingSummary = await repo.getSettlementSummaryByCase(params.tenantId, params.ktgCaseId);
            if (existingSummary) {
                await repo.upsertSettlementSummary({ ...existingSummary, lastStatementAt: actor.effectiveAt, updatedAt: actor.effectiveAt });
            }
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                paymentInstructionId: params.paymentInstructionId,
                eventType: "statement_generated",
                payload: { statementType: params.statementType, fileName, pdfSizeBytes: pdfBuffer.byteLength },
            }, actor);
            return { data: created, issues: [] };
        });
    }
    async updateReconciliationStatus(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            let record = await repo.getReconciliationRecordByRun(params.tenantId, params.runId);
            if (!record) {
                record = await repo.createReconciliationRecord({
                    id: generateId(),
                    tenantId: params.tenantId,
                    paymentRunId: params.runId,
                    reconciliationStatus: params.status,
                });
            }
            const updated = {
                ...record,
                reconciliationStatus: params.status,
                reconciledAt: params.status === "confirmed" || params.status === "matched" ? actor.effectiveAt : record.reconciledAt,
                reconciledBy: params.reconciledBy ?? record.reconciledBy,
                mismatchReason: params.mismatchReason ?? record.mismatchReason,
                payrollBookingReference: params.payrollBookingReference ?? record.payrollBookingReference,
                confirmationReceivedAt: params.status === "confirmed" ? actor.effectiveAt : record.confirmationReceivedAt,
            };
            const issues = validateReconciliationUpdate(updated);
            const saved = await repo.updateReconciliationRecord(updated);
            const nextRunStatus = params.status === "confirmed" ? "reconciled" :
                params.status === "matched" ? "awaiting_reconciliation" :
                    run.runStatus;
            if (nextRunStatus !== run.runStatus) {
                await repo.updatePaymentRun({
                    ...run,
                    runStatus: nextRunStatus,
                    reconciliationStatus: params.status,
                    completedAt: params.status === "confirmed" ? actor.effectiveAt : run.completedAt,
                });
            }
            else {
                await repo.updatePaymentRun({ ...run, reconciliationStatus: params.status });
            }
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                eventType: "reconciliation_status_updated",
                payload: { status: params.status, payrollBookingReference: params.payrollBookingReference },
            }, actor);
            return { data: saved, issues };
        });
    }
    async recordPayrollBookingConfirmation(params, actor) {
        return this.repository.withTransaction(async (repo) => {
            const run = await repo.getPaymentRunById(params.tenantId, params.runId);
            if (!run) {
                return { issues: [{ field: "runId", message: "Zahlungslauf nicht gefunden.", severity: "error" }] };
            }
            const confirmation = {
                id: generateId(),
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                confirmationReference: params.confirmationReference,
                confirmedAt: actor.effectiveAt,
                confirmedBy: params.confirmedBy,
                bookingPayloadJson: params.bookingPayload,
            };
            const created = await repo.createPayrollBookingConfirmation(confirmation);
            const recon = await repo.getReconciliationRecordByRun(params.tenantId, params.runId);
            if (recon) {
                await repo.updateReconciliationRecord({
                    ...recon,
                    payrollBookingReference: params.confirmationReference,
                    confirmationReceivedAt: actor.effectiveAt,
                });
            }
            await this.appendAuditEvent(repo, {
                tenantId: params.tenantId,
                paymentRunId: params.runId,
                eventType: "payroll_booking_confirmation_recorded",
                payload: { confirmationReference: params.confirmationReference, confirmedBy: params.confirmedBy },
            }, actor);
            return { data: created, issues: [] };
        });
    }
    async getPaymentRunDetail(tenantId, runId) {
        const run = await this.repository.getPaymentRunById(tenantId, runId);
        if (!run)
            return null;
        const [items, exportPackages, statements, reconciliationRecord, bookingConfirmation, auditEvents] = await Promise.all([
            this.repository.listPaymentRunItemsByRun(tenantId, runId),
            this.repository.listExportPackagesByRun(tenantId, runId),
            this.repository.listStatementsByRun(tenantId, runId),
            this.repository.getReconciliationRecordByRun(tenantId, runId),
            this.repository.getPayrollBookingConfirmationByRun(tenantId, runId),
            this.repository.listAuditEventsByRun(tenantId, runId),
        ]);
        return {
            ...run,
            items,
            exportPackages,
            statements,
            reconciliationRecord: reconciliationRecord ?? undefined,
            bookingConfirmation: bookingConfirmation ?? undefined,
            auditEvents,
        };
    }
    async listPaymentRuns(tenantId, filters) {
        return this.repository.listPaymentRuns(tenantId, filters);
    }
    async getSettlementSummaryByCase(tenantId, ktgCaseId) {
        return this.repository.getSettlementSummaryByCase(tenantId, ktgCaseId);
    }
    async listSettlementSummaries(tenantId) {
        return this.repository.listSettlementSummaries(tenantId);
    }
    async listReconciliationRecords(tenantId, filters) {
        return this.repository.listReconciliationRecords(tenantId, filters);
    }
    async listAuditEvents(tenantId, filters) {
        return this.repository.listAuditEvents(tenantId, filters);
    }
}
const buildPain001Xml = (run, items) => {
    const total = items.reduce((sum, i) => sum + i.netAmountChf, 0).toFixed(2);
    const txEntries = items
        .map((item) => `    <CdtTrfTxInf>
      <PmtId><EndToEndId>${item.id}</EndToEndId></PmtId>
      <Amt><InstdAmt Ccy="CHF">${item.netAmountChf.toFixed(2)}</InstdAmt></Amt>
      <Cdtr><Nm>${item.payeeReference}</Nm></Cdtr>
      <RmtInf><Ustrd>KTG ${item.ktgCaseId} ${item.paymentPeriodStart}/${item.paymentPeriodEnd}</Ustrd></RmtInf>
    </CdtTrfTxInf>`)
        .join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${run.runNumber}</MsgId>
      <CreDtTm>${run.createdAt}</CreDtTm>
      <NbOfTxs>${items.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <InitgPty><Nm>elipsLife AG</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${run.id}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${items.length}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${run.scheduledExecutionAt?.slice(0, 10) ?? run.createdAt.slice(0, 10)}</ReqdExctnDt>
      <Dbtr><Nm>elipsLife AG</Nm></Dbtr>
${txEntries}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
};
const buildCsvExport = (run, items) => {
    const header = "run_number,item_id,payment_instruction_id,ktg_case_id,payee_reference,period_start,period_end,gross_chf,net_chf";
    const rows = items.map((i) => `${run.runNumber},${i.id},${i.paymentInstructionId},${i.ktgCaseId},${i.payeeReference},${i.paymentPeriodStart},${i.paymentPeriodEnd},${i.grossAmountChf.toFixed(2)},${i.netAmountChf.toFixed(2)}`);
    return [header, ...rows].join("\n");
};
const computeSimpleChecksum = (content) => {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
        hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0");
};
const buildStatementLines = (statementType, run, params) => {
    const d = params.taggelddispositivData;
    if (statementType === "taggelddispositiv" && d) {
        return [
            "elipsLife AG - Taggelddispositiv",
            "-----------------------------------",
            `KTG-Fall:         ${d.ktgCaseId}`,
            `Zahlungsinstruk.: ${d.paymentInstructionId}`,
            `Abrechnungslauf:  ${d.runNumber}`,
            `Periode:          ${d.statementPeriodStart} bis ${d.statementPeriodEnd}`,
            "-----------------------------------",
            `Beanspruchte Tage:  ${d.totalClaimedDays}`,
            `Auszahlbare Tage:   ${d.totalPayableDays}`,
            `Bruttobetrag CHF:   ${d.grossAmountChf.toFixed(2)}`,
            `Nettobetrag CHF:    ${d.netAmountChf.toFixed(2)}`,
            `Gesamtbetrag CHF:   ${d.totalAmountChf.toFixed(2)}`,
            "-----------------------------------",
            `Zahlungsempfaenger: ${d.payeeReference}`,
        ];
    }
    if (statementType === "settlement_summary") {
        return [
            "elipsLife AG - Abrechnungsuebersicht",
            "--------------------------------------",
            `KTG-Fall:         ${params.ktgCaseId}`,
            `Laufnummer:       ${run.runNumber}`,
            `Status:           ${run.runStatus}`,
            `Bruttobetrag CHF: ${run.totalGrossAmountChf.toFixed(2)}`,
            `Nettobetrag CHF:  ${run.totalNetAmountChf.toFixed(2)}`,
            `Positionen:       ${run.instructionCount}`,
        ];
    }
    return [
        "elipsLife AG - Zahlungsabrechnung",
        "----------------------------------",
        `KTG-Fall:         ${params.ktgCaseId}`,
        `Laufnummer:       ${run.runNumber}`,
        `Lauftyp:          ${run.runType}`,
        `Laufstatus:       ${run.runStatus}`,
        `Bruttobetrag CHF: ${run.totalGrossAmountChf.toFixed(2)}`,
        `Nettobetrag CHF:  ${run.totalNetAmountChf.toFixed(2)}`,
        `Positionen:       ${run.instructionCount}`,
    ];
};
//# sourceMappingURL=payment-operations.service.js.map