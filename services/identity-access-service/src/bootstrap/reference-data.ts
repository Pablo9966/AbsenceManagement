import type { IdentityAccessService, ActorContext } from "../application/identity-access.service.js";
import type {
  AccessPurposeRecord,
  AuditAccessPolicy,
  LocaleCode,
  OnboardingWorkspace,
  PermissionCheck,
  PermissionGrant,
  PermissionPolicySet,
  PlatformUser,
  PortalSessionPolicy,
  ProvisioningInvite,
  RoleAssignment,
  TenantMembership,
  UserEmployeeLink,
  UserProfile,
} from "../domain/types.js";

export const REFERENCE_EFFECTIVE_AT = "2026-04-18T08:00:00.000Z";

export const PHASE_2A_REFERENCE_ROLES = {
  employer: {
    tenantAdmin: "tenant_admin",
    hrManager: "hr_manager",
    payrollSpecialist: "payroll_specialist",
    employeeSelfService: "employee_self_service",
  },
  internal: {
    claimsHandler: "claims_handler",
    complianceUser: "compliance_user",
    internalAdmin: "internal_admin",
  },
} as const;

export const PHASE_2A_POLICY_CODES = {
  employerPortalShell: "employer_portal_shell",
  employeePortalShell: "employee_portal_shell",
  internalPortalShell: "internal_portal_shell",
} as const;

export const EMPLOYER_PORTAL_BOOTSTRAP_PERMISSIONS: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "ktg_case", action: "read" },
  { resourceType: "uvg_case", action: "read" },
  { resourceType: "uvg_case", action: "write" },
  { resourceType: "document", action: "read" },
  { resourceType: "payment_instruction", action: "read" },
  { resourceType: "premium", action: "read" },
  { resourceType: "premium", action: "write" },
  { resourceType: "task", action: "read" },
  { resourceType: "tenant_admin", action: "manage" },
];

export const INTERNAL_CLAIMS_BOOTSTRAP_PERMISSIONS: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "claims_intake_workspace", action: "read" },
  { resourceType: "ktg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "read_internal" },
  { resourceType: "uvg_case", action: "write_internal" },
  { resourceType: "benefit_calculation", action: "read" },
  { resourceType: "payment_run", action: "read_internal" },
  { resourceType: "reconciliation", action: "read_internal" },
];

export const INTERNAL_COMPLIANCE_BOOTSTRAP_PERMISSIONS: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read_internal" },
  { resourceType: "audit", action: "view" },
  { resourceType: "internal_admin", action: "manage" },
];

export const EMPLOYEE_PORTAL_BOOTSTRAP_PERMISSIONS: PermissionCheck[] = [
  { resourceType: "dashboard", action: "read" },
  { resourceType: "absence", action: "read" },
  { resourceType: "absence", action: "write" },
  { resourceType: "document", action: "read" },
  { resourceType: "document", action: "write" },
];

export interface ReferenceTenantContext {
  tenantId: string;
  tenantName: string;
  defaultLocale: LocaleCode;
  featureFlags: string[];
}

export interface Phase2AReferenceData {
  actor: ActorContext;
  tenants: {
    employer: ReferenceTenantContext;
    internal: ReferenceTenantContext;
  };
  users: {
    employerAdmin: { user: PlatformUser; profile: UserProfile };
    employeeSelfService: { user: PlatformUser; profile: UserProfile };
    internalClaims: { user: PlatformUser; profile: UserProfile };
    internalCompliance: { user: PlatformUser; profile: UserProfile };
    superUser: { user: PlatformUser; profile: UserProfile };
  };
}

const timestamps = {
  createdAt: REFERENCE_EFFECTIVE_AT,
  updatedAt: REFERENCE_EFFECTIVE_AT,
};

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
  joinedAt: REFERENCE_EFFECTIVE_AT,
  ...timestamps,
});

const buildRoleAssignment = (id: string, tenantId: string, userId: string, roleCode: string): RoleAssignment => ({
  id,
  tenantId,
  userId,
  roleCode,
  scopeType: "tenant",
  assignedAt: REFERENCE_EFFECTIVE_AT,
});

const buildPermissionPolicySet = (id: string, tenantId: string, policyCode: string): PermissionPolicySet => ({
  id,
  tenantId,
  policyCode,
  policyVersion: 1,
  activeFlag: true,
  description: `${policyCode} baseline policy`,
  createdAt: REFERENCE_EFFECTIVE_AT,
});

const buildPermissionGrant = (
  tenantId: string,
  policySetId: string,
  roleCode: string,
  permission: PermissionCheck,
): PermissionGrant => ({
  id: `${tenantId}:${roleCode}:${permission.resourceType}:${permission.action}`,
  tenantId,
  policySetId,
  roleCode,
  resourceType: permission.resourceType,
  action: permission.action,
  effect: "allow",
  conditionJson: {},
  createdAt: REFERENCE_EFFECTIVE_AT,
});

export const createPhase2AReferenceData = (): Phase2AReferenceData => ({
  actor: {
    actorId: "system-seed",
    actorRole: "system",
    correlationId: "phase-2a-reference-seed",
    effectiveAt: REFERENCE_EFFECTIVE_AT,
  },
  tenants: {
    employer: {
      tenantId: "tenant-employer-demo",
      tenantName: "elipsLife Demo Kunde",
      defaultLocale: "de-CH",
      featureFlags: ["dashboard-shell", "admin-shell", "phase-2a-reference-data"],
    },
    internal: {
      tenantId: "tenant-internal-demo",
      tenantName: "elipsLife Intern",
      defaultLocale: "de-CH",
      featureFlags: ["dashboard-shell", "compliance-shell", "phase-2a-reference-data"],
    },
  },
  users: {
    employerAdmin: buildPlatformUser("user-employer-admin", "hr.admin@demo.elipslife.ch", "de-CH", {
      firstName: "Hanna",
      lastName: "Admin",
      displayName: "Hanna Admin",
    }),
    employeeSelfService: buildPlatformUser("user-employee-self", "employee@demo.elipslife.ch", "de-CH", {
      firstName: "Anna",
      lastName: "Keller",
      displayName: "Anna Keller",
    }),
    internalClaims: buildPlatformUser("user-internal-claims", "claims.handler@elipslife.ch", "en-CH", {
      firstName: "Cleo",
      lastName: "Claims",
      displayName: "Cleo Claims",
    }),
    internalCompliance: buildPlatformUser("user-internal-compliance", "compliance.user@elipslife.ch", "de-CH", {
      firstName: "Nora",
      lastName: "Compliance",
      displayName: "Nora Compliance",
    }),
    superUser: buildPlatformUser("user-super-admin", "super.user@demo.elipslife.ch", "en-CH", {
      firstName: "Sofia",
      lastName: "Superuser",
      displayName: "Sofia Superuser",
    }),
  },
});

export const seedPhase2AReferenceData = async (service: IdentityAccessService): Promise<Phase2AReferenceData> => {
  const reference = createPhase2AReferenceData();
  const { actor, tenants, users } = reference;

  for (const seededUser of Object.values(users)) {
    await service.createPlatformUser(seededUser.user, seededUser.profile, actor);
  }

  await service.createTenantMembership(
    buildMembership("membership-employer-admin", tenants.employer.tenantId, users.employerAdmin.user.id),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-employee-self", tenants.employer.tenantId, users.employeeSelfService.user.id),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-internal-claims", tenants.internal.tenantId, users.internalClaims.user.id),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-internal-compliance", tenants.internal.tenantId, users.internalCompliance.user.id),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-super-employer", tenants.employer.tenantId, users.superUser.user.id),
    actor,
  );
  await service.createTenantMembership(
    buildMembership("membership-super-internal", tenants.internal.tenantId, users.superUser.user.id),
    actor,
  );

  await service.createRoleAssignment(
    buildRoleAssignment("role-employer-admin", tenants.employer.tenantId, users.employerAdmin.user.id, PHASE_2A_REFERENCE_ROLES.employer.tenantAdmin),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-employee-self", tenants.employer.tenantId, users.employeeSelfService.user.id, PHASE_2A_REFERENCE_ROLES.employer.employeeSelfService),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-internal-claims", tenants.internal.tenantId, users.internalClaims.user.id, PHASE_2A_REFERENCE_ROLES.internal.claimsHandler),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-internal-compliance", tenants.internal.tenantId, users.internalCompliance.user.id, PHASE_2A_REFERENCE_ROLES.internal.complianceUser),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-super-employer-admin", tenants.employer.tenantId, users.superUser.user.id, PHASE_2A_REFERENCE_ROLES.employer.tenantAdmin),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-super-employee-self", tenants.employer.tenantId, users.superUser.user.id, PHASE_2A_REFERENCE_ROLES.employer.employeeSelfService),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-super-internal-claims", tenants.internal.tenantId, users.superUser.user.id, PHASE_2A_REFERENCE_ROLES.internal.claimsHandler),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-super-internal-compliance", tenants.internal.tenantId, users.superUser.user.id, PHASE_2A_REFERENCE_ROLES.internal.complianceUser),
    actor,
  );
  await service.createRoleAssignment(
    buildRoleAssignment("role-super-internal-admin", tenants.internal.tenantId, users.superUser.user.id, PHASE_2A_REFERENCE_ROLES.internal.internalAdmin),
    actor,
  );

  const employerPolicySet = buildPermissionPolicySet(
    "policy-employer-shell-v1",
    tenants.employer.tenantId,
    PHASE_2A_POLICY_CODES.employerPortalShell,
  );
  const employeePolicySet = buildPermissionPolicySet(
    "policy-employee-shell-v1",
    tenants.employer.tenantId,
    PHASE_2A_POLICY_CODES.employeePortalShell,
  );
  const internalPolicySet = buildPermissionPolicySet(
    "policy-internal-shell-v1",
    tenants.internal.tenantId,
    PHASE_2A_POLICY_CODES.internalPortalShell,
  );

  await service.createPermissionPolicySet(employerPolicySet, actor);
  await service.createPermissionPolicySet(employeePolicySet, actor);
  await service.createPermissionPolicySet(internalPolicySet, actor);

  for (const permission of EMPLOYER_PORTAL_BOOTSTRAP_PERMISSIONS) {
    await service.createPermissionGrant(
      buildPermissionGrant(
        tenants.employer.tenantId,
        employerPolicySet.id,
        PHASE_2A_REFERENCE_ROLES.employer.tenantAdmin,
        permission,
      ),
      actor,
    );
  }

  for (const permission of INTERNAL_CLAIMS_BOOTSTRAP_PERMISSIONS) {
    await service.createPermissionGrant(
      buildPermissionGrant(
        tenants.internal.tenantId,
        internalPolicySet.id,
        PHASE_2A_REFERENCE_ROLES.internal.claimsHandler,
        permission,
      ),
      actor,
    );
  }

  for (const permission of EMPLOYEE_PORTAL_BOOTSTRAP_PERMISSIONS) {
    await service.createPermissionGrant(
      buildPermissionGrant(
        tenants.employer.tenantId,
        employeePolicySet.id,
        PHASE_2A_REFERENCE_ROLES.employer.employeeSelfService,
        permission,
      ),
      actor,
    );
  }

  for (const permission of INTERNAL_COMPLIANCE_BOOTSTRAP_PERMISSIONS) {
    await service.createPermissionGrant(
      buildPermissionGrant(
        tenants.internal.tenantId,
        internalPolicySet.id,
        PHASE_2A_REFERENCE_ROLES.internal.complianceUser,
        permission,
      ),
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

  const onboarding: OnboardingWorkspace = {
    id: "onboarding-employer-demo",
    tenantId: tenants.employer.tenantId,
    status: "user_provisioning",
    currentStep: "user_provisioning",
    policySyncStatus: "complete",
    userProvisioningStatus: "in_progress",
    integrationSetupStatus: "pending",
    ...timestamps,
  };
  await service.createOnboardingWorkspace(onboarding);

  const invites: ProvisioningInvite[] = [
    {
      id: "invite-employer-hr-lead",
      tenantId: tenants.employer.tenantId,
      email: "lead.hr@demo.elipslife.ch",
      targetRoleCode: PHASE_2A_REFERENCE_ROLES.employer.hrManager,
      inviteStatus: "pending",
      expiresAt: "2026-04-25T08:00:00.000Z",
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
    {
      id: "invite-employer-payroll",
      tenantId: tenants.employer.tenantId,
      email: "payroll@demo.elipslife.ch",
      targetRoleCode: PHASE_2A_REFERENCE_ROLES.employer.payrollSpecialist,
      inviteStatus: "accepted",
      expiresAt: "2026-04-21T08:00:00.000Z",
      acceptedAt: "2026-04-19T10:30:00.000Z",
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
  ];
  for (const invite of invites) {
    await service.createProvisioningInvite(invite);
  }

  const purposeRecords: AccessPurposeRecord[] = [
    {
      id: "purpose-employer-medical-doc-review",
      tenantId: tenants.employer.tenantId,
      userId: users.employerAdmin.user.id,
      employeeId: "employee-0001",
      purposeCode: "medical_document_review",
      lawfulBasis: "insurance_claim_handling",
      grantedAt: REFERENCE_EFFECTIVE_AT,
      source: "phase_2a_reference_seed",
      referenceJson: { module: "document-service", sensitivity: "medical_document" },
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
    {
      id: "purpose-employee-self-service-document",
      tenantId: tenants.employer.tenantId,
      userId: users.employeeSelfService.user.id,
      employeeId: "employee-0001",
      purposeCode: "employee_self_service_document",
      lawfulBasis: "consent",
      grantedAt: REFERENCE_EFFECTIVE_AT,
      source: "phase_2d_reference_seed",
      referenceJson: { module: "employee-portal", sensitivity: "medical_document" },
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
    {
      id: "purpose-internal-audit-review",
      tenantId: tenants.internal.tenantId,
      userId: users.internalCompliance.user.id,
      purposeCode: "access_audit_review",
      lawfulBasis: "legal_obligation",
      grantedAt: REFERENCE_EFFECTIVE_AT,
      source: "phase_2a_reference_seed",
      referenceJson: { module: "identity-access-service", sensitivity: "audit" },
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
    {
      id: "purpose-super-user-document-access",
      tenantId: tenants.employer.tenantId,
      userId: users.superUser.user.id,
      employeeId: "employee-0001",
      purposeCode: "local_testing_cross_portal_access",
      lawfulBasis: "consent",
      grantedAt: REFERENCE_EFFECTIVE_AT,
      source: "local_testing_reference_seed",
      referenceJson: { module: "local-launcher", sensitivity: "medical_document" },
      createdAt: REFERENCE_EFFECTIVE_AT,
    },
  ];
  for (const record of purposeRecords) {
    await service.createAccessPurposeRecord(record);
  }

  const employeeLink: UserEmployeeLink = {
    id: "user-employee-link-anna-self",
    tenantId: tenants.employer.tenantId,
    userId: users.employeeSelfService.user.id,
    employeeId: "employee-0001",
    linkType: "employee_self_service",
    linkedAt: REFERENCE_EFFECTIVE_AT,
  };
  await service.createUserEmployeeLink(employeeLink, actor);

  const superUserEmployeeLink: UserEmployeeLink = {
    id: "user-employee-link-super-admin",
    tenantId: tenants.employer.tenantId,
    userId: users.superUser.user.id,
    employeeId: "employee-0001",
    linkType: "employee_self_service",
    linkedAt: REFERENCE_EFFECTIVE_AT,
  };
  await service.createUserEmployeeLink(superUserEmployeeLink, actor);

  const compliancePolicy: AuditAccessPolicy = {
    id: "audit-policy-compliance-user",
    tenantId: tenants.internal.tenantId,
    roleCode: PHASE_2A_REFERENCE_ROLES.internal.complianceUser,
    policySetId: internalPolicySet.id,
    canViewAuditFlag: true,
    canExportAuditFlag: true,
    sensitiveScopeJson: {
      resourceTypes: ["access_control", "platform_user", "audit_policy"],
      exportFormats: ["csv", "json"],
      authorityModel: "permission_grant_and_audit_policy",
    },
    ...timestamps,
  };
  await service.upsertAuditAccessPolicy(compliancePolicy);

  return reference;
};
