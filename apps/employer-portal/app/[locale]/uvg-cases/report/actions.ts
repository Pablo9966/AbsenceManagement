"use server";

import { redirect } from "next/navigation";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export const submitUvgAccidentReport = async (formData: FormData) => {
  const locale = String(formData.get("locale") ?? "de-CH");
  const runtime = await getEmployerPortalRuntime(locale);
  const response = await runtime.workflowClient.createEmployerUvgAccidentReport({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    userId: runtime.userContext.userId,
    employeeId: String(formData.get("employeeId") ?? ""),
    policyId: String(formData.get("policyId") ?? "policy-uvg-001"),
    uvgCaseType: String(formData.get("uvgCaseType") ?? "bu"),
    accidentDate: String(formData.get("accidentDate") ?? ""),
    accidentTime: String(formData.get("accidentTime") ?? "") || undefined,
    accidentPlace: String(formData.get("accidentPlace") ?? ""),
    occupationalContext: String(formData.get("occupationalContext") ?? "occupational"),
    accidentDescription: String(formData.get("accidentDescription") ?? ""),
    witnessDetails: String(formData.get("witnessDetails") ?? "") || undefined,
    policeInvolvedFlag: formData.get("policeInvolvedFlag") === "on",
    ktgCaseId: String(formData.get("ktgCaseId") ?? "") || undefined,
  });

  redirect(`/${runtime.locale}/uvg-cases/${response.data.caseId}`);
};
