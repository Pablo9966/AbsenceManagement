import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalKtgCaseDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; caseId: string };
}) {
  const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale });

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
