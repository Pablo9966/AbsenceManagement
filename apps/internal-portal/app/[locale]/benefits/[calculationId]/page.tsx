import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

export default async function InternalBenefitDetailPage(props: {
  params: Promise<{ locale: string; calculationId: string }>;
}) {
  const { locale, calculationId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <GuardedPortalPage
      routePattern="/[locale]/benefits/[calculationId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Internal Portal"
      title="Calculation Detail"
      description="Placeholder calculation detail for salary basis, entitlement periods, and Taggelddispositiv context."
      identifier={calculationId}
    />
  );
}
