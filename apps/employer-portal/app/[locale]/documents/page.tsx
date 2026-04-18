import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../../src/runtime";

export default function EmployerDocumentsPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/documents"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Documents"
      description="Placeholder document inbox for certificates, expiry alerts, and upload review workflows."
    />
  );
}
