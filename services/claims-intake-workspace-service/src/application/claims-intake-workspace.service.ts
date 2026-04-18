import {
  calculateQueueEntryOverdue,
  calculateWorkspaceBlocked,
  calculateWorkspaceReadyForReview,
} from "../domain/formulas.js";
import type {
  ActorRole,
  HandlerWorkQueueEntry,
  HandlerWorkQueueEntryDetail,
  IntakeCaseWorkspace,
  IntakeCaseWorkspaceDetail,
  IntakeChecklistItem,
  IntakeDecisionRecommendation,
  MissingInformationRequest,
  UpdateChecklistItemPatch,
  UpdateHandlerWorkQueueEntryPatch,
  UpdateIntakeCaseWorkspacePatch,
  UpdateMissingInformationRequestPatch,
  WorkspaceActivityEvent,
  WorkspaceActivityEventType,
  WorkspaceEvidenceReference,
  WorkspaceNote,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  type ValidationIssue,
  validateChecklistItem,
  validateChecklistItemPatch,
  validateEvidenceReference,
  validateIntakeCaseWorkspace,
  validateMissingInformationRequest,
  validateMissingInformationRequestPatch,
  validateQueueEntry,
  validateQueueEntryPatch,
  validateRecommendation,
  validateWorkspaceNote,
  validateWorkspacePatch,
} from "../domain/validations.js";

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
  getMissingInformationRequestById(
    tenantId: string,
    workspaceId: string,
    requestId: string,
  ): Promise<MissingInformationRequest | null>;
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

interface RepositoryConstraintErrorLike {
  constraint?: string;
}

const generateId = (): string => crypto.randomUUID();

const isRepositoryConstraintError = (error: unknown): error is RepositoryConstraintErrorLike =>
  typeof error === "object" &&
  error !== null &&
  "constraint" in error &&
  typeof (error as RepositoryConstraintErrorLike).constraint === "string";

const mapRepositoryErrorToIssue = (error: unknown): ValidationIssue | null => {
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

const hasStatusChanged = (
  currentStatus: IntakeCaseWorkspace["workspaceStatus"],
  nextStatus: IntakeCaseWorkspace["workspaceStatus"],
): boolean => currentStatus !== nextStatus;

export class ClaimsIntakeWorkspaceService {
  constructor(private readonly repository: ClaimsIntakeWorkspaceRepository) {}

  private async touchWorkspace(
    repository: ClaimsIntakeWorkspaceRepositoryContext,
    workspace: IntakeCaseWorkspace,
    effectiveAt: string,
  ): Promise<IntakeCaseWorkspace> {
    if (workspace.lastActivityAt === effectiveAt) {
      return workspace;
    }

    return repository.updateWorkspace({
      ...workspace,
      lastActivityAt: effectiveAt,
    });
  }

  private async appendActivityEvent(
    repository: ClaimsIntakeWorkspaceRepositoryContext,
    input: {
      tenantId: string;
      workspaceId: string;
      eventType: WorkspaceActivityEventType;
      payload?: Record<string, unknown>;
    },
    actor: ActorContext,
  ): Promise<WorkspaceActivityEvent> {
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

  private buildWorkspaceDerivedState(input: {
    workspace: IntakeCaseWorkspace;
    checklistItems: IntakeChecklistItem[];
    missingInformationRequests: MissingInformationRequest[];
    queueEntries: HandlerWorkQueueEntry[];
    notes: WorkspaceNote[];
    recommendations: IntakeDecisionRecommendation[];
    activityEvents: WorkspaceActivityEvent[];
    evidenceReferences: WorkspaceEvidenceReference[];
  }): IntakeCaseWorkspaceDetail {
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
    const queueEntries: HandlerWorkQueueEntryDetail[] = input.queueEntries.map((entry) => ({
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

  async createWorkspace(
    workspace: IntakeCaseWorkspace,
    actor: ActorContext,
  ): Promise<CommandResult<IntakeCaseWorkspace>> {
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateWorkspace(params: {
    tenantId: string;
    workspaceId: string;
    patch: UpdateIntakeCaseWorkspacePatch;
  }, actor: ActorContext): Promise<CommandResult<IntakeCaseWorkspace>> {
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

        const nextWorkspace: IntakeCaseWorkspace = {
          ...existing,
          ...params.patch,
          closedAt:
            params.patch.workspaceStatus === "completed"
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createChecklistItem(
    item: IntakeChecklistItem,
    actor: ActorContext,
  ): Promise<CommandResult<IntakeChecklistItem>> {
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateChecklistItem(params: {
    tenantId: string;
    workspaceId: string;
    itemId: string;
    patch: UpdateChecklistItemPatch;
  }, actor: ActorContext): Promise<CommandResult<IntakeChecklistItem>> {
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
          completedAt:
            params.patch.status === "satisfied" || params.patch.status === "waived"
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createMissingInformationRequest(
    request: MissingInformationRequest,
    actor: ActorContext,
  ): Promise<CommandResult<MissingInformationRequest>> {
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
          workspaceStatus:
            workspace.workspaceStatus === "completed" ? workspace.workspaceStatus : "waiting_for_information",
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateMissingInformationRequest(params: {
    tenantId: string;
    workspaceId: string;
    requestId: string;
    patch: UpdateMissingInformationRequestPatch;
  }, actor: ActorContext): Promise<CommandResult<MissingInformationRequest>> {
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
          resolvedAt:
            params.patch.status === "answered"
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createQueueEntry(
    entry: HandlerWorkQueueEntry,
    actor: ActorContext,
  ): Promise<CommandResult<HandlerWorkQueueEntry>> {
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateQueueEntry(params: {
    tenantId: string;
    workspaceId: string;
    entryId: string;
    patch: UpdateHandlerWorkQueueEntryPatch;
  }, actor: ActorContext): Promise<CommandResult<HandlerWorkQueueEntry>> {
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
          exitedAt:
            params.patch.queueStatus === "exited"
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createWorkspaceNote(
    note: WorkspaceNote,
    actor: ActorContext,
  ): Promise<CommandResult<WorkspaceNote>> {
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

  async createRecommendation(
    recommendation: IntakeDecisionRecommendation,
    actor: ActorContext,
  ): Promise<CommandResult<IntakeDecisionRecommendation>> {
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

  async createEvidenceReference(
    reference: WorkspaceEvidenceReference,
    actor: ActorContext,
  ): Promise<CommandResult<WorkspaceEvidenceReference>> {
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
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async getWorkspaceDetail(tenantId: string, workspaceId: string): Promise<IntakeCaseWorkspaceDetail | null> {
    const workspace = await this.repository.getWorkspaceById(tenantId, workspaceId);
    if (!workspace) {
      return null;
    }

    const [
      checklistItems,
      missingInformationRequests,
      queueEntries,
      notes,
      recommendations,
      activityEvents,
      evidenceReferences,
    ] = await Promise.all([
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

  async listWorkspaces(tenantId: string, filters?: {
    workspaceStatus?: IntakeCaseWorkspace["workspaceStatus"];
    assignedHandlerId?: string;
    assignedTeam?: string;
    ktgCaseId?: string;
  }): Promise<IntakeCaseWorkspace[]> {
    return this.repository.listWorkspaces(tenantId, filters);
  }
}
