import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../src/runtime";

export default function EmployerDashboardPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

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
