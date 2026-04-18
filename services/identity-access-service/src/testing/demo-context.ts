import { IdentityAccessService, type ActorContext } from "../application/identity-access.service.js";
import type {
  AccessPurposeRecord,
  AuditAccessPolicy,
  LocaleCode,
  OnboardingWorkspace,
  PermissionGrant,
  PermissionPolicySet,
  PermissionCheck,
  PlatformUser,
  PortalSessionPolicy,
  ProvisioningInvite,
  RoleAssignment,
  TenantMembership,
  UserProfile,
} from "../domain/types.js";
import { InMemoryIdentityAccessRepository } from "./in-memory-repository.js";

const effectiveAt = "2026-04-18T08:00:00.000Z";

const actor: ActorContext = {
  actorId: "system-seed",
  actorRole: "system",
  correlationId: "phase-2a-demo-seed",
  effectiveAt,
};

const timestamps = {
  createdAt: effectiveAt,
  updatedAt: effectiveAt,
};

const permissionId = (tenantId: string, roleCode: string, resourceType: string, action: string): string =>
  `${tenantId}:${roleCode}:${resourceType}:${action}`;

const buildPlatformUser = (
  id: string,
  email: string,
  preferredLanguage: LocaleCode,
  profile: Pick<UserProfile, "firstName" | "lastName" | "displayName">,
): { user: PlatformUser; profile: UserProfile } => ({
  user: {
    id,
    email,
    preferredLanguage,
    status: "active",
    ...timestamps,
  },
  profile: {
    userId: id,
    ...profile,
    ...timestamps,
  },
});

const buildMembership = (id: string, tenantId: string, userId: string): TenantMembership => ({
  id,
  tenantId,
  userId,
  membershipStatus: "active",
  joinedAt: effectiveAt,
  ...timestamps,
});

const buildRoleAssignment = (
  id: string,
  tenantId: string,
  userId: string,
  roleCode: string,
): RoleAssignment => ({
  id,
  tenantId,
  userId,
  roleCode,
  scopeType: "tenant",
  assignedAt: effectiveAt,
});

const buildPermissionPolicySet = (id: string, tenantId: string, policyCode: string): PermissionPolicySet => ({
  id,
  tenantId,
  policyCode,
  policyVersion: 1,
  activeFlag: true,
  description: `${policyCode} baseline for demo portal access`,
  createdAt: effectiveAt,
});

const buildPermissionGrant = (
  tenantId: string,
  policySetId: string,
  roleCode: string,
  permission: PermissionCheck,
): PermissionGrant => ({
  id: permissionId(tenantId, roleCode, permission.resourceType, permission.action),
  tenantId,
  policySetId,
  roleCode,
  resourceType: permission.resourceType,
  action: permission.action,
  effect: "allow",
  conditionJson: {},
  createdAt: effectiveAt,
});

interface DemoIdentityAccessContext {
  service: IdentityAccessService;
  tenants: {
    employer: { tenantId: string; tenantName: string; defaultLocale: LocaleCode; featureFlags: string[] };
    internal: { tenantId: string; tenantName: string; defaultLocale: LocaleCode; featureFlags: string[] };
  };
  users: {
    employerAdmin: { userId: string };
    internalClaims: { userId: string };
    internalCompliance: { userId: string };
  };
}

const employerPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "ktg_case", action: "read" },
  { resourceType: "document", action: "read" },
  { resourceType: "payment_instruction", action: "read" },
  { resourceType: "premium", action: "read" },
  { resourceType: "task", action: "read" },
  { resourceType: "tenant_admin", action: "manage" },
];

const internalClaimsPermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "claims_intake_workspace", action: "read" },
  { resourceType: "ktg_case", action: "read_internal" },
  { resourceType: "benefit_calculation", action: "read" },
];

const internalCompliancePermissions: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "audit", action: "view" },
  { resourceType: "internal_admin", action: "manage" },
];

const createDemoIdentityAccessContext = async (): Promise<DemoIdentityAccessContext> => {
  const repository = new InMemoryIdentityAccessRepository();
  const service = new IdentityAccessService(repository);

  const tenants = {
    employer: {
      tenantId: "tenant-employer-demo",
      tenantName: "elipsLife Demo Kunde",
      defaultLocale: "de-CH" as LocaleCode,
      featureFlags: ["dashboard-shell", "admin-shell", "phase-2a-demo-data"],
    },
    internal: {
      tenantId: "tenant-internal-demo",
      tenantName: "elipsLife Intern",
      defaultLocale: "de-CH" as LocaleCode,
      featureFlags: ["dashboard-shell", "compliance-shell", "phase-2a-demo-data"],
    },
  };

  const users = {
    employerAdmin: { userId: "user-employer-admin" },
    internalClaims: { userId: "user-internal-claims" },
    internalCompliance: { userId: "user-internal-compliance" },
  };

  const employerAdmin = buildPlatformUser(
    users.employerAdmin.userId,
    "hr.admin@demo.elipslife.ch",
    "de-CH",
    { firstName: "Hanna", lastName: "Admin", displayName: "Hanna Admin" },
  );
  const internalClaims = buildPlatformUser(
    users.internalClaims.userId,
    "claims.handler@elipslife.ch",
    "en-CH",
    { firstName: "Cleo", lastName: "Claims", displayName: "Cleo Claims" },
  );
  const internalCompliance = buildPlatformUser(
    users.internalCompliance.userId,
    "compliance.user@elipslife.ch",
    "de-CH",
    { firstName: "Nora", lastName: "Compliance", displayName: "Nora Compliance" },
  );

  for (const seed of [employerAdmin, internalClaims, internalCompliance]) {
    await service.createPlatformUser(seed.user, seed.profile, actor);
  }

  await service.createTenantMembership(
    buildMembership("membership-employer-admin", tenants.employer.tenantId, users.employerAdmin.userId),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-internal-claims", tenants.internal.tenantId, users.internalClaims.userId),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-internal-compliance", tenants.internal.tenantId, users.internalCompliance.userId),
    actor,
  );

  const employerAdminRole = "tenant_admin";
  const internalClaimsRole = "claims_handler";
  const internalComplianceRole = "compliance_user";

  await service.createRoleAssignment(
    buildRoleAssignment("role-employer-admin", tenants.employer.tenantId, users.employerAdmin.userId, employerAdminRole),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-internal-claims", tenants.internal.tenantId, users.internalClaims.userId, internalClaimsRole),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-internal-compliance", tenants.internal.tenantId, users.internalCompliance.userId, internalComplianceRole),
    actor,
  );

  const employerPolicySet = buildPermissionPolicySet("policy-employer-shell-v1", tenants.employer.tenantId, "employer_portal_shell");
  const internalPolicySet = buildPermissionPolicySet("policy-internal-shell-v1", tenants.internal.tenantId, "internal_portal_shell");

  await service.createPermissionPolicySet(employerPolicySet, actor);
  await service.createPermissionPolicySet(internalPolicySet, actor);

  for (const permission of employerPermissions) {
    await service.createPermissionGrant(
      buildPermissionGrant(tenants.employer.tenantId, employerPolicySet.id, employerAdminRole, permission),
      actor,
    );
  }

  for (const permission of internalClaimsPermissions) {
    await service.createPermissionGrant(
      buildPermissionGrant(tenants.internal.tenantId, internalPolicySet.id, internalClaimsRole, permission),
      actor,
    );
  }

  for (const permission of internalCompliancePermissions) {
    await service.createPermissionGrant(
      buildPermissionGrant(tenants.internal.tenantId, internalPolicySet.id, internalComplianceRole, permission),
      actor,
    );
  }

  const employerSessionPolicy: PortalSessionPolicy = {
    id: "session-policy-employer-demo",
    tenantId: tenants.employer.tenantId,
    mfaRequiredFlag: true,
    idleTimeoutMinutes: 30,
    allowedAuthMethodsJson: ["passwordless_link", "saml"],
    ...timestamps,
  };
  const internalSessionPolicy: PortalSessionPolicy = {
    id: "session-policy-internal-demo",
    tenantId: tenants.internal.tenantId,
    mfaRequiredFlag: true,
    idleTimeoutMinutes: 15,
    allowedAuthMethodsJson: ["oidc"],
    ...timestamps,
  };

  await service.upsertPortalSessionPolicy(employerSessionPolicy);
  await service.upsertPortalSessionPolicy(internalSessionPolicy);

  const employerOnboarding: OnboardingWorkspace = {
    id: "onboarding-employer-demo",
    tenantId: tenants.employer.tenantId,
    status: "user_provisioning",
    currentStep: "user_provisioning",
    policySyncStatus: "complete",
    userProvisioningStatus: "in_progress",
    integrationSetupStatus: "pending",
    ...timestamps,
  };

  await service.createOnboardingWorkspace(employerOnboarding);

  const employerInvites: ProvisioningInvite[] = [
    {
      id: "invite-employer-hr-lead",
      tenantId: tenants.employer.tenantId,
      email: "lead.hr@demo.elipslife.ch",
      targetRoleCode: "hr_manager",
      inviteStatus: "pending",
      expiresAt: "2026-04-25T08:00:00.000Z",
      createdAt: effectiveAt,
    },
    {
      id: "invite-employer-payroll",
      tenantId: tenants.employer.tenantId,
      email: "payroll@demo.elipslife.ch",
      targetRoleCode: "payroll_specialist",
      inviteStatus: "accepted",
      expiresAt: "2026-04-21T08:00:00.000Z",
      acceptedAt: "2026-04-19T10:30:00.000Z",
      createdAt: effectiveAt,
    },
  ];

  for (const invite of employerInvites) {
    await service.createProvisioningInvite(invite);
  }

  const employerPurposeRecord: AccessPurposeRecord = {
    id: "purpose-employer-medical-doc-review",
    tenantId: tenants.employer.tenantId,
    userId: users.employerAdmin.userId,
    employeeId: "employee-0001",
    purposeCode: "medical_document_review",
    lawfulBasis: "insurance_claim_handling",
    grantedAt: effectiveAt,
    source: "admin_onboarding_seed",
    referenceJson: { module: "document-service", note: "Seeded Phase 2A demo access purpose." },
    createdAt: effectiveAt,
  };

  await service.createAccessPurposeRecord(employerPurposeRecord);

  await service.createAccessPurposeRecord({
    id: "purpose-internal-audit-review",
    tenantId: tenants.internal.tenantId,
    userId: users.internalCompliance.userId,
    purposeCode: "access_audit_review",
    lawfulBasis: "legal_obligation",
    grantedAt: effectiveAt,
    source: "compliance_seed",
    referenceJson: { module: "identity-access-service", note: "Seeded compliance access purpose." },
    createdAt: effectiveAt,
  });

  const compliancePolicy: AuditAccessPolicy = {
    id: "audit-policy-compliance-user",
    tenantId: tenants.internal.tenantId,
    roleCode: internalComplianceRole,
    policySetId: internalPolicySet.id,
    canViewAuditFlag: true,
    canExportAuditFlag: true,
    sensitiveScopeJson: {
      resourceTypes: ["access_control", "platform_user", "audit_policy"],
      exportFormats: ["csv", "json"],
    },
    ...timestamps,
  };

  await service.upsertAuditAccessPolicy(compliancePolicy);

  return {
    service,
    tenants,
    users,
  };
};

let demoContextPromise: Promise<DemoIdentityAccessContext> | undefined;

export const getDemoIdentityAccessContext = async (): Promise<DemoIdentityAccessContext> => {
  demoContextPromise ??= createDemoIdentityAccessContext();
  return demoContextPromise;
};
