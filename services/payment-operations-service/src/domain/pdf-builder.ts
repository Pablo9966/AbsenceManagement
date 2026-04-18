const escapePdfString = (text: string): string =>
  text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export const buildStatementPdf = (lines: string[]): Buffer => {
  const contentLines = lines.map(
    (line, i) => `BT /F1 11 Tf 50 ${750 - i * 18} Td (${escapePdfString(line)}) Tj ET`,
  );
  const streamBody = contentLines.join("\n");
  const streamBodyBytes = Buffer.byteLength(streamBody, "latin1");

  const header = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<</Type /Catalog /Pages 2 0 R>>\nendobj\n";
  const obj2 = "2 0 obj\n<</Type /Pages /Kids [3 0 R] /Count 1>>\nendobj\n";
  const obj3 =
    "3 0 obj\n<</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842]" +
    " /Contents 5 0 R /Resources <</Font <</F1 4 0 R>>>>>>\nendobj\n";
  const obj4 =
    "4 0 obj\n<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>\nendobj\n";
  const obj5 = `5 0 obj\n<</Length ${streamBodyBytes}>>\nstream\n${streamBody}\nendstream\nendobj\n`;

  const parts = [header, obj1, obj2, obj3, obj4, obj5];
  const offsets: number[] = [];
  let cursor = 0;
  for (const part of parts) {
    offsets.push(cursor);
    cursor += Buffer.byteLength(part, "latin1");
  }

  const xrefStart = cursor;
  const objOffsets = offsets.slice(1);
  const xrefEntries = objOffsets
    .map((o) => `${String(o).padStart(10, "0")} 00000 n `)
    .join("\n");
  const xref = `xref\n0 6\n0000000000 65535 f \n${xrefEntries}\n`;
  const trailer = `trailer\n<</Size 6 /Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(parts.join("") + xref + trailer, "latin1");
};
