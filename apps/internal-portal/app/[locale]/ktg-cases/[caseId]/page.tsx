import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalKtgCaseDetailPage(props: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <GuardedPortalPage
      routePattern="/[locale]/ktg-cases/[caseId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Case Detail"
      description="Placeholder internal KTG case workspace aligned with case, intake, and benefit modules."
      identifier={caseId}
    />
  );
}
