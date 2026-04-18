import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export default async function EmployerAbsenceDetailPage(props: {
  params: Promise<{ locale: string; episodeId: string }>;
}) {
  const { locale, episodeId } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/absences/[episodeId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Absence Detail"
      description="Placeholder detail surface for one absence episode, linked documents, and case suggestions."
      identifier={episodeId}
    />
  );
}
