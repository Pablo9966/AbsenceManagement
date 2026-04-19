import type { UvgCaseDetail } from "./types.js";

export const buildAccidentReportArtifactPayload = (detail: UvgCaseDetail): Buffer => {
  const payload = {
    reportType: "uvg_accident_report",
    generatedFrom: "uvg-case-service",
    case: {
      caseNumber: detail.caseNumber,
      type: detail.uvgCaseType,
      status: detail.caseStatus,
      employeeId: detail.employeeId,
      accidentDate: detail.accidentDate,
      location: detail.incidentLocation,
      summary: detail.incidentSummary,
      ktgCaseId: detail.ktgCaseId,
      coordinationStatus: detail.coordinationStatus,
    },
    intake: detail.intake,
    injuries: detail.injuries,
    circumstances: detail.circumstances,
    coordination: detail.coordinationRecords,
    documents: detail.documentReferences,
  };

  const body = JSON.stringify(payload, null, 2);
  return Buffer.from(`%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R >> endobj
4 0 obj << /Length ${body.length + 96} >> stream
BT /F1 10 Tf 40 800 Td (UVG Accident Report ${detail.caseNumber}) Tj 0 -16 Td (${body.replace(/[()]/g, "")}) Tj ET
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`);
};
