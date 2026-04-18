import type { ActorRole, HandlerWorkQueueEntry, IntakeCaseWorkspace, IntakeCaseWorkspaceDetail, IntakeChecklistItem, IntakeDecisionRecommendation, MissingInformationRequest, UpdateChecklistItemPatch, UpdateHandlerWorkQueueEntryPatch, UpdateIntakeCaseWorkspacePatch, UpdateMissingInformationRequestPatch, WorkspaceActivityEvent, WorkspaceEvidenceReference, WorkspaceNote } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
export interface ClaimsIntakeWorkspaceRepositoryContext {
    createWorkspace(workspace: IntakeCaseWorkspace): Promise<IntakeCaseWorkspace>;
    updateWorkspace(workspace: IntakeCaseWorkspace): Promise<IntakeCaseWorkspace>;
    getWorkspaceById(tenantId: string, workspaceId: string): Promise<IntakeCaseWorkspace | null>;
    listWorkspaces(tenantId: string, filters?: {
        workspaceStatus?: IntakeCaseWorkspace["workspaceStatus"];
        assignedHandlerId?: string;
        assignedTeam?: string;
        ktgCaseId?: string;
    }): Promise<IntakeCaseWorkspace[]>;
    createChecklistItem(item: IntakeChecklistItem): Promise<IntakeChecklistItem>;
    updateChecklistItem(item: IntakeChecklistItem): Promise<IntakeChecklistItem>;
    getChecklistItemById(tenantId: string, workspaceId: string, itemId: string): Promise<IntakeChecklistItem | null>;
    listChecklistItemsByWorkspace(tenantId: string, workspaceId: string): Promise<IntakeChecklistItem[]>;
    createMissingInformationRequest(request: MissingInformationRequest): Promise<MissingInformationRequest>;
    updateMissingInformationRequest(request: MissingInformationRequest): Promise<MissingInformationRequest>;
    getMissingInformationRequestById(tenantId: string, workspaceId: string, requestId: string): Promise<MissingInformationRequest | null>;
    listMissingInformationRequestsByWorkspace(tenantId: string, workspaceId: string): Promise<MissingInformationRequest[]>;
    createQueueEntry(entry: HandlerWorkQueueEntry): Promise<HandlerWorkQueueEntry>;
    updateQueueEntry(entry: HandlerWorkQueueEntry): Promise<HandlerWorkQueueEntry>;
    getQueueEntryById(tenantId: string, workspaceId: string, entryId: string): Promise<HandlerWorkQueueEntry | null>;
    listQueueEntriesByWorkspace(tenantId: string, workspaceId: string): Promise<HandlerWorkQueueEntry[]>;
    createNote(note: WorkspaceNote): Promise<WorkspaceNote>;
    listNotesByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceNote[]>;
    createRecommendation(recommendation: IntakeDecisionRecommendation): Promise<IntakeDecisionRecommendation>;
    listRecommendationsByWorkspace(tenantId: string, workspaceId: string): Promise<IntakeDecisionRecommendation[]>;
    createActivityEvent(event: WorkspaceActivityEvent): Promise<WorkspaceActivityEvent>;
    listActivityEventsByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceActivityEvent[]>;
    createEvidenceReference(reference: WorkspaceEvidenceReference): Promise<WorkspaceEvidenceReference>;
    listEvidenceReferencesByWorkspace(tenantId: string, workspaceId: string): Promise<WorkspaceEvidenceReference[]>;
}
export interface ClaimsIntakeWorkspaceRepository extends ClaimsIntakeWorkspaceRepositoryContext {
    withTransaction<T>(operation: (repository: ClaimsIntakeWorkspaceRepositoryContext) => Promise<T>): Promise<T>;
}
export interface ActorContext {
    actorId?: string;
    actorRole: ActorRole;
    correlationId?: string;
    effectiveAt: string;
}
export interface CommandResult<T> {
    data?: T;
    issues: ValidationIssue[];
}
export declare class ClaimsIntakeWorkspaceService {
    private readonly repository;
    constructor(repository: ClaimsIntakeWorkspaceRepository);
    private touchWorkspace;
    private appendActivityEvent;
    private buildWorkspaceDerivedState;
    createWorkspace(workspace: IntakeCaseWorkspace, actor: ActorContext): Promise<CommandResult<IntakeCaseWorkspace>>;
    updateWorkspace(params: {
        tenantId: string;
        workspaceId: string;
        patch: UpdateIntakeCaseWorkspacePatch;
    }, actor: ActorContext): Promise<CommandResult<IntakeCaseWorkspace>>;
    createChecklistItem(item: IntakeChecklistItem, actor: ActorContext): Promise<CommandResult<IntakeChecklistItem>>;
    updateChecklistItem(params: {
        tenantId: string;
        workspaceId: string;
        itemId: string;
        patch: UpdateChecklistItemPatch;
    }, actor: ActorContext): Promise<CommandResult<IntakeChecklistItem>>;
    createMissingInformationRequest(request: MissingInformationRequest, actor: ActorContext): Promise<CommandResult<MissingInformationRequest>>;
    updateMissingInformationRequest(params: {
        tenantId: string;
        workspaceId: string;
        requestId: string;
        patch: UpdateMissingInformationRequestPatch;
    }, actor: ActorContext): Promise<CommandResult<MissingInformationRequest>>;
    createQueueEntry(entry: HandlerWorkQueueEntry, actor: ActorContext): Promise<CommandResult<HandlerWorkQueueEntry>>;
    updateQueueEntry(params: {
        tenantId: string;
        workspaceId: string;
        entryId: string;
        patch: UpdateHandlerWorkQueueEntryPatch;
    }, actor: ActorContext): Promise<CommandResult<HandlerWorkQueueEntry>>;
    createWorkspaceNote(note: WorkspaceNote, actor: ActorContext): Promise<CommandResult<WorkspaceNote>>;
    createRecommendation(recommendation: IntakeDecisionRecommendation, actor: ActorContext): Promise<CommandResult<IntakeDecisionRecommendation>>;
    createEvidenceReference(reference: WorkspaceEvidenceReference, actor: ActorContext): Promise<CommandResult<WorkspaceEvidenceReference>>;
    getWorkspaceDetail(tenantId: string, workspaceId: string): Promise<IntakeCaseWorkspaceDetail | null>;
    listWorkspaces(tenantId: string, filters?: {
        workspaceStatus?: IntakeCaseWorkspace["workspaceStatus"];
        assignedHandlerId?: string;
        assignedTeam?: string;
        ktgCaseId?: string;
    }): Promise<IntakeCaseWorkspace[]>;
}
