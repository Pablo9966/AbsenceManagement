export type AudienceType = "user" | "role";
export type InboxPriority = "low" | "medium" | "high" | "urgent";
export type InboxStatus = "open" | "acknowledged" | "resolved" | "cancelled";
export type AssignmentStatus = "assigned" | "accepted" | "released";
export type SourceType = "absence_episode" | "ktg_case" | "document" | "system";
export type NotificationChannel = "in_app" | "email" | "sms";
export type NotificationType =
  | "certificate_expiring"
  | "case_submission_blocked"
  | "deadline_overdue"
  | "absence_reported"
  | "return_to_work_due"
  | "system_alert"
  | "manual";
export type TemplateScopeType = "global" | "tenant";
export type DeliveryStatus = "pending" | "queued" | "sent" | "failed" | "suppressed";
export type SuppressionReason = "preference_disabled" | "quiet_hours" | "duplicate_delivery_guard" | "channel_unavailable";

export interface TransparentValue<T> {
  value: T;
  formula: string;
  inputs: Record<string, unknown>;
}

export interface TransparentBoolean extends TransparentValue<boolean> {
  effectiveAt: string;
}

export interface NotificationEvent {
  id: string;
  tenantId: string;
  eventType: NotificationType;
  sourceType: SourceType;
  sourceId: string;
  correlationId?: string;
  triggeredAt: string;
  payload: Record<string, unknown>;
}

export interface InboxItem {
  id: string;
  tenantId: string;
  audienceType: AudienceType;
  audienceUserId?: string;
  audienceRole?: string;
  sourceType: SourceType;
  sourceId: string;
  title: string;
  summary: string;
  priority: InboxPriority;
  dueAt?: string;
  status: InboxStatus;
  primaryActionLabel?: string;
  primaryActionUrl?: string;
  secondaryActionUrl?: string;
  notificationEventId?: string;
  createdAt: string;
  readAt?: string;
  resolvedAt?: string;
}

export interface InboxItemAssignment {
  id: string;
  tenantId: string;
  inboxItemId: string;
  assignedUserId?: string;
  assignedRole?: string;
  assignedAt: string;
  assignmentStatus: AssignmentStatus;
}

export interface NotificationPreference {
  id: string;
  tenantId: string;
  userId: string;
  channel: NotificationChannel;
  notificationType: NotificationType;
  enabledFlag: boolean;
  locale: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface NotificationTemplate {
  id: string;
  tenantId?: string;
  scopeType: TemplateScopeType;
  notificationType: NotificationType;
  channel: NotificationChannel;
  language: string;
  subjectTemplate?: string;
  bodyTemplate: string;
  activeFlag: boolean;
  version: number;
}

export interface NotificationDelivery {
  id: string;
  tenantId: string;
  notificationEventId: string;
  inboxItemId?: string;
  recipientUserId: string;
  channel: NotificationChannel;
  templateId?: string;
  deliveryStatus: DeliveryStatus;
  triggeredAt: string;
  sentAt?: string;
  providerMessageId?: string;
  failureReason?: string;
}

export interface DeliverySuppression {
  id: string;
  tenantId: string;
  notificationEventId: string;
  recipientUserId: string;
  channel: NotificationChannel;
  suppressionReason: SuppressionReason;
  suppressedAt: string;
  deliveryId?: string;
}

export interface InboxItemDetail extends InboxItem {
  overdue: TransparentBoolean;
  assignments: InboxItemAssignment[];
  deliveries: NotificationDelivery[];
}

export interface UpdateInboxItemPatch {
  status?: InboxStatus;
  readAt?: string;
  resolvedAt?: string;
}

export interface UpdateNotificationPreferencePatch {
  enabledFlag?: boolean;
  locale?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface UpdateNotificationDeliveryPatch {
  deliveryStatus?: DeliveryStatus;
  sentAt?: string;
  providerMessageId?: string;
  failureReason?: string;
}

