import type { UvgCaseDetail } from "./types.js";

const escapePdfString = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export const buildAccidentReportArtifactPayload = (detail: UvgCaseDetail): Buffer => {
  const lines = [
    `UVG Accident Report ${detail.caseNumber}`,
    `Case type: ${detail.uvgCaseType}`,
    `Case status: ${detail.caseStatus}`,
    `Employee: ${detail.employeeId}`,
    `Accident date: ${detail.accidentDate}`,
    `Location: ${detail.incidentLocation}`,
    `Summary: ${detail.incidentSummary}`,
    `KTG case: ${detail.ktgCaseId ?? "n/a"}`,
    `Coordination: ${detail.coordinationStatus}`,
    `Injuries: ${detail.injuries.length}`,
    `Circumstances: ${detail.circumstances.length}`,
    `Documents: ${detail.documentReferences.length}`,
  ];

  const contentLines = lines.map((line, index) => `BT /F1 10 Tf 40 ${800 - index * 18} Td (${escapePdfString(line)}) Tj ET`);
  const streamBody = contentLines.join("\n");
  const streamLength = Buffer.byteLength(streamBody, "latin1");
  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n";
  const obj2 = "2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n";
  const obj3 = "3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources <</Font <</F1 4 0 R>>>>>>\nendobj\n";
  const obj4 = "4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n";
  const obj5 = `5 0 obj\n<</Length ${streamLength}>>\nstream\n${streamBody}\nendstream\nendobj\n`;
  const parts = [header, obj1, obj2, obj3, obj4, obj5];
  const offsets: number[] = [];
  let cursor = 0;
  for (const part of parts) {
    offsets.push(cursor);
    cursor += Buffer.byteLength(part, "latin1");
  }
  const xrefStart = cursor;
  const xrefEntries = offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n `)
    .join("\n");
  const xref = `xref\n0 6\n0000000000 65535 f \n${xrefEntries}\n`;
  const trailer = `trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(parts.join("") + xref + trailer, "latin1");
};
