import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerAbsencesPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/absences"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Absences"
      description="Placeholder inbox for recorded absences, calendar views, and team-level monitoring."
    />
  );
}
