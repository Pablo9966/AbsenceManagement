import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../src/runtime";

export default function InternalDashboardPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/dashboard"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Dashboard"
      description="Phase 2A.2 shell placeholder for claims, compliance, and operations workflows."
    />
  );
}
