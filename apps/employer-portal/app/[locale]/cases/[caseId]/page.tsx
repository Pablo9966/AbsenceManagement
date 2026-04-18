import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../../../src/runtime";

export default function EmployerCaseDetailPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH"; caseId: string };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/cases/[caseId]"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Case Detail"
      description="Placeholder detail surface for employer-visible KTG case data, deadlines, and notes."
      identifier={props.params.caseId}
    />
  );
}
