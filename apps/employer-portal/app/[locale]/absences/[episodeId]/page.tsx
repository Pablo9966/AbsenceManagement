import { PortalPage } from "../../../../src/portal-page";

export default function EmployerAbsenceDetailPage(props: {
  params: { episodeId: string };
}) {
  return (
    <PortalPage
      eyebrow="Employer Portal"
      title="Absence Detail"
      description="Placeholder detail surface for one absence episode, linked documents, and case suggestions."
      identifier={props.params.episodeId}
    />
  );
}
