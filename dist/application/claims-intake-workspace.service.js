import { calculateQueueEntryOverdue, calculateWorkspaceBlocked, calculateWorkspaceReadyForReview, } from "../domain/formulas.js";
import { hasBlockingIssues, validateChecklistItem, validateChecklistItemPatch, validateEvidenceReference, validateIntakeCaseWorkspace, validateMissingInformationRequest, validateMissingInformationRequestPatch, validateQueueEntry, validateQueueEntryPatch, validateRecommendation, validateWorkspaceNote, validateWorkspacePatch, } from "../domain/validations.js";
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
        case "uq_intake_case_workspace_active_case":
            return { field: "ktgCaseId", message: "Fuer diesen KTG-Fall existiert bereits ein aktiver Intake-Workspace.", severity: "error" };
        case "uq_handler_work_queue_entry_active":
            return { field: "queueType", message: "Es existiert bereits ein aktiver Queue-Eintrag dieses Typs fuer den Workspace.", severity: "error" };
        case "ck_missing_information_request_owner":
            return { field: "requestedFrom", message: "Rueckfragen benoetigen eine explizite Empfaengerzuweisung.", severity: "error" };
        case "ck_workspace_evidence_reference_reference":
            return { field: "evidenceReference", message: "Mindestens eine Evidenzreferenz muss gesetzt sein.", severity: "error" };
        default:
            return null;
    }
};
const hasStatusChanged = (currentStatus, nextStatus) => currentStatus !== nextStatus;
export class ClaimsIntakeWorkspaceService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async touchWorkspace(repository, workspace, effectiveAt) {
        if (workspace.lastActivityAt === effectiveAt) {
            return workspace;
        }
        return repository.updateWorkspace({
            ...workspace,
            lastActivityAt: effectiveAt,
        });
    }
    async appendActivityEvent(repository, input, actor) {
        return repository.createActivityEvent({
            id: generateId(),
            tenantId: input.tenantId,
            workspaceId: input.workspaceId,
            eventType: input.eventType,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            occurredAt: actor.effectiveAt,
            correlationId: actor.correlationId,
            payload: input.payload,
        });
    }
    buildWorkspaceDerivedState(input) {
        const readyForReview = calculateWorkspaceReadyForReview({
            checklistItems: input.checklistItems,
            missingInformationRequests: input.missingInformationRequests,
            workspaceStatus: input.workspace.workspaceStatus,
            effectiveAt: input.workspace.lastActivityAt,
        });
        const blocked = calculateWorkspaceBlocked({
            checklistItems: input.checklistItems,
            missingInformationRequests: input.missingInformationRequests,
            effectiveAt: input.workspace.lastActivityAt,
        });
        const queueEntries = input.queueEntries.map((entry) => ({
            ...entry,
            overdue: calculateQueueEntryOverdue({
                queueEntry: entry,
                referenceAt: input.workspace.lastActivityAt,
            }),
        }));
        return {
            ...input.workspace,
            checklistItems: input.checklistItems,
            missingInformationRequests: input.missingInformationRequests,
            queueEntries,
            notes: input.notes,
            recommendations: input.recommendations,
            activityEvents: input.activityEvents,
            evidenceReferences: input.evidenceReferences,
            readyForReview,
            blocked,
        };
    }
    async createWorkspace(workspace, actor) {
        const issues = validateIntakeCaseWorkspace(workspace);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const created = await transaction.createWorkspace(workspace);
                await this.appendActivityEvent(transaction, {
                    tenantId: created.tenantId,
                    workspaceId: created.id,
                    eventType: "workspace_created",
                    payload: {
                        ktgCaseId: created.ktgCaseId,
                        workspaceStatus: created.workspaceStatus,
                        assignedHandlerId: created.assignedHandlerId,
                        assignedTeam: created.assignedTeam,
                    },
                }, actor);
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
    async updateWorkspace(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const existing = await transaction.getWorkspaceById(params.tenantId, params.workspaceId);
                if (!existing) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                const issues = validateWorkspacePatch(existing.workspaceStatus, params.patch);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const nextWorkspace = {
                    ...existing,
                    ...params.patch,
                    closedAt: params.patch.workspaceStatus === "completed"
                        ? (params.patch.closedAt ?? actor.effectiveAt)
                        : params.patch.closedAt,
                    lastActivityAt: params.patch.lastActivityAt ?? actor.effectiveAt,
                };
                const updated = await transaction.updateWorkspace(nextWorkspace);
                await this.appendActivityEvent(transaction, {
                    tenantId: updated.tenantId,
                    workspaceId: updated.id,
                    eventType: hasStatusChanged(existing.workspaceStatus, updated.workspaceStatus)
                        ? "workspace_status_changed"
                        : "workspace_updated",
                    payload: {
                        fromStatus: existing.workspaceStatus,
                        toStatus: updated.workspaceStatus,
                        patch: params.patch,
                    },
                }, actor);
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
    async createChecklistItem(item, actor) {
        const issues = validateChecklistItem(item);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const workspace = await transaction.getWorkspaceById(item.tenantId, item.workspaceId);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                const created = await transaction.createChecklistItem(item);
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: created.tenantId,
                    workspaceId: created.workspaceId,
                    eventType: "checklist_item_created",
                    payload: {
                        checklistItemId: created.id,
                        checkType: created.checkType,
                        blockerCode: created.blockerCode,
                        blockingFlag: created.blockingFlag,
                        sourceService: created.sourceService,
                    },
                }, actor);
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
    async updateChecklistItem(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const [workspace, existing] = await Promise.all([
                    transaction.getWorkspaceById(params.tenantId, params.workspaceId),
                    transaction.getChecklistItemById(params.tenantId, params.workspaceId, params.itemId),
                ]);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                if (!existing) {
                    return { issues: [{ field: "itemId", message: "Checklist-Eintrag wurde nicht gefunden.", severity: "error" }] };
                }
                const issues = validateChecklistItemPatch(existing.status, params.patch);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const updated = await transaction.updateChecklistItem({
                    ...existing,
                    ...params.patch,
                    completedAt: params.patch.status === "satisfied" || params.patch.status === "waived"
                        ? (params.patch.completedAt ?? actor.effectiveAt)
                        : params.patch.completedAt,
                });
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: updated.tenantId,
                    workspaceId: updated.workspaceId,
                    eventType: "checklist_item_updated",
                    payload: {
                        checklistItemId: updated.id,
                        fromStatus: existing.status,
                        toStatus: updated.status,
                        patch: params.patch,
                    },
                }, actor);
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
    async createMissingInformationRequest(request, actor) {
        const issues = validateMissingInformationRequest(request);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const workspace = await transaction.getWorkspaceById(request.tenantId, request.workspaceId);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                const created = await transaction.createMissingInformationRequest(request);
                const updatedWorkspace = await transaction.updateWorkspace({
                    ...workspace,
                    workspaceStatus: workspace.workspaceStatus === "completed" ? workspace.workspaceStatus : "waiting_for_information",
                    lastActivityAt: actor.effectiveAt,
                });
                if (updatedWorkspace.workspaceStatus !== workspace.workspaceStatus) {
                    await this.appendActivityEvent(transaction, {
                        tenantId: updatedWorkspace.tenantId,
                        workspaceId: updatedWorkspace.id,
                        eventType: "workspace_status_changed",
                        payload: {
                            fromStatus: workspace.workspaceStatus,
                            toStatus: updatedWorkspace.workspaceStatus,
                            trigger: "missing_information_requested",
                            requestId: created.id,
                        },
                    }, actor);
                }
                await this.appendActivityEvent(transaction, {
                    tenantId: created.tenantId,
                    workspaceId: created.workspaceId,
                    eventType: "missing_information_requested",
                    payload: {
                        requestId: created.id,
                        requestReasonCode: created.requestReasonCode,
                        requestedFromPartyType: created.requestedFromPartyType,
                        requestedFromUserId: created.requestedFromUserId,
                        requestedFromRole: created.requestedFromRole,
                        requestChannelPolicy: created.requestChannelPolicy,
                        outboundNotificationBoundary: "notification_event_only",
                    },
                }, actor);
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
    async updateMissingInformationRequest(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const [workspace, existing] = await Promise.all([
                    transaction.getWorkspaceById(params.tenantId, params.workspaceId),
                    transaction.getMissingInformationRequestById(params.tenantId, params.workspaceId, params.requestId),
                ]);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                if (!existing) {
                    return { issues: [{ field: "requestId", message: "Rueckfrage wurde nicht gefunden.", severity: "error" }] };
                }
                const issues = validateMissingInformationRequestPatch(existing.status, params.patch);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const updated = await transaction.updateMissingInformationRequest({
                    ...existing,
                    ...params.patch,
                    resolvedAt: params.patch.status === "answered"
                        ? (params.patch.resolvedAt ?? actor.effectiveAt)
                        : params.patch.resolvedAt,
                });
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: updated.tenantId,
                    workspaceId: updated.workspaceId,
                    eventType: updated.status === "answered" ? "missing_information_resolved" : "missing_information_updated",
                    payload: {
                        requestId: updated.id,
                        fromStatus: existing.status,
                        toStatus: updated.status,
                        patch: params.patch,
                    },
                }, actor);
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
    async createQueueEntry(entry, actor) {
        const issues = validateQueueEntry(entry);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const workspace = await transaction.getWorkspaceById(entry.tenantId, entry.workspaceId);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                const created = await transaction.createQueueEntry(entry);
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: created.tenantId,
                    workspaceId: created.workspaceId,
                    eventType: "queue_entered",
                    payload: {
                        queueEntryId: created.id,
                        queueType: created.queueType,
                        queueStatus: created.queueStatus,
                        queueBoundary: "internal_claims_ops_queue_only",
                    },
                }, actor);
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
    async updateQueueEntry(params, actor) {
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const [workspace, existing] = await Promise.all([
                    transaction.getWorkspaceById(params.tenantId, params.workspaceId),
                    transaction.getQueueEntryById(params.tenantId, params.workspaceId, params.entryId),
                ]);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                if (!existing) {
                    return { issues: [{ field: "entryId", message: "Queue-Eintrag wurde nicht gefunden.", severity: "error" }] };
                }
                const issues = validateQueueEntryPatch(existing.queueStatus, params.patch);
                if (hasBlockingIssues(issues)) {
                    return { issues };
                }
                const updated = await transaction.updateQueueEntry({
                    ...existing,
                    ...params.patch,
                    exitedAt: params.patch.queueStatus === "exited"
                        ? (params.patch.exitedAt ?? actor.effectiveAt)
                        : params.patch.exitedAt,
                });
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: updated.tenantId,
                    workspaceId: updated.workspaceId,
                    eventType: updated.queueStatus === "exited" ? "queue_exited" : "queue_status_changed",
                    payload: {
                        queueEntryId: updated.id,
                        queueType: updated.queueType,
                        fromStatus: existing.queueStatus,
                        toStatus: updated.queueStatus,
                        patch: params.patch,
                    },
                }, actor);
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
    async createWorkspaceNote(note, actor) {
        const issues = validateWorkspaceNote(note);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        return this.repository.withTransaction(async (transaction) => {
            const workspace = await transaction.getWorkspaceById(note.tenantId, note.workspaceId);
            if (!workspace) {
                return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
            }
            const created = await transaction.createNote(note);
            await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
            await this.appendActivityEvent(transaction, {
                tenantId: created.tenantId,
                workspaceId: created.workspaceId,
                eventType: "note_created",
                payload: {
                    noteId: created.id,
                    noteType: created.noteType,
                    visibility: created.visibility,
                },
            }, actor);
            return { data: created, issues };
        });
    }
    async createRecommendation(recommendation, actor) {
        const issues = validateRecommendation(recommendation);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        return this.repository.withTransaction(async (transaction) => {
            const workspace = await transaction.getWorkspaceById(recommendation.tenantId, recommendation.workspaceId);
            if (!workspace) {
                return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
            }
            const created = await transaction.createRecommendation(recommendation);
            await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
            await this.appendActivityEvent(transaction, {
                tenantId: created.tenantId,
                workspaceId: created.workspaceId,
                eventType: "recommendation_created",
                payload: {
                    recommendationId: created.id,
                    recommendationType: created.recommendationType,
                    confidence: created.confidence,
                },
            }, actor);
            return { data: created, issues };
        });
    }
    async createEvidenceReference(reference, actor) {
        const issues = validateEvidenceReference(reference);
        if (hasBlockingIssues(issues)) {
            return { issues };
        }
        try {
            return await this.repository.withTransaction(async (transaction) => {
                const workspace = await transaction.getWorkspaceById(reference.tenantId, reference.workspaceId);
                if (!workspace) {
                    return { issues: [{ field: "workspaceId", message: "Intake-Workspace wurde nicht gefunden.", severity: "error" }] };
                }
                const created = await transaction.createEvidenceReference(reference);
                await this.touchWorkspace(transaction, workspace, actor.effectiveAt);
                await this.appendActivityEvent(transaction, {
                    tenantId: created.tenantId,
                    workspaceId: created.workspaceId,
                    eventType: "evidence_reference_linked",
                    payload: {
                        evidenceReferenceId: created.id,
                        documentRole: created.documentRole,
                        documentId: created.documentId,
                        certificateReferenceId: created.certificateReferenceId,
                        linkSource: created.linkSource,
                        linkConfidence: created.linkConfidence,
                    },
                }, actor);
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
    async getWorkspaceDetail(tenantId, workspaceId) {
        const workspace = await this.repository.getWorkspaceById(tenantId, workspaceId);
        if (!workspace) {
            return null;
        }
        const [checklistItems, missingInformationRequests, queueEntries, notes, recommendations, activityEvents, evidenceReferences,] = await Promise.all([
            this.repository.listChecklistItemsByWorkspace(tenantId, workspaceId),
            this.repository.listMissingInformationRequestsByWorkspace(tenantId, workspaceId),
            this.repository.listQueueEntriesByWorkspace(tenantId, workspaceId),
            this.repository.listNotesByWorkspace(tenantId, workspaceId),
            this.repository.listRecommendationsByWorkspace(tenantId, workspaceId),
            this.repository.listActivityEventsByWorkspace(tenantId, workspaceId),
            this.repository.listEvidenceReferencesByWorkspace(tenantId, workspaceId),
        ]);
        return this.buildWorkspaceDerivedState({
            workspace,
            checklistItems,
            missingInformationRequests,
            queueEntries,
            notes,
            recommendations,
            activityEvents,
            evidenceReferences,
        });
    }
    async listWorkspaces(tenantId, filters) {
        return this.repository.listWorkspaces(tenantId, filters);
    }
}
//# sourceMappingURL=claims-intake-workspace.service.js.map