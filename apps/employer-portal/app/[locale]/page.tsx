import { GuardedPortalPage } from "../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../src/runtime.js";

export default async function EmployerDashboardPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/dashboard"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Dashboard"
      description="Phase 2A.2 shell placeholder for HR and payroll landing workflows."
    />
  );
}
