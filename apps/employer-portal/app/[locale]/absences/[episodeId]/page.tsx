import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export default async function EmployerAbsenceDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; episodeId: string };
}) {
  const runtime = await getEmployerPortalRuntime(props.params.locale);

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
