"use server";

import { redirect } from "next/navigation";
import { getEmployeePortalRuntime } from "../../src/runtime.js";

const ensureString = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Missing required form field.");
  }
  return value.trim();
};

export const submitEmployeeAbsenceAction = async (routeLocale: string, formData: FormData) => {
  const runtime = await getEmployeePortalRuntime(routeLocale);
  const result = await runtime.workflowClient.submitEmployeeAbsence({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    employeeId: runtime.employeeLink.employeeId,
    userId: runtime.userContext.userId,
    absenceType: ensureString(formData.get("absenceType")),
    startDate: ensureString(formData.get("startDate")),
    expectedEndDate: typeof formData.get("expectedEndDate") === "string" && formData.get("expectedEndDate") !== ""
      ? String(formData.get("expectedEndDate"))
      : undefined,
    comment: typeof formData.get("comment") === "string" && formData.get("comment") !== ""
      ? String(formData.get("comment"))
      : undefined,
  });
  redirect(`/${runtime.locale}/report-absence/success?episodeId=${result.data.episodeId}`);
};

export const uploadEmployeeCertificateAction = async (routeLocale: string, formData: FormData) => {
  const runtime = await getEmployeePortalRuntime(routeLocale);
  const file = formData.get("certificateFile");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Certificate file is required.");
  }

  const absenceEpisodeId = typeof formData.get("absenceEpisodeId") === "string" && formData.get("absenceEpisodeId") !== ""
    ? String(formData.get("absenceEpisodeId"))
    : undefined;

  const result = await runtime.workflowClient.uploadEmployeeCertificate({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    employeeId: runtime.employeeLink.employeeId,
    userId: runtime.userContext.userId,
    documentType: "medical_certificate",
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSizeBytes: file.size,
    absenceEpisodeId,
    certificateStartDate: ensureString(formData.get("certificateStartDate")),
    certificateEndDate: typeof formData.get("certificateEndDate") === "string" && formData.get("certificateEndDate") !== ""
      ? String(formData.get("certificateEndDate"))
      : undefined,
    incapacityPercentage: Number.parseInt(ensureString(formData.get("incapacityPercentage")), 10),
    issuingProviderName: typeof formData.get("issuingProviderName") === "string" && formData.get("issuingProviderName") !== ""
      ? String(formData.get("issuingProviderName"))
      : undefined,
  });
  redirect(`/${runtime.locale}/documents/upload/success?documentId=${result.data.documentId}`);
};

export const confirmReturnToWorkAction = async (routeLocale: string, formData: FormData) => {
  const runtime = await getEmployeePortalRuntime(routeLocale);
  await runtime.workflowClient.confirmEmployeeReturnToWork({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    employeeId: runtime.employeeLink.employeeId,
    userId: runtime.userContext.userId,
    episodeId: ensureString(formData.get("episodeId")),
    actualReturnDate: ensureString(formData.get("actualReturnDate")),
  });
  redirect(`/${runtime.locale}/status`);
};
