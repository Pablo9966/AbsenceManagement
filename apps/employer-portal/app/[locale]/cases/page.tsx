import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../../src/runtime";

export default function EmployerCasesPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/cases"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="KTG Cases"
      description="Placeholder case inbox for employer-facing KTG registration, status, and communication flows."
    />
  );
}
