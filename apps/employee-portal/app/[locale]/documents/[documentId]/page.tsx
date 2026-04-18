import {
  DetailList,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
} from "../../../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../../../src/runtime.js";

export default async function EmployeeDocumentDetailPage(props: {
  params: Promise<{ locale: string; documentId: string }>;
}) {
  const { locale, documentId } = await props.params;
  try {
    const runtime = await getEmployeePortalRuntime(locale);
    const access = resolveRouteAccess(
      runtime.routeRules.find((rule) => rule.routePattern === "/[locale]/documents/[documentId]"),
      runtime.userContext,
    );
    if (access === "permission_denied") {
      return <PermissionDeniedState title={runtime.messages["common.permissionDenied"] ?? "Access denied"} />;
    }
    if (access === "redirect_dashboard") {
      return <RedirectDashboardState title={runtime.messages["page.employeeDocumentDetail.title"] ?? "Document Detail"} dashboardHref={`/${runtime.locale}/dashboard`} />;
    }

    const detail = await runtime.workflowClient.getEmployeeDocumentDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      employeeId: runtime.employeeLink.employeeId,
      documentId,
    });

    return (
      <div className="surface-card">
        <PageHeader
          eyebrow={runtime.messages["shell.employeePortal"] ?? "Employee Portal"}
          title={runtime.messages["page.employeeDocumentDetail.title"] ?? "Document Detail"}
          description={detail.data.title}
        />
        <SectionCard title={runtime.messages["page.employeeDocumentDetail.title"] ?? "Document Detail"}>
          <DetailList items={[
            { label: runtime.messages["employee.field.documentType"] ?? "Document type", value: detail.data.documentType },
            { label: runtime.messages["employee.field.status"] ?? "Status", value: detail.data.status },
            { label: runtime.messages["employee.field.uploadedAt"] ?? "Uploaded", value: detail.data.uploadedAt },
            { label: runtime.messages["employee.field.linkedEpisode"] ?? "Linked absence", value: detail.data.linkedEpisodeId ?? "—" },
            { label: runtime.messages["employee.field.coverage"] ?? "Coverage", value: detail.data.coverageLabel ?? "—" },
          ]} />
        </SectionCard>
      </div>
    );
  } catch (error) {
    const runtime = await getEmployeePortalRuntime(locale);
    return (
      <ErrorState
        title={runtime.messages["employee.error.documentDetail.title"] ?? "Document detail unavailable"}
        message={error instanceof Error ? error.message : runtime.messages["employee.error.documentDetail.message"] ?? "Unable to load document detail."}
      />
    );
  }
}
