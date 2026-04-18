import type { CaseActorRole, KtgCase, KtgCaseAbsenceLink, KtgCaseCoverageSnapshot, KtgCaseDecision, KtgCaseDetail, KtgCaseNote, KtgCaseStatus, KtgCaseStatusEvent, KtgCaseSuggestion, KtgCaseSubmission, KtgDeadline, KtgTask, TransparentBoolean, TransparentDate, UpdateKtgCasePatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
export interface KtgCaseRepositoryContext {
    createCase(ktgCase: KtgCase): Promise<KtgCase>;
    updateCase(ktgCase: KtgCase): Promise<KtgCase>;
    getCaseById(tenantId: string, caseId: string): Promise<KtgCase | null>;
    listCasesByEmployee(tenantId: string, employeeId: string): Promise<KtgCase[]>;
    createAbsenceLink(link: KtgCaseAbsenceLink): Promise<KtgCaseAbsenceLink>;
    listAbsenceLinksByCase(tenantId: string, caseId: string): Promise<KtgCaseAbsenceLink[]>;
    createCoverageSnapshot(snapshot: KtgCaseCoverageSnapshot): Promise<KtgCaseCoverageSnapshot>;
    getCoverageSnapshotByCase(tenantId: string, caseId: string): Promise<KtgCaseCoverageSnapshot | null>;
    createSubmission(submission: KtgCaseSubmission): Promise<KtgCaseSubmission>;
    listSubmissionsByCase(tenantId: string, caseId: string): Promise<KtgCaseSubmission[]>;
    createDeadline(deadline: KtgDeadline): Promise<KtgDeadline>;
    listDeadlinesByCase(tenantId: string, caseId: string): Promise<KtgDeadline[]>;
    createTask(task: KtgTask): Promise<KtgTask>;
    listTasksByCase(tenantId: string, caseId: string): Promise<KtgTask[]>;
    createNote(note: KtgCaseNote): Promise<KtgCaseNote>;
    listNotesByCase(tenantId: string, caseId: string): Promise<KtgCaseNote[]>;
    createDecision(decision: KtgCaseDecision): Promise<KtgCaseDecision>;
    listDecisionsByCase(tenantId: string, caseId: string): Promise<KtgCaseDecision[]>;
    createStatusEvent(event: KtgCaseStatusEvent): Promise<KtgCaseStatusEvent>;
    listStatusEventsByCase(tenantId: string, caseId: string): Promise<KtgCaseStatusEvent[]>;
}
export interface KtgCaseRepository extends KtgCaseRepositoryContext {
    withTransaction<T>(operation: (repository: KtgCaseRepositoryContext) => Promise<T>): Promise<T>;
}
export interface ActorContext {
    actorId?: string;
    actorRole: CaseActorRole;
    correlationId?: string;
    effectiveAt: string;
}
export interface CommandResult<T> {
    data?: T;
    issues: ValidationIssue[];
}
export declare class KtgCaseService {
    private readonly repository;
    constructor(repository: KtgCaseRepository);
    private calculatePersistedSubmissionReadinessStatus;
    private synchronizeSubmissionReadiness;
    createCase(ktgCase: KtgCase, actor: ActorContext): Promise<CommandResult<KtgCase>>;
    updateCase(params: {
        tenantId: string;
        caseId: string;
        patch: UpdateKtgCasePatch;
    }, actor: ActorContext): Promise<CommandResult<KtgCase>>;
    createAbsenceLink(link: KtgCaseAbsenceLink, actor: ActorContext): Promise<CommandResult<KtgCaseAbsenceLink>>;
    createCoverageSnapshot(snapshot: KtgCaseCoverageSnapshot, actor: ActorContext): Promise<CommandResult<KtgCaseCoverageSnapshot>>;
    createSubmission(submission: KtgCaseSubmission, actor: ActorContext): Promise<CommandResult<KtgCaseSubmission>>;
    transitionStatus(params: {
        tenantId: string;
        caseId: string;
        toStatus: KtgCaseStatus;
        payload?: Record<string, unknown>;
    }, actor: ActorContext): Promise<CommandResult<KtgCase>>;
    createDeadline(deadline: KtgDeadline): Promise<CommandResult<KtgDeadline>>;
    createTask(task: KtgTask): Promise<CommandResult<KtgTask>>;
    createNote(note: KtgCaseNote): Promise<CommandResult<KtgCaseNote>>;
    createDecision(decision: KtgCaseDecision): Promise<CommandResult<KtgCaseDecision>>;
    getCaseDetail(tenantId: string, caseId: string): Promise<KtgCaseDetail | null>;
    getSubmissionReadiness(params: {
        tenantId: string;
        caseId: string;
    }): Promise<TransparentBoolean>;
    buildSuggestion(input: {
        employeeId: string;
        absenceEpisodeId: string;
        policyId: string;
        firstDayOfIncapacity: string;
        latestAbsenceDate: string;
        recordedAbsenceDays: number;
        wartezeitDays: number;
        existingOpenCaseFlag: boolean;
        lohnfortzahlungDays: number;
    }): KtgCaseSuggestion;
    buildDeadlinePreview(input: {
        anchorDate: string;
        daysToAdd: number;
        countingMethod: KtgDeadline["countingMethod"];
    }): TransparentDate;
}
