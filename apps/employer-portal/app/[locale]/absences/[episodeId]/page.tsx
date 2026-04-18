import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../../../src/runtime";

export default function EmployerAbsenceDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; episodeId: string };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/absences/[episodeId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Absence Detail"
      description="Placeholder detail surface for one absence episode, linked documents, and case suggestions."
      identifier={props.params.episodeId}
    />
  );
}
