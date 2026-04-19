"use server";

import { revalidatePath } from "next/cache";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";

export const generateUvgAccidentReport = async (formData: FormData) => {
  const locale = String(formData.get("locale") ?? "de-CH");
  const caseId = String(formData.get("caseId") ?? "");
  const runtime = await getEmployerPortalRuntime(locale);
  await runtime.workflowClient.generateEmployerUvgAccidentReportArtifact({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};
