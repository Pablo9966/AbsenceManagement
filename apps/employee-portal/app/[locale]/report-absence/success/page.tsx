import { PageHeader, SectionCard } from "../../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../../src/runtime.js";

export default async function ReportAbsenceSuccessPage(props: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ episodeId?: string }>;
}) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <PageHeader
        eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
        title={runtime.messages["page.employeeReportAbsence.success"] ?? "Absence submitted"}
        description={runtime.messages["employee.success.absence.description"] ?? "Your absence report has been created and is now visible in your status view."}
      />
      <SectionCard title={runtime.messages["employee.success.absence.section"] ?? "Submission complete"}>
        <p>{runtime.messages["employee.success.absence.reference"] ?? "Absence reference"}: {searchParams.episodeId ?? "n/a"}</p>
      </SectionCard>
    </div>
  );
}
