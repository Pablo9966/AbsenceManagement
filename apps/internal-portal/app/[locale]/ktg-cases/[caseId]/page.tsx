import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../../../src/runtime";

export default function InternalKtgCaseDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; caseId: string };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/ktg-cases/[caseId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Case Detail"
      description="Placeholder internal KTG case workspace aligned with case, intake, and benefit modules."
      identifier={props.params.caseId}
    />
  );
}
