import { cookies } from "next/headers";
import {
  DEFAULT_LOCAL_TEST_LOCALE,
  LOCAL_TEST_LOCALE_COOKIE,
  LOCAL_TEST_PERSONA_COOKIE,
  LOCAL_TEST_PERSONAS,
  getLocalPortalBaseUrl,
  resolveLocalTestLocale,
  resolveLocalTestPersona,
  type LocalTestPersonaId,
  type LocalTestPortalId,
} from "../../../packages/frontend-platform/src/local-testing.js";

const buildLaunchHref = (
  persona: LocalTestPersonaId,
  portal: LocalTestPortalId,
  locale: string,
  path: string,
): string => `/dev/launch?persona=${persona}&portal=${portal}&locale=${locale}&path=${encodeURIComponent(path)}`;

const portalLinkSets: Record<LocalTestPersonaId, Array<{
  label: string;
  description: string;
  portal: LocalTestPortalId;
  path: string;
}>> = {
  employee: [
    { label: "Employee dashboard", description: "Open the employee self-service dashboard.", portal: "employee", path: "/dashboard" },
    { label: "Report absence", description: "Jump straight into sickness reporting.", portal: "employee", path: "/report-absence" },
    { label: "My status", description: "Review own absences and certificates.", portal: "employee", path: "/status" },
  ],
  employer: [
    { label: "Employer dashboard", description: "Open the employer operational dashboard.", portal: "employer", path: "/dashboard" },
    { label: "Absence inbox", description: "Go directly to employer absence operations.", portal: "employer", path: "/absences" },
    { label: "Payments", description: "Open employer payment visibility.", portal: "employer", path: "/payments" },
    { label: "Admin", description: "Open employer admin continuity routes.", portal: "employer", path: "/admin" },
  ],
  internal: [
    { label: "Internal dashboard", description: "Open internal workload overview.", portal: "internal", path: "/dashboard" },
    { label: "Intake queue", description: "Go to intake processing.", portal: "internal", path: "/intake" },
    { label: "Payment runs", description: "Open payment-run tracking.", portal: "internal", path: "/payment-runs" },
    { label: "Month end", description: "Open month-end reconciliation.", portal: "internal", path: "/month-end" },
  ],
  admin: [
    { label: "Employer dashboard", description: "Test employer workflows as super-user.", portal: "employer", path: "/dashboard" },
    { label: "Employer admin", description: "Open employer admin flows.", portal: "employer", path: "/admin" },
    { label: "Internal dashboard", description: "Test internal claims and payment views.", portal: "internal", path: "/dashboard" },
    { label: "Compliance", description: "Open internal compliance visibility.", portal: "internal", path: "/compliance" },
    { label: "Payment runs", description: "Open internal payment operations views.", portal: "internal", path: "/payment-runs" },
    { label: "Employee dashboard", description: "Open employee self-service as the admin persona.", portal: "employee", path: "/dashboard" },
    { label: "Report absence", description: "Test employee self-reporting with the admin persona.", portal: "employee", path: "/report-absence" },
  ],
};

export default async function LocalLauncherPage(props: {
  searchParams: Promise<{ unsupported?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  const locale = resolveLocalTestLocale(cookieStore.get(LOCAL_TEST_LOCALE_COOKIE)?.value ?? DEFAULT_LOCAL_TEST_LOCALE);

  return (
    <main style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", padding: "2.5rem", background: "#f4f1ea", minHeight: "100vh", color: "#1b2430" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", display: "grid", gap: "1.5rem" }}>
        <section style={{ background: "#fffaf0", border: "1px solid #d6cbb2", borderRadius: "24px", padding: "2rem" }}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.75rem", margin: 0, color: "#8b6f3d" }}>Local Testing Launcher</p>
          <h1 style={{ margin: "0.5rem 0 0.75rem", fontSize: "2.2rem" }}>Choose a persona and jump into the right portal</h1>
          <p style={{ margin: 0, maxWidth: "64rem", lineHeight: 1.6 }}>
            This page is the default localhost entry for local browser testing. It sets a local test persona cookie and redirects you into the
            employer, internal, or employee portal without editing environment variables.
          </p>
          <div style={{ marginTop: "1rem", display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Current persona: <strong>{selectedPersona?.label ?? "none selected"}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Locale: <strong>{locale}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Employer: <strong>{getLocalPortalBaseUrl("employer")}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Internal: <strong>{getLocalPortalBaseUrl("internal")}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Employee: <strong>{getLocalPortalBaseUrl("employee")}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Identity API: <strong>{process.env.IDENTITY_ACCESS_SERVICE_BASE_URL ?? "http://127.0.0.1:4010"}</strong>
            </span>
            <span style={{ padding: "0.5rem 0.75rem", borderRadius: "999px", background: "#efe7d7" }}>
              Workflow API: <strong>{process.env.PORTAL_WORKFLOW_SERVICE_BASE_URL ?? "http://127.0.0.1:4020"}</strong>
            </span>
          </div>
          {searchParams.unsupported ? (
            <p style={{ marginTop: "1rem", color: "#8f2d2d" }}>
              The selected persona does not support the <strong>{searchParams.unsupported}</strong> portal. Choose a valid test persona below.
            </p>
          ) : null}
          {searchParams.error ? (
            <p style={{ marginTop: "1rem", color: "#8f2d2d" }}>{searchParams.error}</p>
          ) : null}
        </section>

        <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
          {LOCAL_TEST_PERSONAS.map((persona) => (
            <article key={persona.id} style={{ background: "white", border: selectedPersona?.id === persona.id ? "2px solid #8b6f3d" : "1px solid #d7dbe3", borderRadius: "20px", padding: "1.5rem" }}>
              <h2 style={{ marginTop: 0 }}>{persona.label}</h2>
              <p style={{ lineHeight: 1.6 }}>{persona.description}</p>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {portalLinkSets[persona.id].map((item) => (
                  <a
                    key={`${persona.id}-${item.portal}-${item.path}`}
                    href={buildLaunchHref(persona.id, item.portal, locale, `/${locale}${item.path}`)}
                    style={{ display: "block", padding: "0.85rem 1rem", borderRadius: "14px", background: "#1b2430", color: "white", textDecoration: "none" }}
                  >
                    <strong>{item.label}</strong>
                    <span style={{ display: "block", marginTop: "0.35rem", color: "#cfd8e6" }}>{item.description}</span>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
