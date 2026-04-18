import { PortalPage } from "../../../../src/portal-page";

export default function InternalBenefitDetailPage(props: {
  params: { calculationId: string };
}) {
  return (
    <PortalPage
      eyebrow="Internal Portal"
      title="Calculation Detail"
      description="Placeholder calculation detail for salary basis, entitlement periods, and Taggelddispositiv context."
      identifier={props.params.calculationId}
    />
  );
}
