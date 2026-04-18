import { calculateAbsenceDayEquivalent } from "../domain/formulas.js";
import type { AbsenceComment, AbsenceContractImpact, AbsenceDailyRecord, AbsenceEpisode, AbsenceEpisodeDetail, AbsenceRecurrenceGroup, AbsenceStatus, AbsenceStatusEvent, AbsenceTimelineItem, BradfordFactor, RecurrenceLinkBasis, UpdateAbsenceEpisodePatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
export interface AbsenceRepositoryContext {
    createEpisode(episode: AbsenceEpisode): Promise<AbsenceEpisode>;
    updateEpisode(episode: AbsenceEpisode): Promise<AbsenceEpisode>;
    getEpisodeById(tenantId: string, episodeId: string): Promise<AbsenceEpisode | null>;
    listEpisodesByEmployee(tenantId: string, employeeId: string): Promise<AbsenceEpisode[]>;
    createContractImpact(contractImpact: AbsenceContractImpact): Promise<AbsenceContractImpact>;
    listContractImpactsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceContractImpact[]>;
    createDailyRecord(record: AbsenceDailyRecord): Promise<AbsenceDailyRecord>;
    listDailyRecordsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceDailyRecord[]>;
    listDailyRecordsByEmployeeContractDate(tenantId: string, employeeId: string, employmentContractId: string, absenceDate: string): Promise<AbsenceDailyRecord[]>;
    listDailyRecordsByEmployee(tenantId: string, employeeId: string): Promise<AbsenceDailyRecord[]>;
    createStatusEvent(event: AbsenceStatusEvent): Promise<AbsenceStatusEvent>;
    listStatusEventsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceStatusEvent[]>;
    createComment(comment: AbsenceComment): Promise<AbsenceComment>;
    listCommentsByEpisode(tenantId: string, episodeId: string): Promise<AbsenceComment[]>;
    createRecurrenceGroup(group: AbsenceRecurrenceGroup): Promise<AbsenceRecurrenceGroup>;
    getRecurrenceGroupById(tenantId: string, recurrenceGroupId: string): Promise<AbsenceRecurrenceGroup | null>;
}
export interface AbsenceRepository extends AbsenceRepositoryContext {
    withTransaction<T>(operation: (repository: AbsenceRepositoryContext) => Promise<T>): Promise<T>;
}
export interface ActorContext {
    actorId?: string;
    actorRole: AbsenceStatusEvent["actorRole"];
    correlationId?: string;
    effectiveAt: string;
}
export interface CommandResult<T> {
    data?: T;
    issues: ValidationIssue[];
}
export declare class AbsenceRecordingService {
    private readonly repository;
    constructor(repository: AbsenceRepository);
    createEpisode(episode: AbsenceEpisode, actor: ActorContext): Promise<CommandResult<AbsenceEpisode>>;
    updateEpisode(params: {
        tenantId: string;
        episodeId: string;
        patch: UpdateAbsenceEpisodePatch;
    }, actor: ActorContext): Promise<CommandResult<AbsenceEpisode>>;
    createContractImpact(contractImpact: AbsenceContractImpact, actor: ActorContext): Promise<CommandResult<AbsenceContractImpact>>;
    createDailyRecord(record: AbsenceDailyRecord, actor: ActorContext): Promise<CommandResult<AbsenceDailyRecord & {
        absenceDayEquivalent: ReturnType<typeof calculateAbsenceDayEquivalent>;
    }>>;
    transitionStatus(params: {
        tenantId: string;
        episodeId: string;
        toStatus: AbsenceStatus;
        payload?: Record<string, unknown>;
    }, actor: ActorContext): Promise<CommandResult<AbsenceEpisode>>;
    createComment(comment: AbsenceComment): Promise<CommandResult<AbsenceComment>>;
    linkToRecurrenceGroup(params: {
        tenantId: string;
        episodeId: string;
        recurrenceGroupId?: string;
        recurrenceBasis: RecurrenceLinkBasis;
    }, actor: ActorContext): Promise<CommandResult<AbsenceEpisode>>;
    getEpisodeDetail(tenantId: string, episodeId: string): Promise<AbsenceEpisodeDetail | null>;
    getEmployeeTimeline(params: {
        tenantId: string;
        employeeId: string;
        from: string;
        to: string;
    }): Promise<AbsenceTimelineItem[]>;
    getBradfordFactor(params: {
        tenantId: string;
        employeeId: string;
        windowStart: string;
        windowEnd: string;
    }): Promise<BradfordFactor>;
}
