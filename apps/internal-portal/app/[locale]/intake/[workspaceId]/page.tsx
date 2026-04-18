import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../../../src/runtime";

export default function InternalIntakeDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; workspaceId: string };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/intake/[workspaceId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Intake Workspace"
      description="Placeholder workspace detail for intake checklist, evidence links, and queue actions."
      identifier={props.params.workspaceId}
    />
  );
}
