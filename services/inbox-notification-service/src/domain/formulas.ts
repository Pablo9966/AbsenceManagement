import type {
  DeliverySuppression,
  InboxStatus,
  NotificationPreference,
  TransparentBoolean,
} from "./types.js";

const parseTimeToMinutes = (value: string): number => {
  const [hours = 0, minutes = 0] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

export const calculateNotificationSuppressed = (input: {
  preference?: Pick<NotificationPreference, "enabledFlag" | "quietHoursStart" | "quietHoursEnd">;
  referenceLocalTime: string;
  duplicateDeliveryFlag?: boolean;
}): TransparentBoolean & { suppressionReason?: DeliverySuppression["suppressionReason"] } => {
  const enabledFlag = input.preference?.enabledFlag ?? true;
  const quietHoursStart = input.preference?.quietHoursStart;
  const quietHoursEnd = input.preference?.quietHoursEnd;
  const currentMinutes = parseTimeToMinutes(input.referenceLocalTime);
  let inQuietHours = false;

  if (quietHoursStart && quietHoursEnd) {
    const startMinutes = parseTimeToMinutes(quietHoursStart);
    const endMinutes = parseTimeToMinutes(quietHoursEnd);
    inQuietHours =
      startMinutes <= endMinutes
        ? currentMinutes >= startMinutes && currentMinutes < endMinutes
        : currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  const duplicateDeliveryFlag = input.duplicateDeliveryFlag ?? false;
  const value = !enabledFlag || inQuietHours || duplicateDeliveryFlag;
  const suppressionReason = !enabledFlag
    ? "preference_disabled"
    : inQuietHours
      ? "quiet_hours"
      : duplicateDeliveryFlag
        ? "duplicate_delivery_guard"
        : undefined;

  return {
    value,
    suppressionReason,
    formula: "preference_disabled or in_quiet_hours or duplicate_delivery_guard",
    inputs: {
      enabledFlag,
      quietHoursStart,
      quietHoursEnd,
      referenceLocalTime: input.referenceLocalTime,
      duplicateDeliveryFlag,
      inQuietHours,
    },
    effectiveAt: input.referenceLocalTime,
  };
};

export const calculateInboxItemOverdue = (input: {
  dueAt?: string;
  referenceAt: string;
  resolvedAt?: string;
  status: InboxStatus;
}): TransparentBoolean => {
  const value = Boolean(
    input.dueAt &&
    input.dueAt < input.referenceAt &&
    !input.resolvedAt &&
    input.status !== "resolved" &&
    input.status !== "cancelled",
  );

  return {
    value,
    formula: "due_at < reference_at and resolved_at is null and status not in (resolved, cancelled)",
    inputs: {
      dueAt: input.dueAt,
      referenceAt: input.referenceAt,
      resolvedAt: input.resolvedAt,
      status: input.status,
    },
    effectiveAt: input.referenceAt,
  };
};
