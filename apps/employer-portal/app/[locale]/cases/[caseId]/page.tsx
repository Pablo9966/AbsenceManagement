import { PortalPage } from "../../../../src/portal-page";

export default function EmployerCaseDetailPage(props: {
  params: { caseId: string };
}) {
  return (
    <PortalPage
      eyebrow="Employer Portal"
      title="Case Detail"
      description="Placeholder detail surface for employer-visible KTG case data, deadlines, and notes."
      identifier={props.params.caseId}
    />
  );
}
