import type { DeliverySuppression, InboxItem, InboxItemAssignment, InboxItemDetail, NotificationDelivery, NotificationEvent, NotificationPreference, NotificationTemplate, UpdateInboxItemPatch, UpdateNotificationDeliveryPatch, UpdateNotificationPreferencePatch } from "../domain/types.js";
import { type ValidationIssue } from "../domain/validations.js";
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
export declare class InboxNotificationService {
    private readonly repository;
    constructor(repository: InboxNotificationRepository);
    createNotificationEventWithInbox(params: {
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
    }>>;
    updateInboxItem(params: {
        tenantId: string;
        inboxItemId: string;
        patch: UpdateInboxItemPatch;
    }): Promise<CommandResult<InboxItem>>;
    createInboxItemAssignment(assignment: InboxItemAssignment): Promise<CommandResult<InboxItemAssignment>>;
    createNotificationPreference(preference: NotificationPreference): Promise<CommandResult<NotificationPreference>>;
    updateNotificationPreference(params: {
        tenantId: string;
        preferenceId: string;
        patch: UpdateNotificationPreferencePatch;
    }): Promise<CommandResult<NotificationPreference>>;
    createNotificationTemplate(template: NotificationTemplate): Promise<CommandResult<NotificationTemplate>>;
    createNotificationDelivery(delivery: NotificationDelivery): Promise<CommandResult<NotificationDelivery>>;
    updateNotificationDelivery(params: {
        tenantId: string;
        deliveryId: string;
        patch: UpdateNotificationDeliveryPatch;
    }): Promise<CommandResult<NotificationDelivery>>;
    getInboxItemDetail(tenantId: string, inboxItemId: string, referenceAt?: string): Promise<InboxItemDetail | null>;
}
