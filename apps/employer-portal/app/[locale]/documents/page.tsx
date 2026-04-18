import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerDocumentsPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);

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
