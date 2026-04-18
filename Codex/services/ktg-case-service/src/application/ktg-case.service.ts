import {
  calculateDeadlineDueAt,
  calculateFirstPayableDay,
  calculateSubmissionReadiness,
  evaluateKtgCaseSuggestion,
} from "../domain/formulas.js";
import type {
  CaseActorRole,
  KtgCase,
  KtgCaseAbsenceLink,
  KtgCaseCoverageSnapshot,
  KtgCaseDecision,
  KtgCaseDetail,
  KtgCaseNote,
  KtgCaseStatus,
  KtgCaseStatusEvent,
  KtgCaseSuggestion,
  KtgCaseSubmission,
  KtgDeadline,
  KtgTask,
  TransparentBoolean,
  TransparentDate,
  UpdateKtgCasePatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  validateKtgCase,
  validateKtgCaseAbsenceLink,
  validateKtgCaseCoverageSnapshot,
  validateKtgCaseDecision,
  validateKtgCaseNote,
  validateKtgCasePatch,
  validateKtgCaseSubmission,
  validateKtgCaseStatusTransition,
  validateKtgDeadline,
  validateKtgTask,
  validateSingleOriginatingEpisode,
  type ValidationIssue,
} from "../domain/validations.js";

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
    case "uq_ktg_case_case_number":
      return { field: "caseNumber", message: "Fallnummer ist bereits vorhanden.", severity: "error" };
    case "uq_ktg_case_originating_episode":
      return { field: "isOriginatingEpisode", message: "Urspruengliche Absenz ist bereits gesetzt.", severity: "error" };
    case "uq_ktg_case_absence_link":
      return { field: "absenceEpisodeId", message: "Absenz ist bereits mit dem KTG-Fall verknuepft.", severity: "error" };
    case "uq_ktg_case_coverage_snapshot_case":
      return { field: "coverageSnapshot", message: "Deckungssnapshot existiert bereits.", severity: "error" };
    case "uq_ktg_case_claims_system_case_id":
      return { field: "claimsSystemCaseId", message: "Claims-System-Fallnummer ist bereits vorhanden.", severity: "error" };
    case "uq_ktg_case_submission_external_claims_system_id":
      return { field: "externalClaimsSystemId", message: "Externe Claims-System-Referenz ist bereits vorhanden.", severity: "error" };
    case "ck_ktg_case_coverage_snapshot_lohnfortzahlung_days":
      return { field: "lohnfortzahlungDays", message: "Lohnfortzahlungstage duerfen nicht negativ sein.", severity: "error" };
    case "ck_ktg_case_decision_daily_allowance_amount":
      return { field: "dailyAllowanceAmountChf", message: "Taggeldbetrag darf nicht negativ sein.", severity: "error" };
    case "fk_ktg_task_deadline":
      return { field: "deadlineId", message: "Fristreferenz gehoert nicht zum selben Tenant oder KTG-Fall.", severity: "error" };
    default:
      return null;
  }
};

const buildStatusEventType = (toStatus: KtgCaseStatus): KtgCaseStatusEvent["eventType"] => {
  switch (toStatus) {
    case "suggested":
      return "suggested";
    case "draft":
      return "drafted";
    case "submitted":
      return "submitted";
    case "in_review":
      return "in_review";
    case "benefit_active":
      return "benefit_activated";
    case "closed":
      return "closed";
    case "rejected":
      return "rejected";
  }
};

const isSubmissionBlocked = (
  submission: Pick<KtgCaseSubmission, "validationResult">,
): boolean => submission.validationResult === "blocked";

const getLatestSubmission = (
  submissions: ReadonlyArray<Pick<KtgCaseSubmission, "submittedAt" | "validationResult">>,
): Pick<KtgCaseSubmission, "submittedAt" | "validationResult"> | undefined =>
  [...submissions].sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))[0];

export class KtgCaseService {
  constructor(private readonly repository: KtgCaseRepository) {}

  private calculatePersistedSubmissionReadinessStatus(input: {
    readiness: TransparentBoolean;
    submissions: ReadonlyArray<Pick<KtgCaseSubmission, "submittedAt" | "validationResult">>;
    blockedAttempt?: boolean;
  }): KtgCase["submissionReadinessStatus"] {
    const latestSubmission = getLatestSubmission(input.submissions);
    if (input.blockedAttempt || (latestSubmission && isSubmissionBlocked(latestSubmission))) {
      return "blocked";
    }

    if (input.readiness.value) {
      return "ready";
    }

    return "not_ready";
  }

  private async synchronizeSubmissionReadiness(
    repository: KtgCaseRepositoryContext,
    ktgCase: KtgCase,
    options?: {
      absenceLinks?: ReadonlyArray<KtgCaseAbsenceLink>;
      coverageSnapshot?: KtgCaseCoverageSnapshot | null;
      submissions?: ReadonlyArray<KtgCaseSubmission>;
      blockedAttempt?: boolean;
    },
  ): Promise<{
    ktgCase: KtgCase;
    readiness: TransparentBoolean;
    submissions: ReadonlyArray<KtgCaseSubmission>;
  }> {
    const absenceLinks = options?.absenceLinks ?? await repository.listAbsenceLinksByCase(ktgCase.tenantId, ktgCase.id);
    const coverageSnapshot =
      options?.coverageSnapshot !== undefined
        ? options.coverageSnapshot
        : await repository.getCoverageSnapshotByCase(ktgCase.tenantId, ktgCase.id);
    const submissions = options?.submissions ?? await repository.listSubmissionsByCase(ktgCase.tenantId, ktgCase.id);
    const readiness = calculateSubmissionReadiness({
      ktgCase,
      absenceLinks,
      coverageSnapshot: coverageSnapshot ?? undefined,
    });
    const nextStatus = this.calculatePersistedSubmissionReadinessStatus({
      readiness,
      submissions,
      blockedAttempt: options?.blockedAttempt,
    });

    if (ktgCase.submissionReadinessStatus === nextStatus) {
      return { ktgCase, readiness, submissions };
    }

    const updatedCase = await repository.updateCase({
      ...ktgCase,
      submissionReadinessStatus: nextStatus,
    });

    return { ktgCase: updatedCase, readiness, submissions };
  }

  async createCase(ktgCase: KtgCase, actor: ActorContext): Promise<CommandResult<KtgCase>> {
    const issues = validateKtgCase(ktgCase);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const created = await transaction.createCase(ktgCase);
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, created, {
          absenceLinks: [],
          coverageSnapshot: null,
          submissions: [],
        });
        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: synchronizedCase.tenantId,
          ktgCaseId: synchronizedCase.id,
          fromStatus: undefined,
          toStatus: synchronizedCase.status,
          eventType: buildStatusEventType(synchronizedCase.status),
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: {
            policyId: synchronizedCase.policyId,
          },
        });

        return { data: synchronizedCase, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateCase(params: {
    tenantId: string;
    caseId: string;
    patch: UpdateKtgCasePatch;
  }, actor: ActorContext): Promise<CommandResult<KtgCase>> {
    const issues = validateKtgCasePatch(params.patch);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getCaseById(params.tenantId, params.caseId);
        if (!existing) {
          return { issues: [{ field: "caseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const updated = await transaction.updateCase({
          ...existing,
          ...params.patch,
        });
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, updated);
        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: synchronizedCase.tenantId,
          ktgCaseId: synchronizedCase.id,
          fromStatus: existing.status,
          toStatus: synchronizedCase.status,
          eventType: "corrected",
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: {
            patch: params.patch,
          },
        });

        return { data: synchronizedCase, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createAbsenceLink(link: KtgCaseAbsenceLink, actor: ActorContext): Promise<CommandResult<KtgCaseAbsenceLink>> {
    const issues = validateKtgCaseAbsenceLink(link);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const currentCase = await transaction.getCaseById(link.tenantId, link.ktgCaseId);
        if (!currentCase) {
          return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const existingLinks = await transaction.listAbsenceLinksByCase(link.tenantId, link.ktgCaseId);
        issues.push(...validateSingleOriginatingEpisode(existingLinks, link));
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const created = await transaction.createAbsenceLink(link);
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, currentCase, {
          absenceLinks: [...existingLinks, created],
        });
        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: created.tenantId,
          ktgCaseId: created.ktgCaseId,
          fromStatus: synchronizedCase.status,
          toStatus: synchronizedCase.status,
          eventType: "corrected",
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: {
            absenceEpisodeId: created.absenceEpisodeId,
            isOriginatingEpisode: created.isOriginatingEpisode,
          },
        });

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

  async createCoverageSnapshot(
    snapshot: KtgCaseCoverageSnapshot,
    actor: ActorContext,
  ): Promise<CommandResult<KtgCaseCoverageSnapshot>> {
    const issues = validateKtgCaseCoverageSnapshot(snapshot);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const currentCase = await transaction.getCaseById(snapshot.tenantId, snapshot.ktgCaseId);
        if (!currentCase) {
          return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createCoverageSnapshot(snapshot);
        const firstPayableDay = calculateFirstPayableDay({
          firstDayOfIncapacity: created.firstDayOfIncapacity,
          wartezeitDays: created.wartezeitDays,
          lohnfortzahlungDays: created.lohnfortzahlungDays,
        });
        const caseWithBenefitStartDate = await transaction.updateCase({
          ...currentCase,
          benefitStartDate: firstPayableDay.value,
        });
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, caseWithBenefitStartDate, {
          coverageSnapshot: created,
        });

        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: created.tenantId,
          ktgCaseId: created.ktgCaseId,
          fromStatus: synchronizedCase.status,
          toStatus: synchronizedCase.status,
          eventType: "corrected",
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: {
            coveragePercentage: created.coveragePercentage,
            wartezeitDays: created.wartezeitDays,
            lohnfortzahlungDays: created.lohnfortzahlungDays,
          },
        });

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

  async createSubmission(
    submission: KtgCaseSubmission,
    actor: ActorContext,
  ): Promise<CommandResult<KtgCaseSubmission>> {
    const issues = validateKtgCaseSubmission(submission);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const currentCase = await transaction.getCaseById(submission.tenantId, submission.ktgCaseId);
        if (!currentCase) {
          return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const [absenceLinks, coverageSnapshot] = await Promise.all([
          transaction.listAbsenceLinksByCase(currentCase.tenantId, currentCase.id),
          transaction.getCoverageSnapshotByCase(currentCase.tenantId, currentCase.id),
        ]);
        const readiness = calculateSubmissionReadiness({
          ktgCase: currentCase,
          absenceLinks,
          coverageSnapshot: coverageSnapshot ?? undefined,
        });
        if (!readiness.value) {
          await this.synchronizeSubmissionReadiness(transaction, currentCase, {
            absenceLinks,
            coverageSnapshot,
            blockedAttempt: true,
          });

          return {
            issues: readiness.inputs.blockers instanceof Array
              ? readiness.inputs.blockers.map((blocker) => ({
                  field: "submission",
                  message: `Einreichung blockiert: ${blocker}`,
                  severity: "error" as const,
                }))
              : [{ field: "submission", message: "Einreichung blockiert.", severity: "error" }],
          };
        }

        const created = await transaction.createSubmission(submission);
        const existingSubmissions = await transaction.listSubmissionsByCase(currentCase.tenantId, currentCase.id);

        if (created.validationResult === "blocked") {
          const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, currentCase, {
            absenceLinks,
            coverageSnapshot,
            submissions: existingSubmissions,
            blockedAttempt: true,
          });
          await transaction.createStatusEvent({
            id: generateId(),
            tenantId: created.tenantId,
            ktgCaseId: created.ktgCaseId,
            fromStatus: synchronizedCase.status,
            toStatus: synchronizedCase.status,
            eventType: "submission_blocked",
            eventAt: actor.effectiveAt,
            actorId: actor.actorId,
            actorRole: actor.actorRole,
            correlationId: actor.correlationId,
            payload: {
              submissionId: created.id,
              submissionAttemptStatus: "blocked",
              validationResult: created.validationResult,
            },
          });

          return {
            data: created,
            issues: [{
              field: "validationResult",
              message: "Einreichung wurde protokolliert, aber wegen blockierender Validierung nicht an das Claims-System uebermittelt.",
              severity: "warning",
            }],
          };
        }

        const targetStatus = currentCase.status === "submitted" ? currentCase.status : "submitted";
        const transitionIssues =
          currentCase.status === targetStatus
            ? []
            : validateKtgCaseStatusTransition(currentCase.status, targetStatus);
        if (hasBlockingIssues(transitionIssues)) {
          return { issues: transitionIssues };
        }

        const updatedCase = await transaction.updateCase({
          ...currentCase,
          status: targetStatus,
          claimsSystemCaseId: created.externalClaimsSystemId ?? currentCase.claimsSystemCaseId,
        });
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, updatedCase, {
          absenceLinks,
          coverageSnapshot,
          submissions: existingSubmissions,
        });
        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: created.tenantId,
          ktgCaseId: created.ktgCaseId,
          fromStatus: currentCase.status,
          toStatus: synchronizedCase.status,
          eventType: "submitted",
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: {
            submissionId: created.id,
            validationResult: created.validationResult,
            externalClaimsSystemId: created.externalClaimsSystemId,
          },
        });

        return { data: created, issues: [] };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async transitionStatus(params: {
    tenantId: string;
    caseId: string;
    toStatus: KtgCaseStatus;
    payload?: Record<string, unknown>;
  }, actor: ActorContext): Promise<CommandResult<KtgCase>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const currentCase = await transaction.getCaseById(params.tenantId, params.caseId);
        if (!currentCase) {
          return { issues: [{ field: "caseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateKtgCaseStatusTransition(currentCase.status, params.toStatus);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateCase({
          ...currentCase,
          status: params.toStatus,
        });
        const { ktgCase: synchronizedCase } = await this.synchronizeSubmissionReadiness(transaction, updated);
        await transaction.createStatusEvent({
          id: generateId(),
          tenantId: synchronizedCase.tenantId,
          ktgCaseId: synchronizedCase.id,
          fromStatus: currentCase.status,
          toStatus: params.toStatus,
          eventType: buildStatusEventType(params.toStatus),
          eventAt: actor.effectiveAt,
          actorId: actor.actorId,
          actorRole: actor.actorRole,
          correlationId: actor.correlationId,
          payload: params.payload,
        });

        return { data: synchronizedCase, issues };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [repositoryIssue] };
      }

      throw error;
    }
  }

  async createDeadline(deadline: KtgDeadline): Promise<CommandResult<KtgDeadline>> {
    const issues = validateKtgDeadline(deadline);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const currentCase = await transaction.getCaseById(deadline.tenantId, deadline.ktgCaseId);
      if (!currentCase) {
        return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
      }

      const created = await transaction.createDeadline(deadline);
      return { data: created, issues };
    });
  }

  async createTask(task: KtgTask): Promise<CommandResult<KtgTask>> {
    const issues = validateKtgTask(task);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const currentCase = await transaction.getCaseById(task.tenantId, task.ktgCaseId);
      if (!currentCase) {
        return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
      }

      if (task.deadlineId) {
        const deadlines = await transaction.listDeadlinesByCase(task.tenantId, task.ktgCaseId);
        if (!deadlines.some((deadline) => deadline.id === task.deadlineId)) {
          return { issues: [{ field: "deadlineId", message: "Frist gehoert nicht zu diesem KTG-Fall.", severity: "error" }] };
        }
      }

      const created = await transaction.createTask(task);
      return { data: created, issues };
    });
  }

  async createNote(note: KtgCaseNote): Promise<CommandResult<KtgCaseNote>> {
    const issues = validateKtgCaseNote(note);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    return this.repository.withTransaction(async (transaction) => {
      const currentCase = await transaction.getCaseById(note.tenantId, note.ktgCaseId);
      if (!currentCase) {
        return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
      }

      const created = await transaction.createNote(note);
      return { data: created, issues };
    });
  }

  async createDecision(decision: KtgCaseDecision): Promise<CommandResult<KtgCaseDecision>> {
    const issues = validateKtgCaseDecision(decision);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const currentCase = await transaction.getCaseById(decision.tenantId, decision.ktgCaseId);
        if (!currentCase) {
          return { issues: [{ field: "ktgCaseId", message: "KTG-Fall wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createDecision(decision);
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

  async getCaseDetail(tenantId: string, caseId: string): Promise<KtgCaseDetail | null> {
    const ktgCase = await this.repository.getCaseById(tenantId, caseId);
    if (!ktgCase) {
      return null;
    }

    const [absenceLinks, coverageSnapshot, submissions, deadlines, tasks, notes, decisions, statusEvents] =
      await Promise.all([
        this.repository.listAbsenceLinksByCase(tenantId, caseId),
        this.repository.getCoverageSnapshotByCase(tenantId, caseId),
        this.repository.listSubmissionsByCase(tenantId, caseId),
        this.repository.listDeadlinesByCase(tenantId, caseId),
        this.repository.listTasksByCase(tenantId, caseId),
        this.repository.listNotesByCase(tenantId, caseId),
        this.repository.listDecisionsByCase(tenantId, caseId),
        this.repository.listStatusEventsByCase(tenantId, caseId),
      ]);

    return {
      ...ktgCase,
      absenceLinks,
      coverageSnapshot: coverageSnapshot ?? undefined,
      submissions,
      deadlines,
      tasks,
      notes,
      decisions,
      statusEvents,
      firstPayableDay: coverageSnapshot
        ? calculateFirstPayableDay({
            firstDayOfIncapacity: coverageSnapshot.firstDayOfIncapacity,
            wartezeitDays: coverageSnapshot.wartezeitDays,
            lohnfortzahlungDays: coverageSnapshot.lohnfortzahlungDays,
          })
        : undefined,
      submissionReadiness: calculateSubmissionReadiness({
        ktgCase,
        absenceLinks,
        coverageSnapshot: coverageSnapshot ?? undefined,
      }),
    };
  }

  async getSubmissionReadiness(params: {
    tenantId: string;
    caseId: string;
  }): Promise<TransparentBoolean> {
    const ktgCase = await this.repository.getCaseById(params.tenantId, params.caseId);
    if (!ktgCase) {
      return {
        value: false,
        formula: "case_exists",
        inputs: {
          blocker: "case_missing",
        },
        effectiveAt: new Date().toISOString(),
      };
    }

    const [absenceLinks, coverageSnapshot] = await Promise.all([
      this.repository.listAbsenceLinksByCase(params.tenantId, params.caseId),
      this.repository.getCoverageSnapshotByCase(params.tenantId, params.caseId),
    ]);

    return calculateSubmissionReadiness({
      ktgCase,
      absenceLinks,
      coverageSnapshot: coverageSnapshot ?? undefined,
    });
  }

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
  }): KtgCaseSuggestion {
    return evaluateKtgCaseSuggestion(input);
  }

  buildDeadlinePreview(input: {
    anchorDate: string;
    daysToAdd: number;
    countingMethod: KtgDeadline["countingMethod"];
  }): TransparentDate {
    return calculateDeadlineDueAt(input);
  }
}
