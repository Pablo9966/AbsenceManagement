import type {
  AccessPurposeRecord,
  OnboardingStatus,
  OnboardingWorkspace,
  PermissionGrant,
  PermissionPolicySet,
  PlatformUser,
  PortalSessionPolicy,
  ProvisioningInvite,
  RoleAssignment,
  SsoConfiguration,
  TenantMembership,
  UpdateOnboardingWorkspacePatch,
  UpdatePlatformUserPatch,
  UpdateTenantMembershipPatch,
  UserEmployeeLink,
  UserProfile,
} from "./types.js";

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const isIsoDateTime = (value: string): boolean => /^\d{4}-\d{2}-\d{2}T/.test(value);
const looksLikeEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const allowedOnboardingTransitions: Record<OnboardingStatus, OnboardingStatus[]> = {
  created: ["policy_sync", "paused"],
  policy_sync: ["admin_setup", "paused"],
  admin_setup: ["user_provisioning", "paused"],
  user_provisioning: ["integration_setup", "paused"],
  integration_setup: ["ready", "paused"],
  ready: ["paused"],
  paused: ["policy_sync", "admin_setup", "user_provisioning", "integration_setup", "ready"],
};

export const validatePlatformUser = (
  input: Pick<PlatformUser, "email" | "createdAt" | "updatedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!looksLikeEmail(input.email)) {
    issues.push({ field: "email", message: "E-Mail ist ungueltig.", severity: "error" });
  }
  if (!isIsoDateTime(input.createdAt) || !isIsoDateTime(input.updatedAt)) {
    issues.push({ field: "timestamps", message: "Zeitstempel sind ungueltig.", severity: "error" });
  }
  return issues;
};

export const validatePlatformUserPatch = (
  patch: UpdatePlatformUserPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (patch.updatedAt !== undefined && !isIsoDateTime(patch.updatedAt)) {
    issues.push({ field: "updatedAt", message: "Aktualisierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateUserProfile = (
  input: Pick<UserProfile, "firstName" | "lastName" | "createdAt" | "updatedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.firstName.trim() || !input.lastName.trim()) {
    issues.push({ field: "name", message: "Vorname und Nachname sind erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.createdAt) || !isIsoDateTime(input.updatedAt)) {
    issues.push({ field: "timestamps", message: "Zeitstempel sind ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateTenantMembership = (
  input: Pick<TenantMembership, "userId" | "joinedAt" | "leftAt" | "updatedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.userId.trim()) {
    issues.push({ field: "userId", message: "Benutzerreferenz ist erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.joinedAt)) {
    issues.push({ field: "joinedAt", message: "Beitrittszeitpunkt ist ungueltig.", severity: "error" });
  }
  if (input.leftAt !== undefined && !isIsoDateTime(input.leftAt)) {
    issues.push({ field: "leftAt", message: "Austrittszeitpunkt ist ungueltig.", severity: "error" });
  }
  if (!isIsoDateTime(input.updatedAt)) {
    issues.push({ field: "updatedAt", message: "Aktualisierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateTenantMembershipPatch = (
  patch: UpdateTenantMembershipPatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (patch.leftAt !== undefined && !isIsoDateTime(patch.leftAt)) {
    issues.push({ field: "leftAt", message: "Austrittszeitpunkt ist ungueltig.", severity: "error" });
  }
  if (patch.updatedAt !== undefined && !isIsoDateTime(patch.updatedAt)) {
    issues.push({ field: "updatedAt", message: "Aktualisierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateUserEmployeeLink = (
  input: Pick<UserEmployeeLink, "userId" | "employeeId" | "linkedAt" | "revokedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.userId.trim() || !input.employeeId.trim()) {
    issues.push({ field: "userEmployeeLink", message: "Benutzer- und Mitarbeiterreferenz sind erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.linkedAt)) {
    issues.push({ field: "linkedAt", message: "Verknuepfungszeitpunkt ist ungueltig.", severity: "error" });
  }
  if (input.revokedAt !== undefined && !isIsoDateTime(input.revokedAt)) {
    issues.push({ field: "revokedAt", message: "Widerrufszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateRoleAssignment = (
  input: Pick<RoleAssignment, "roleCode" | "scopeType" | "scopeReference" | "assignedAt" | "revokedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.roleCode.trim()) {
    issues.push({ field: "roleCode", message: "Rolle ist erforderlich.", severity: "error" });
  }
  if (input.scopeType !== "tenant" && !input.scopeReference?.trim()) {
    issues.push({ field: "scopeReference", message: "Scope-Referenz ist fuer diesen Scope erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.assignedAt)) {
    issues.push({ field: "assignedAt", message: "Zuweisungszeitpunkt ist ungueltig.", severity: "error" });
  }
  if (input.revokedAt !== undefined && !isIsoDateTime(input.revokedAt)) {
    issues.push({ field: "revokedAt", message: "Widerrufszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validatePermissionPolicySet = (
  input: Pick<PermissionPolicySet, "policyCode" | "policyVersion">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.policyCode.trim()) {
    issues.push({ field: "policyCode", message: "Policy-Code ist erforderlich.", severity: "error" });
  }
  if (input.policyVersion <= 0) {
    issues.push({ field: "policyVersion", message: "Policy-Version muss groesser als 0 sein.", severity: "error" });
  }
  return issues;
};

export const validatePermissionGrant = (
  input: Pick<PermissionGrant, "policySetId" | "roleCode" | "resourceType" | "action">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.policySetId.trim() || !input.roleCode.trim() || !input.resourceType.trim() || !input.action.trim()) {
    issues.push({ field: "permissionGrant", message: "Policy, Rolle, Ressource und Aktion sind erforderlich.", severity: "error" });
  }
  return issues;
};

export const validatePortalSessionPolicy = (
  input: Pick<PortalSessionPolicy, "idleTimeoutMinutes">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.idleTimeoutMinutes < 5 || input.idleTimeoutMinutes > 240) {
    issues.push({ field: "idleTimeoutMinutes", message: "Session Timeout muss zwischen 5 und 240 Minuten liegen.", severity: "error" });
  }
  return issues;
};

export const validateSsoConfiguration = (
  input: Pick<SsoConfiguration, "providerType" | "samlMetadataJson" | "oidcConfigJson">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (input.providerType === "saml" && !input.samlMetadataJson) {
    issues.push({ field: "samlMetadataJson", message: "SAML-Metadaten sind erforderlich.", severity: "error" });
  }
  if (input.providerType === "oidc" && !input.oidcConfigJson) {
    issues.push({ field: "oidcConfigJson", message: "OIDC-Konfiguration ist erforderlich.", severity: "error" });
  }
  return issues;
};

export const validateAccessPurposeRecord = (
  input: Pick<AccessPurposeRecord, "userId" | "employeeId" | "purposeCode" | "source" | "grantedAt" | "revokedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.userId && !input.employeeId) {
    issues.push({ field: "subject", message: "Zweckbindung benoetigt Benutzer- oder Mitarbeiterbezug.", severity: "error" });
  }
  if (!input.purposeCode.trim() || !input.source.trim()) {
    issues.push({ field: "purposeCode", message: "Zweckcode und Quelle sind erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.grantedAt)) {
    issues.push({ field: "grantedAt", message: "Startzeitpunkt ist ungueltig.", severity: "error" });
  }
  if (input.revokedAt !== undefined && !isIsoDateTime(input.revokedAt)) {
    issues.push({ field: "revokedAt", message: "Widerrufszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateOnboardingWorkspace = (
  input: Pick<OnboardingWorkspace, "currentStep" | "policySyncStatus" | "userProvisioningStatus" | "integrationSetupStatus" | "createdAt" | "updatedAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!input.currentStep.trim() || !input.policySyncStatus.trim() || !input.userProvisioningStatus.trim() || !input.integrationSetupStatus.trim()) {
    issues.push({ field: "onboardingWorkspace", message: "Alle Onboarding-Statusfelder sind erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.createdAt) || !isIsoDateTime(input.updatedAt)) {
    issues.push({ field: "timestamps", message: "Zeitstempel sind ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateOnboardingWorkspacePatch = (
  currentStatus: OnboardingStatus,
  patch: UpdateOnboardingWorkspacePatch,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (patch.status && patch.status !== currentStatus && !allowedOnboardingTransitions[currentStatus].includes(patch.status)) {
    issues.push({
      field: "status",
      message: `Onboarding-Statuswechsel von ${currentStatus} nach ${patch.status} ist nicht zulaessig.`,
      severity: "error",
    });
  }
  if (patch.updatedAt !== undefined && !isIsoDateTime(patch.updatedAt)) {
    issues.push({ field: "updatedAt", message: "Aktualisierungszeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const validateProvisioningInvite = (
  input: Pick<ProvisioningInvite, "email" | "targetRoleCode" | "expiresAt" | "acceptedAt" | "createdAt">,
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];
  if (!looksLikeEmail(input.email)) {
    issues.push({ field: "email", message: "Einladungs-E-Mail ist ungueltig.", severity: "error" });
  }
  if (!input.targetRoleCode.trim()) {
    issues.push({ field: "targetRoleCode", message: "Zielrolle ist erforderlich.", severity: "error" });
  }
  if (!isIsoDateTime(input.expiresAt) || !isIsoDateTime(input.createdAt)) {
    issues.push({ field: "timestamps", message: "Einladungszeitstempel sind ungueltig.", severity: "error" });
  }
  if (input.acceptedAt !== undefined && !isIsoDateTime(input.acceptedAt)) {
    issues.push({ field: "acceptedAt", message: "Annahmezeitpunkt ist ungueltig.", severity: "error" });
  }
  return issues;
};

export const hasBlockingIssues = (issues: ReadonlyArray<ValidationIssue>): boolean =>
  issues.some((issue) => issue.severity === "error");

