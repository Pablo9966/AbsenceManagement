export type LocalTestPersonaId = "employee" | "employer" | "internal" | "admin";
export type LocalTestPortalId = "employer" | "internal" | "employee";

export interface LocalTestPortalSessionConfig {
  signInEmail: string;
  tenantId: string;
}

export interface LocalTestPersonaDefinition {
  id: LocalTestPersonaId;
  label: string;
  description: string;
  portalSessions: Partial<Record<LocalTestPortalId, LocalTestPortalSessionConfig>>;
}

export const LOCAL_TEST_PERSONA_COOKIE = "elipslife_local_persona";
export const LOCAL_TEST_LOCALE_COOKIE = "elipslife_local_locale";

export const LOCAL_TEST_PORTAL_BASE_URLS: Record<LocalTestPortalId, string> = {
  employer: process.env.LOCAL_EMPLOYER_PORTAL_URL ?? "http://127.0.0.1:3000",
  internal: process.env.LOCAL_INTERNAL_PORTAL_URL ?? "http://127.0.0.1:3001",
  employee: process.env.LOCAL_EMPLOYEE_PORTAL_URL ?? "http://127.0.0.1:3002",
};

export const LOCAL_TEST_PERSONAS: LocalTestPersonaDefinition[] = [
  {
    id: "employee",
    label: "Employee Self-Service",
    description: "Employee browser flow for reporting sickness, uploading certificates, viewing status, and confirming return to work.",
    portalSessions: {
      employee: {
        signInEmail: "employee@demo.elipslife.ch",
        tenantId: "tenant-employer-demo",
      },
    },
  },
  {
    id: "employer",
    label: "Employer HR / Payroll",
    description: "Employer-facing HR and payroll persona for absences, KTG cases, documents, payments, and admin continuity.",
    portalSessions: {
      employer: {
        signInEmail: "hr.admin@demo.elipslife.ch",
        tenantId: "tenant-employer-demo",
      },
    },
  },
  {
    id: "internal",
    label: "Internal Claims / Payments",
    description: "Internal operations persona for intake, case review, benefits, payment runs, and month-end workflows.",
    portalSessions: {
      internal: {
        signInEmail: "claims.handler@elipslife.ch",
        tenantId: "tenant-internal-demo",
      },
    },
  },
  {
    id: "admin",
    label: "Admin / Super User",
    description: "Local-only convenience persona with access across employer, internal, and employee flows.",
    portalSessions: {
      employer: {
        signInEmail: "super.user@demo.elipslife.ch",
        tenantId: "tenant-employer-demo",
      },
      internal: {
        signInEmail: "super.user@demo.elipslife.ch",
        tenantId: "tenant-internal-demo",
      },
      employee: {
        signInEmail: "super.user@demo.elipslife.ch",
        tenantId: "tenant-employer-demo",
      },
    },
  },
];

export const DEFAULT_LOCAL_TEST_LOCALE = "de-CH";

export const resolveLocalTestPersona = (value?: string | null): LocalTestPersonaDefinition | undefined =>
  LOCAL_TEST_PERSONAS.find((persona) => persona.id === value);

export const resolveLocalTestLocale = (value?: string | null): string =>
  value === "en-CH" || value === "fr-CH" || value === "it-CH" || value === "de-CH"
    ? value
    : DEFAULT_LOCAL_TEST_LOCALE;

export const getLocalPortalBaseUrl = (portalId: LocalTestPortalId): string =>
  LOCAL_TEST_PORTAL_BASE_URLS[portalId];
