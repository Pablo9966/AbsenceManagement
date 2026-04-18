import { GuardedPortalPage } from "@elipslife/frontend-platform";
import { getEmployerPortalRuntime } from "../../../src/runtime";

export default function EmployerPaymentsPage(props: {
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <GuardedPortalPage
      routePattern="/[locale]/payments"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Payments"
      description="Placeholder payment statement and reconciliation view for payroll and HR users."
    />
  );
}
