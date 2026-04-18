import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../../src/runtime";

export default function InternalAdminPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/admin"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Admin"
      description="Placeholder internal administration surface for operational settings and platform controls."
    />
  );
}
