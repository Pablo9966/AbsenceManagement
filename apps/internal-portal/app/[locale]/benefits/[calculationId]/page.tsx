import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getInternalPortalRuntime } from "../../../../src/runtime";

export default function InternalBenefitDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; calculationId: string };
}) {
  const runtime = getInternalPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/benefits/[calculationId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Calculation Detail"
      description="Placeholder calculation detail for salary basis, entitlement periods, and Taggelddispositiv context."
      identifier={props.params.calculationId}
    />
  );
}
