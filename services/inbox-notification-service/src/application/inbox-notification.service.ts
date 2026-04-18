import {
  calculateInboxItemOverdue,
  calculateNotificationSuppressed,
} from "../domain/formulas.js";
import type {
  DeliverySuppression,
  InboxItem,
  InboxItemAssignment,
  InboxItemDetail,
  NotificationDelivery,
  NotificationEvent,
  NotificationPreference,
  NotificationTemplate,
  UpdateInboxItemPatch,
  UpdateNotificationDeliveryPatch,
  UpdateNotificationPreferencePatch,
} from "../domain/types.js";
import {
  hasBlockingIssues,
  validateInboxItem,
  validateInboxItemAssignment,
  validateInboxItemPatch,
  validateNotificationDelivery,
  validateNotificationDeliveryPatch,
  validateNotificationEvent,
  validateNotificationPreference,
  validateNotificationPreferencePatch,
  validateNotificationTemplate,
  type ValidationIssue,
} from "../domain/validations.js";

export interface InboxNotificationRepositoryContext {
  createNotificationEvent(event: NotificationEvent): Promise<NotificationEvent>;
  getNotificationEventById(tenantId: string, eventId: string): Promise<NotificationEvent | null>;
  createInboxItem(item: InboxItem): Promise<InboxItem>;
  updateInboxItem(item: InboxItem): Promise<InboxItem>;
  getInboxItemById(tenantId: string, inboxItemId: string): Promise<InboxItem | null>;
  listInboxItems(tenantId: string, filters?: {
    audienceUserId?: string;
    audienceRole?: string;
    status?: InboxItem["status"];
  }): Promise<InboxItem[]>;
  createInboxItemAssignment(assignment: InboxItemAssignment): Promise<InboxItemAssignment>;
  listInboxItemAssignmentsByItem(tenantId: string, inboxItemId: string): Promise<InboxItemAssignment[]>;
  createNotificationPreference(preference: NotificationPreference): Promise<NotificationPreference>;
  updateNotificationPreference(preference: NotificationPreference): Promise<NotificationPreference>;
  getNotificationPreferenceById(tenantId: string, preferenceId: string): Promise<NotificationPreference | null>;
  findNotificationPreference(tenantId: string, params: {
    userId: string;
    notificationType: NotificationPreference["notificationType"];
    channel: NotificationPreference["channel"];
  }): Promise<NotificationPreference | null>;
  listNotificationPreferences(tenantId: string, filters?: {
    userId?: string;
    notificationType?: NotificationPreference["notificationType"];
  }): Promise<NotificationPreference[]>;
  createNotificationTemplate(template: NotificationTemplate): Promise<NotificationTemplate>;
  findNotificationTemplate(tenantId: string, params: {
    notificationType: NotificationTemplate["notificationType"];
    channel: NotificationTemplate["channel"];
    language: string;
  }): Promise<NotificationTemplate | null>;
  listNotificationTemplates(tenantId: string, filters?: {
    notificationType?: NotificationTemplate["notificationType"];
    channel?: NotificationTemplate["channel"];
  }): Promise<NotificationTemplate[]>;
  createNotificationDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery>;
  updateNotificationDelivery(delivery: NotificationDelivery): Promise<NotificationDelivery>;
  getNotificationDeliveryById(tenantId: string, deliveryId: string): Promise<NotificationDelivery | null>;
  listNotificationDeliveriesByItem(tenantId: string, inboxItemId: string): Promise<NotificationDelivery[]>;
  listNotificationDeliveriesByEvent(tenantId: string, eventId: string): Promise<NotificationDelivery[]>;
  createDeliverySuppression(suppression: DeliverySuppression): Promise<DeliverySuppression>;
  listDeliverySuppressions(tenantId: string, filters?: {
    recipientUserId?: string;
    notificationEventId?: string;
  }): Promise<DeliverySuppression[]>;
}

export interface InboxNotificationRepository extends InboxNotificationRepositoryContext {
  withTransaction<T>(operation: (repository: InboxNotificationRepositoryContext) => Promise<T>): Promise<T>;
}

export interface CommandResult<T> {
  data?: T;
  issues: ValidationIssue[];
}

interface RepositoryConstraintErrorLike {
  constraint?: string;
}

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
    case "uq_notification_preference_active":
      return { field: "preference", message: "Praeferenz fuer User, Kanal und Typ existiert bereits.", severity: "error" };
    case "uq_notification_template_scope":
      return { field: "template", message: "Template-Version fuer Scope, Kanal und Sprache existiert bereits.", severity: "error" };
    case "fk_inbox_item_notification_event":
      return { field: "notificationEventId", message: "Notification Event wurde nicht gefunden.", severity: "error" };
    case "fk_notification_delivery_event":
      return { field: "notificationEventId", message: "Notification Event wurde nicht gefunden.", severity: "error" };
    case "fk_notification_delivery_inbox_item":
      return { field: "inboxItemId", message: "Inbox Item wurde nicht gefunden.", severity: "error" };
    case "fk_inbox_item_assignment_item":
      return { field: "inboxItemId", message: "Inbox Item wurde nicht gefunden.", severity: "error" };
    default:
      return null;
  }
};

export class InboxNotificationService {
  constructor(private readonly repository: InboxNotificationRepository) {}

  async createNotificationEventWithInbox(params: {
    event: NotificationEvent;
    inboxItem: InboxItem;
    delivery?: Omit<NotificationDelivery, "notificationEventId" | "inboxItemId" | "deliveryStatus"> & {
      referenceLocalTime: string;
      duplicateDeliveryFlag?: boolean;
    };
  }): Promise<CommandResult<{
    event: NotificationEvent;
    inboxItem: InboxItem;
    delivery?: NotificationDelivery;
    suppression?: DeliverySuppression;
  }>> {
    const issues = [
      ...validateNotificationEvent(params.event),
      ...validateInboxItem(params.inboxItem),
    ];
    if (params.delivery) {
      issues.push(...validateNotificationDelivery({
        triggeredAt: params.delivery.triggeredAt,
      }));
    }
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const createdEvent = await transaction.createNotificationEvent(params.event);
        const createdInboxItem = await transaction.createInboxItem({
          ...params.inboxItem,
          notificationEventId: createdEvent.id,
        });

        if (!params.delivery) {
          return { data: { event: createdEvent, inboxItem: createdInboxItem }, issues };
        }

        const preference = await transaction.findNotificationPreference(createdEvent.tenantId, {
          userId: params.delivery.recipientUserId,
          notificationType: createdEvent.eventType,
          channel: params.delivery.channel,
        });
        const suppression = calculateNotificationSuppressed({
          preference: preference ?? undefined,
          referenceLocalTime: params.delivery.referenceLocalTime,
          duplicateDeliveryFlag: params.delivery.duplicateDeliveryFlag,
        });
        const template = await transaction.findNotificationTemplate(createdEvent.tenantId, {
          notificationType: createdEvent.eventType,
          channel: params.delivery.channel,
          language: preference?.locale ?? "de-CH",
        });

        if (suppression.value && suppression.suppressionReason) {
          const suppressedDelivery = await transaction.createNotificationDelivery({
            ...params.delivery,
            id: crypto.randomUUID(),
            tenantId: createdEvent.tenantId,
            notificationEventId: createdEvent.id,
            inboxItemId: createdInboxItem.id,
            templateId: template?.id,
            deliveryStatus: "suppressed",
          });
          const createdSuppression = await transaction.createDeliverySuppression({
            id: crypto.randomUUID(),
            tenantId: createdEvent.tenantId,
            notificationEventId: createdEvent.id,
            recipientUserId: params.delivery.recipientUserId,
            channel: params.delivery.channel,
            suppressionReason: suppression.suppressionReason,
            suppressedAt: params.delivery.triggeredAt,
            deliveryId: suppressedDelivery.id,
          });

          return {
            data: {
              event: createdEvent,
              inboxItem: createdInboxItem,
              delivery: suppressedDelivery,
              suppression: createdSuppression,
            },
            issues,
          };
        }

        const createdDelivery = await transaction.createNotificationDelivery({
          ...params.delivery,
          id: crypto.randomUUID(),
          tenantId: createdEvent.tenantId,
          notificationEventId: createdEvent.id,
          inboxItemId: createdInboxItem.id,
          templateId: template?.id,
          deliveryStatus: "pending",
        });

        return {
          data: {
            event: createdEvent,
            inboxItem: createdInboxItem,
            delivery: createdDelivery,
          },
          issues,
        };
      });
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateInboxItem(params: {
    tenantId: string;
    inboxItemId: string;
    patch: UpdateInboxItemPatch;
  }): Promise<CommandResult<InboxItem>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getInboxItemById(params.tenantId, params.inboxItemId);
        if (!existing) {
          return { issues: [{ field: "inboxItemId", message: "Inbox Item wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateInboxItemPatch(existing.status, params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateInboxItem({
          ...existing,
          ...params.patch,
        });

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

  async createInboxItemAssignment(assignment: InboxItemAssignment): Promise<CommandResult<InboxItemAssignment>> {
    const issues = validateInboxItemAssignment(assignment);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const item = await transaction.getInboxItemById(assignment.tenantId, assignment.inboxItemId);
        if (!item) {
          return { issues: [{ field: "inboxItemId", message: "Inbox Item wurde nicht gefunden.", severity: "error" }] };
        }

        const created = await transaction.createInboxItemAssignment(assignment);
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

  async createNotificationPreference(preference: NotificationPreference): Promise<CommandResult<NotificationPreference>> {
    const issues = validateNotificationPreference(preference);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createNotificationPreference(preference);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async updateNotificationPreference(params: {
    tenantId: string;
    preferenceId: string;
    patch: UpdateNotificationPreferencePatch;
  }): Promise<CommandResult<NotificationPreference>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getNotificationPreferenceById(params.tenantId, params.preferenceId);
        if (!existing) {
          return { issues: [{ field: "preferenceId", message: "Praeferenz wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateNotificationPreferencePatch(params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateNotificationPreference({
          ...existing,
          ...params.patch,
        });
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

  async createNotificationTemplate(template: NotificationTemplate): Promise<CommandResult<NotificationTemplate>> {
    const issues = validateNotificationTemplate(template);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      const created = await this.repository.createNotificationTemplate(template);
      return { data: created, issues };
    } catch (error) {
      const repositoryIssue = mapRepositoryErrorToIssue(error);
      if (repositoryIssue) {
        return { issues: [...issues, repositoryIssue] };
      }

      throw error;
    }
  }

  async createNotificationDelivery(delivery: NotificationDelivery): Promise<CommandResult<NotificationDelivery>> {
    const issues = validateNotificationDelivery(delivery);
    if (hasBlockingIssues(issues)) {
      return { issues };
    }

    try {
      return await this.repository.withTransaction(async (transaction) => {
        const event = await transaction.getNotificationEventById(delivery.tenantId, delivery.notificationEventId);
        if (!event) {
          return { issues: [{ field: "notificationEventId", message: "Notification Event wurde nicht gefunden.", severity: "error" }] };
        }

        if (delivery.inboxItemId) {
          const inboxItem = await transaction.getInboxItemById(delivery.tenantId, delivery.inboxItemId);
          if (!inboxItem) {
            return { issues: [{ field: "inboxItemId", message: "Inbox Item wurde nicht gefunden.", severity: "error" }] };
          }
        }

        const created = await transaction.createNotificationDelivery(delivery);
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

  async updateNotificationDelivery(params: {
    tenantId: string;
    deliveryId: string;
    patch: UpdateNotificationDeliveryPatch;
  }): Promise<CommandResult<NotificationDelivery>> {
    try {
      return await this.repository.withTransaction(async (transaction) => {
        const existing = await transaction.getNotificationDeliveryById(params.tenantId, params.deliveryId);
        if (!existing) {
          return { issues: [{ field: "deliveryId", message: "Delivery wurde nicht gefunden.", severity: "error" }] };
        }

        const issues = validateNotificationDeliveryPatch(existing.deliveryStatus, params.patch);
        if (hasBlockingIssues(issues)) {
          return { issues };
        }

        const updated = await transaction.updateNotificationDelivery({
          ...existing,
          ...params.patch,
        });
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

  async getInboxItemDetail(tenantId: string, inboxItemId: string, referenceAt?: string): Promise<InboxItemDetail | null> {
    const item = await this.repository.getInboxItemById(tenantId, inboxItemId);
    if (!item) {
      return null;
    }

    const [assignments, deliveries] = await Promise.all([
      this.repository.listInboxItemAssignmentsByItem(tenantId, inboxItemId),
      this.repository.listNotificationDeliveriesByItem(tenantId, inboxItemId),
    ]);

    return {
      ...item,
      assignments,
      deliveries,
      overdue: calculateInboxItemOverdue({
        dueAt: item.dueAt,
        referenceAt: referenceAt ?? new Date().toISOString(),
        resolvedAt: item.resolvedAt,
        status: item.status,
      }),
    };
  }
}
