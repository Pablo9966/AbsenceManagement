"use server";

import { revalidatePath } from "next/cache";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";

const getRuntimeAndCase = async (formData: FormData) => {
  const locale = String(formData.get("locale") ?? "de-CH");
  const caseId = String(formData.get("caseId") ?? "");
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  return { runtime, caseId };
};

export const updateUvgStatus = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.updateInternalUvgCaseStatus({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    caseStatus: String(formData.get("caseStatus") ?? "under_review"),
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};

export const recordUvgInjury = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.recordInternalUvgInjury({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    injuryType: String(formData.get("injuryType") ?? ""),
    bodyPart: String(formData.get("bodyPart") ?? ""),
    severity: String(formData.get("severity") ?? ""),
    medicalTreatmentFlag: formData.get("medicalTreatmentFlag") === "on",
    hospitalizedFlag: formData.get("hospitalizedFlag") === "on",
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};

export const upsertUvgCoordination = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.upsertInternalUvgCoordination({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    coordinationType: String(formData.get("coordinationType") ?? "ktg_overlap"),
    relatedKtgCaseId: String(formData.get("relatedKtgCaseId") ?? "") || undefined,
    overlapStart: String(formData.get("overlapStart") ?? "") || undefined,
    overlapEnd: String(formData.get("overlapEnd") ?? "") || undefined,
    coordinationStatus: String(formData.get("coordinationStatus") ?? "open"),
    benefitOverlapFlag: formData.get("benefitOverlapFlag") === "on",
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};

export const recordUvgCircumstance = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.recordInternalUvgCircumstance({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    causeCategory: String(formData.get("causeCategory") ?? ""),
    activityContext: String(formData.get("activityContext") ?? ""),
    thirdPartyInvolvedFlag: formData.get("thirdPartyInvolvedFlag") === "on",
    vehicleInvolvedFlag: formData.get("vehicleInvolvedFlag") === "on",
    narrative: String(formData.get("narrative") ?? ""),
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};

export const linkUvgDocument = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.linkInternalUvgDocument({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    documentId: String(formData.get("documentId") ?? ""),
    documentRole: String(formData.get("documentRole") ?? "medical_certificate"),
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};

export const upsertUvgDecision = async (formData: FormData) => {
  const { runtime, caseId } = await getRuntimeAndCase(formData);
  await runtime.workflowClient.upsertInternalUvgDecision({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    caseId,
    userId: runtime.userContext.userId,
    decisionStatus: String(formData.get("decisionStatus") ?? "pending"),
    decisionReason: String(formData.get("decisionReason") ?? ""),
    effectiveFrom: String(formData.get("effectiveFrom") ?? ""),
    effectiveTo: String(formData.get("effectiveTo") ?? "") || undefined,
  });
  revalidatePath(`/${runtime.locale}/uvg-cases/${caseId}`);
};
