import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function EmployerDocumentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);
  const documentAccess = await runtime.client.evaluateAccess(runtime.sessionToken, runtime.tenantContext.tenantId, {
    resourceType: "document",
    action: "read",
    employeeId: "employee-0001",
    purposeCode: "medical_document_review",
    requiredLawfulBasis: ["insurance_claim_handling"],
  });

  return (
    <GuardedPortalPage
      routePattern="/[locale]/documents"
      rules={runtime.routeRules}
      userContext={runtime.userContext}
      messages={runtime.messages}
      eyebrow="Employer Portal"
      title="Documents"
      description={`Backend-gated document inbox placeholder. Access mode: ${documentAccess.enforcementMode}. Allowed: ${documentAccess.allowed ? "yes" : "no"}.`}
    />
  );
}
