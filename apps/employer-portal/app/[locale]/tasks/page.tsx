import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerTasksPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/tasks"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Tasks"
      description="Placeholder task and deadline dashboard for absence, case, and onboarding actions."
    />
  );
}
