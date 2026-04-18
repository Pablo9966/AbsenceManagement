import { buildAbsenceTimeline, calculateAbsenceDayEquivalent, calculateBradfordFactor, } from "../domain/formulas.js";
import { hasBlockingIssues, validateAbsenceComment, validateAbsenceContractImpact, validateAbsenceDailyRecord, validateAbsenceEpisode, validateNoConflictingDailyRecord, validateStatusTransition, } from "../domain/validations.js";
const generateId = () => crypto.randomUUID();
const isRepositoryConstraintError = (error) => typeof error === "object" &&
    error !== null &&
    "constraint" in error &&
    typeof error.constraint === "string";
const mapRepositoryErrorToIssue = (error) => {
    if (!isRepositoryConstraintError(error)) {
        return null;
    }
    switch (error.constraint) {
        case "uq_absence_contract_impact":
            return {
                field: "employmentContractId",
                message: "Anstellung ist fuer diese Absenz bereits verknuepft.",
                severity: "error",
            };
        case "uq_absence_daily_record_by_impact":
        case "uq_absence_daily_record_non_overlapping":
            return {
                field: "absenceDate",
                message: "Absenzdatum kollidiert mit bestehendem Tagesdatensatz.",
                severity: "error",
            };
        case "ck_absence_episode_expected_end_date":
            return {
                field: "expectedEndDate",
                message: "Erwartetes Enddatum darf nicht vor dem Startdatum liegen.",
                severity: "error",
            };
        case "ck_absence_episode_actual_end_date":
            return {
                field: "actualEndDate",
                message: "Tatsaechliches Enddatum darf nicht vor dem Startdatum liegen.",
                severity: "error",
            };
        default:
            return null;
    }
};
const buildStatusEventType = (toStatus) => {
    switch (toStatus) {
        case "reported":
            return "reported";
        case "acknowledged":
            return "acknowledged";
        case "in_progress":
            return "started";
        case "partially_returned":
            return "partially_returned";
        case "closed":
            return "closed";
        case "cancelled":
            return "cancelled";
    }
};
export class AbsenceRecordingService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async createEpisode(episode, actor) {
        const issues = validateAbsenceEpisode(episode);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createEpisode(episode);
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: created.tenantId,
                    episodeId: created.id,
                    fromStatus: undefined,
                    toStatus: created.status,
                    eventType: "reported",
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: {
                        source: created.source,
                        startDate: created.startDate,
                    },
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async updateEpisode(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const existing = await transaction.getEpisodeById(params.tenantId, params.episodeId);
                if (!existing) {
                    return {
                        issues: [{
                                field: "episodeId",
                                message: "Absenzfall wurde nicht gefunden.",
                                severity: "error",
                            }],
                    };
                }
                const updatedCandidate = {
                    ...existing,
                    ...params.patch,
                };
                const issues = validateAbsenceEpisode(updatedCandidate);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const updated = await transaction.updateEpisode(updatedCandidate);
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: updated.tenantId,
                    episodeId: updated.id,
                    fromStatus: existing.status,
                    toStatus: updated.status,
                    eventType: "corrected",
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: {
                        patch: params.patch,
                    },
                });
                return { data: updated, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async createContractImpact(contractImpact, actor) {
        const issues = validateAbsenceContractImpact(contractImpact);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const episode = await transaction.getEpisodeById(contractImpact.tenantId, contractImpact.episodeId);
                if (!episode) {
                    return {
                        issues: [{
                                field: "episodeId",
                                message: "Absenzfall wurde nicht gefunden.",
                                severity: "error",
                            }],
                    };
                }
                const created = await transaction.createContractImpact(contractImpact);
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: created.tenantId,
                    episodeId: created.episodeId,
                    fromStatus: episode.status,
                    toStatus: episode.status,
                    eventType: "corrected",
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: {
                        contractImpactId: created.id,
                        employmentContractId: created.employmentContractId,
                    },
                });
                return { data: created, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async createDailyRecord(record, actor) {
        const issues = validateAbsenceDailyRecord(record);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const episode = await transaction.getEpisodeById(record.tenantId, record.episodeId);
                if (!episode) {
                    return {
                        issues: [{
                                field: "episodeId",
                                message: "Absenzfall wurde nicht gefunden.",
                                severity: "error",
                            }],
                    };
                }
                const existingRecords = await transaction.listDailyRecordsByEmployeeContractDate(record.tenantId, record.employeeId, record.employmentContractId, record.absenceDate);
                issues.push(...validateNoConflictingDailyRecord(existingRecords, record));
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const created = await transaction.createDailyRecord(record);
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: created.tenantId,
                    episodeId: created.episodeId,
                    fromStatus: episode.status,
                    toStatus: episode.status,
                    eventType: "corrected",
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: {
                        dailyRecordId: created.id,
                        absenceDate: created.absenceDate,
                    },
                });
                return {
                    data: {
                        ...created,
                        absenceDayEquivalent: calculateAbsenceDayEquivalent(created),
                    },
                    issues,
                };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [...issues, repositoryIssue] };
            }
            throw error;
        }
    }
    async transitionStatus(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const episode = await transaction.getEpisodeById(params.tenantId, params.episodeId);
                if (!episode) {
                    return {
                        issues: [{
                                field: "episodeId",
                                message: "Absenzfall wurde nicht gefunden.",
                                severity: "error",
                            }],
                    };
                }
                const issues = validateStatusTransition(episode.status, params.toStatus);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const updatedEpisode = {
                    ...episode,
                    status: params.toStatus,
                    lineManagerAcknowledgedAt: params.toStatus === "acknowledged" && actor.actorRole === "line_manager"
                        ? actor.effectiveAt
                        : episode.lineManagerAcknowledgedAt,
                };
                const updated = await transaction.updateEpisode(updatedEpisode);
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: updated.tenantId,
                    episodeId: updated.id,
                    fromStatus: episode.status,
                    toStatus: params.toStatus,
                    eventType: buildStatusEventType(params.toStatus),
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: params.payload,
                });
                return { data: updated, issues };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async createComment(comment) {
        const issues = validateAbsenceComment(comment);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        const created = await this.repository.createComment(comment);
        return { data: created, issues };
    }
    async linkToRecurrenceGroup(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const episode = await transaction.getEpisodeById(params.tenantId, params.episodeId);
                if (!episode) {
                    return {
                        issues: [{
                                field: "episodeId",
                                message: "Absenzfall wurde nicht gefunden.",
                                severity: "error",
                            }],
                    };
                }
                let recurrenceGroup = params.recurrenceGroupId
                    ? await transaction.getRecurrenceGroupById(params.tenantId, params.recurrenceGroupId)
                    : null;
                if (!recurrenceGroup) {
                    recurrenceGroup = await transaction.createRecurrenceGroup({
                        id: generateId(),
                        tenantId: params.tenantId,
                        recurrenceBasis: params.recurrenceBasis,
                        initialEpisodeId: episode.id,
                        status: "open",
                    });
                }
                const updatedEpisode = await transaction.updateEpisode({
                    ...episode,
                    recurrenceGroupId: recurrenceGroup.id,
                });
                await transaction.createStatusEvent({
                    id: generateId(),
                    tenantId: updatedEpisode.tenantId,
                    episodeId: updatedEpisode.id,
                    fromStatus: updatedEpisode.status,
                    toStatus: updatedEpisode.status,
                    eventType: "relapse_linked",
                    eventAt: actor.effectiveAt,
                    actorId: actor.actorId,
                    actorRole: actor.actorRole,
                    correlationId: actor.correlationId,
                    payload: {
                        recurrenceGroupId: recurrenceGroup.id,
                        recurrenceBasis: recurrenceGroup.recurrenceBasis,
                    },
                });
                return { data: updatedEpisode, issues: [] };
            });
        }
        catch (error) {
            const repositoryIssue = mapRepositoryErrorToIssue(error);
            if (repositoryIssue) {
                return { issues: [repositoryIssue] };
            }
            throw error;
        }
    }
    async getEpisodeDetail(tenantId, episodeId) {
        const episode = await this.repository.getEpisodeById(tenantId, episodeId);
        if (!episode) {
            return null;
        }
        const [contractImpacts, dailyRecords, comments, statusEvents] = await Promise.all([
            this.repository.listContractImpactsByEpisode(tenantId, episodeId),
            this.repository.listDailyRecordsByEpisode(tenantId, episodeId),
            this.repository.listCommentsByEpisode(tenantId, episodeId),
            this.repository.listStatusEventsByEpisode(tenantId, episodeId),
        ]);
        return {
            episode,
            contractImpacts,
            dailyRecords: dailyRecords.map((record) => ({
                ...record,
                absenceDayEquivalent: calculateAbsenceDayEquivalent(record),
            })),
            comments,
            statusEvents,
        };
    }
    async getEmployeeTimeline(params) {
        const [episodes, dailyRecords] = await Promise.all([
            this.repository.listEpisodesByEmployee(params.tenantId, params.employeeId),
            this.repository.listDailyRecordsByEmployee(params.tenantId, params.employeeId),
        ]);
        return buildAbsenceTimeline({
            episodes,
            dailyRecords,
            from: params.from,
            to: params.to,
        });
    }
    async getBradfordFactor(params) {
        const [episodes, dailyRecords] = await Promise.all([
            this.repository.listEpisodesByEmployee(params.tenantId, params.employeeId),
            this.repository.listDailyRecordsByEmployee(params.tenantId, params.employeeId),
        ]);
        return calculateBradfordFactor({
            episodes,
            dailyRecords,
            windowStart: params.windowStart,
            windowEnd: params.windowEnd,
        });
    }
}
//# sourceMappingURL=absence-recording.service.js.map