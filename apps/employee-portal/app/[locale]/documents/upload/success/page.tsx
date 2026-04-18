import { PageHeader, SectionCard } from "../../../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../../../src/runtime.js";

export default async function EmployeeUploadSuccessPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ documentId?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <PageHeader
        eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
        title={runtime.messages["page.employeeUploadCertificate.success"] ?? "Medical certificate uploaded"}
        description={runtime.messages["employee.success.document.description"] ?? "Your certificate is now visible in your self-service status view."}
      />
      <SectionCard title={runtime.messages["employee.success.document.section"] ?? "Upload complete"}>
        <p>{runtime.messages["employee.success.document.reference"] ?? "Document reference"}: {searchParams.documentId ?? "n/a"}</p>
      </SectionCard>
    </div>
  );
}
