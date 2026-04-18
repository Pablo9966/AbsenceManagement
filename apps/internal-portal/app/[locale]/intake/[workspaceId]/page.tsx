import { PortalPage } from "../../../../src/portal-page";

export default function InternalIntakeDetailPage(props: {
  params: { workspaceId: string };
}) {
  return (
    <PortalPage
      eyebrow="Internal Portal"
      title="Intake Workspace"
      description="Placeholder workspace detail for intake checklist, evidence links, and queue actions."
      identifier={props.params.workspaceId}
    />
  );
}
