import { PortalPage } from "../../../../src/portal-page";

export default function InternalKtgCaseDetailPage(props: {
  params: { caseId: string };
}) {
  return (
    <PortalPage
      eyebrow="Internal Portal"
      title="Case Detail"
      description="Placeholder internal KTG case workspace aligned with case, intake, and benefit modules."
      identifier={props.params.caseId}
    />
  );
}
