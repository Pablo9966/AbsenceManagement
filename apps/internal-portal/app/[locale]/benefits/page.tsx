import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../../src/runtime";

export default function InternalBenefitsPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/benefits"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Benefit Calculations"
      description="Placeholder benefit-engine landing page for calculation review and payment approval prep."
    />
  );
}
