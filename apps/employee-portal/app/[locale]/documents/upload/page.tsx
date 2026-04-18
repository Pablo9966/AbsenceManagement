import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  resolveRouteAccess,
  SectionCard,
} from "../../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../../src/runtime.js";
import { uploadEmployeeCertificateAction } from "../../actions.js";

export default async function EmployeeUploadCertificatePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/documents/upload"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeUploadCertificate.title"] ?? "Upload Medical Certificate"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const absences = await runtime.workflowClient.listEmployeeAbsences({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
      page: 1,
      pageSize: 20,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeUploadCertificate.title"] ?? "Upload Medical Certificate"}
          description={runtime.messages["employee.uploadCertificate.description"] ?? "Upload your Arztzeugnis and link it to your absence if available."}
        />
        <SectionCard title={runtime.messages["page.employeeUploadCertificate.title"] ?? "Upload Medical Certificate"}>
          <form action={uploadEmployeeCertificateAction.bind(null, runtime.locale)} style={{ display: "grid", gap: "1rem", maxWidth: "42rem" }}>
            <label>
              <div>{runtime.messages["employee.field.absence"] ?? "Absence"}</div>
              <select name="absenceEpisodeId" defaultValue="">
                <option value="">{runtime.messages["employee.option.noLinkedAbsence"] ?? "No linked absence"}</option>
                {absences.data.map((absence) => (
                  <option key={absence.episodeId} value={absence.episodeId}>{absence.periodLabel}</option>
                ))}
              </select>
            </label>
            <label>
              <div>{runtime.messages["employee.field.file"] ?? "File"}</div>
              <input type="file" name="certificateFile" accept=".pdf,image/*" required />
            </label>
            <label>
              <div>{runtime.messages["employee.field.certificateStartDate"] ?? "Certificate start date"}</div>
              <input type="date" name="certificateStartDate" required />
            </label>
            <label>
              <div>{runtime.messages["employee.field.certificateEndDate"] ?? "Certificate end date"}</div>
              <input type="date" name="certificateEndDate" />
            </label>
            <label>
              <div>{runtime.messages["employee.field.incapacityPercentage"] ?? "Incapacity percentage"}</div>
              <input type="number" name="incapacityPercentage" min="1" max="100" defaultValue="100" required />
            </label>
            <label>
              <div>{runtime.messages["employee.field.providerName"] ?? "Issuing provider"}</div>
              <input type="text" name="issuingProviderName" />
            </label>
            <button type="submit" className="btn-primary">{runtime.messages["employee.cta.uploadCertificate"] ?? "Upload medical certificate"}</button>
          </form>
        </SectionCard>
        {absences.data.length === 0 ? (
          <EmptyState title={runtime.messages["employee.field.absence"] ?? "Absence"} message={runtime.messages["employee.uploadCertificate.noAbsenceHint"] ?? "You can still upload a certificate before an absence is linked."} />
        ) : null}
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.uploadCertificate.title"] ?? "Certificate upload unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.uploadCertificate.message"] ?? "Unable to load certificate upload."}
      />
    );
  }
}
