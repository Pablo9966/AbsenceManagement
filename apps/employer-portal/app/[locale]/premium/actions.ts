"use server";

import { revalidatePath } from "next/cache";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";

const runtimeFrom = async (formData: FormData) => {
  const locale = String(formData.get("locale") ?? "de-CH");
  return getEmployerPortalRuntime(locale);
};

export const submitSalaryMass = async (formData: FormData) => {
  const runtime = await runtimeFrom(formData);
  await runtime.workflowClient.submitEmployerSalaryMassReport({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    userId: runtime.userContext.userId,
    annualSalaryMassChf: Number(formData.get("annualSalaryMassChf") ?? 0),
    insuredSalaryMassChf: Number(formData.get("insuredSalaryMassChf") ?? 0),
    employeeCount: Number(formData.get("employeeCount") ?? 0),
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  revalidatePath(`/${runtime.locale}/premium`);
};

export const calculateAdjustment = async (formData: FormData) => {
  const runtime = await runtimeFrom(formData);
  await runtime.workflowClient.calculateEmployerPremiumAdjustment({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    userId: runtime.userContext.userId,
    reportId: String(formData.get("reportId") ?? ""),
    priorPremiumChf: Number(formData.get("priorPremiumChf") ?? 0),
    premiumRate: Number(formData.get("premiumRate") ?? 0),
    claimsPaidChf: Number(formData.get("claimsPaidChf") ?? 0),
    claimsReservedChf: Number(formData.get("claimsReservedChf") ?? 0),
  });
  revalidatePath(`/${runtime.locale}/premium`);
};

export const generateSettlement = async (formData: FormData) => {
  const runtime = await runtimeFrom(formData);
  await runtime.workflowClient.generateEmployerPremiumSettlement({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    userId: runtime.userContext.userId,
    calculationId: String(formData.get("calculationId") ?? ""),
  });
  revalidatePath(`/${runtime.locale}/premium`);
};

export const createInstallmentPlan = async (formData: FormData) => {
  const runtime = await runtimeFrom(formData);
  await runtime.workflowClient.createEmployerPremiumInstallmentPlan({
    tenantId: runtime.tenantContext.tenantId,
    locale: runtime.locale,
    userId: runtime.userContext.userId,
    periodId: String(formData.get("periodId") ?? ""),
    totalAmountChf: Number(formData.get("totalAmountChf") ?? 0),
    installmentCount: Number(formData.get("installmentCount") ?? 1),
    startDate: String(formData.get("startDate") ?? ""),
  });
  revalidatePath(`/${runtime.locale}/premium`);
};
