import {
  DetailList,
  ErrorState,
  PageHeader,
  PermissionDeniedState,
  RedirectDashboardState,
  SectionCard,
  resolveRouteAccess,
  type RouteAccessRule,
} from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";
import { linkUvgDocument, recordUvgCircumstance, recordUvgInjury, updateUvgStatus, upsertUvgCoordination, upsertUvgDecision } from "./actions.js";

export default async function InternalUvgCaseDetailPage(props: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });
  const t = (key: string): string => runtime.messages[key] ?? key;
  const access = resolveRouteAccess(
    runtime.routeRules.find((rule: RouteAccessRule) => rule.routePattern === "/[locale]/uvg-cases/[caseId]"),
    runtime.userContext,
  );

  if (access === "permission_denied") {
    return <PermissionDeniedState title={t("common.permissionDenied")} message={t("uvg.access.internalDetail")} />;
  }
  if (access === "redirect_dashboard") {
    return <RedirectDashboardState title={t("page.uvgCaseDetail.title")} dashboardHref={`/${runtime.locale}/dashboard`} />;
  }

  try {
    const response = await runtime.workflowClient.getInternalUvgCaseDetail({
      tenantId: runtime.tenantContext.tenantId,
      locale: runtime.locale,
      caseId,
    });
    const hiddenInputs = (
      <>
        <input type="hidden" name="locale" value={runtime.locale} />
        <input type="hidden" name="caseId" value={response.data.caseId} />
      </>
    );

    return (
      <div className="surface-card">
        <PageHeader eyebrow={t("shell.internalPortal")} title={t("page.uvgCaseDetail.title")} description={response.data.incidentSummary} />
        <SectionCard title={t("uvg.field.caseNumber")}>
          <DetailList items={[
            { label: t("uvg.field.caseNumber"), value: response.data.caseNumber },
            { label: t("uvg.field.employee"), value: response.data.employeeName },
            { label: t("uvg.field.type"), value: response.data.uvgCaseType.toUpperCase() },
            { label: t("uvg.field.status"), value: response.data.caseStatus },
            { label: t("uvg.field.accidentDate"), value: response.data.accidentDate },
            { label: t("uvg.field.coordination"), value: response.data.coordinationStatus },
            { label: t("uvg.field.ktgCase"), value: response.data.linkedKtgCaseId ?? "-" },
          ]} />
          <form action={updateUvgStatus}>
            {hiddenInputs}
            <select name="caseStatus" defaultValue={response.data.caseStatus}>
              <option value="under_review">under_review</option>
              <option value="awaiting_documents">awaiting_documents</option>
              <option value="coordinating">coordinating</option>
              <option value="approved">approved</option>
              <option value="rejected">rejected</option>
              <option value="closed">closed</option>
            </select>
            <button type="submit">{t("uvg.cta.updateStatus")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.intake")}>
          <p>{response.data.intake?.accidentDescription ?? t("common.empty")}</p>
        </SectionCard>
        <SectionCard title={t("uvg.section.injuries")}>
          <ul>{response.data.injuries.map((injury) => <li key={injury.id}>{injury.injuryType} / {injury.bodyPart} / {injury.severity}</li>)}</ul>
          <form action={recordUvgInjury}>
            {hiddenInputs}
            <input name="injuryType" placeholder={t("uvg.section.injuries")} required />
            <input name="bodyPart" placeholder={t("uvg.field.employee")} required />
            <input name="severity" placeholder={t("uvg.field.status")} required />
            <label><input type="checkbox" name="medicalTreatmentFlag" /> {t("uvg.field.medicalTreatment")}</label>
            <label><input type="checkbox" name="hospitalizedFlag" /> {t("uvg.field.hospitalized")}</label>
            <input name="notes" placeholder={t("uvg.field.notes")} />
            <button type="submit">{t("uvg.cta.recordInjury")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.circumstances")}>
          <ul>{response.data.circumstances.map((circumstance) => <li key={circumstance.id}>{circumstance.causeCategory}: {circumstance.narrative}</li>)}</ul>
          <form action={recordUvgCircumstance}>
            {hiddenInputs}
            <input name="causeCategory" placeholder={t("uvg.field.causeCategory")} required />
            <input name="activityContext" placeholder={t("uvg.field.activityContext")} required />
            <label><input type="checkbox" name="thirdPartyInvolvedFlag" /> {t("uvg.field.thirdParty")}</label>
            <label><input type="checkbox" name="vehicleInvolvedFlag" /> {t("uvg.field.vehicle")}</label>
            <input name="narrative" placeholder={t("uvg.field.narrative")} required />
            <button type="submit">{t("uvg.cta.recordCircumstance")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.documents")}>
          <ul>{response.data.documentReferences.map((reference) => <li key={reference.id}>{reference.documentId} / {reference.documentRole}</li>)}</ul>
          <form action={linkUvgDocument}>
            {hiddenInputs}
            <input name="documentId" placeholder={t("uvg.section.documents")} required />
            <select name="documentRole" defaultValue="medical_certificate">
              <option value="accident_report">accident_report</option>
              <option value="medical_certificate">medical_certificate</option>
              <option value="police_report">police_report</option>
              <option value="correspondence">correspondence</option>
              <option value="other">other</option>
            </select>
            <button type="submit">{t("uvg.cta.linkDocument")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.coordination")}>
          <ul>{response.data.coordinationRecords.map((record) => <li key={record.id}>{record.coordinationType}: {record.coordinationStatus} ({record.relatedKtgCaseId ?? "-"})</li>)}</ul>
          <form action={upsertUvgCoordination}>
            {hiddenInputs}
            <select name="coordinationType" defaultValue="ktg_overlap"><option value="ktg_overlap">ktg_overlap</option><option value="complementary_uvg">complementary_uvg</option><option value="benefit_overlap_review">benefit_overlap_review</option></select>
            <input name="relatedKtgCaseId" placeholder="case-2001" defaultValue={response.data.linkedKtgCaseId ?? ""} />
            <input name="overlapStart" type="date" />
            <input name="overlapEnd" type="date" />
            <select name="coordinationStatus" defaultValue={response.data.coordinationStatus}><option value="open">open</option><option value="in_review">in_review</option><option value="resolved">resolved</option><option value="not_required">not_required</option></select>
            <label><input type="checkbox" name="benefitOverlapFlag" defaultChecked /> benefit overlap</label>
            <input name="notes" placeholder={t("uvg.field.notes")} />
            <button type="submit">{t("uvg.cta.updateCoordination")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.decisions")}>
          <ul>{response.data.decisions.map((decision) => <li key={decision.id}>{decision.decisionStatus}: {decision.decisionReason}</li>)}</ul>
          <form action={upsertUvgDecision}>
            {hiddenInputs}
            <select name="decisionStatus" defaultValue="pending"><option value="pending">pending</option><option value="approved">approved</option><option value="rejected">rejected</option><option value="partially_approved">partially_approved</option></select>
            <input name="decisionReason" placeholder={t("uvg.section.decisions")} required />
            <input name="effectiveFrom" type="date" required />
            <input name="effectiveTo" type="date" />
            <button type="submit">{t("uvg.cta.recordDecision")}</button>
          </form>
        </SectionCard>
        <SectionCard title={t("uvg.section.audit")}>
          <ul>{response.data.auditEvents.map((event) => <li key={event.eventId}>{event.occurredAt}: {event.eventType}</li>)}</ul>
        </SectionCard>
      </div>
    );
  } catch (error) {
    return <ErrorState title={t("page.uvgCaseDetail.title")} message={error instanceof Error ? error.message : t("uvg.error.cases")} />;
  }
}
