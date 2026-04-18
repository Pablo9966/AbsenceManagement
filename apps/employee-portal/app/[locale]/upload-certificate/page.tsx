import { getEmployeePortalRuntime } from "../../../src/runtime.js";

export default async function UploadCertificatePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employee Portal</p>
          <h1 className="page-title">Upload Medical Certificate</h1>
          <p className="page-description">Securely submit your Arztzeugnis or other medical documents.</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Absence</label>
          <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}>
            <option>A-1001 (Illness: 2026-04-10)</option>
            <option>New Absence (Not Yet Reported)</option>
          </select>
        </div>
        <div style={{ border: '2px dashed var(--border-color)', padding: '3rem', textAlign: 'center', borderRadius: '12px', backgroundColor: 'var(--bg-color-main)' }}>
          <p style={{ marginBottom: '1rem', color: 'var(--text-color-secondary)' }}>Drag and drop your PDF or Image file here, or click to browse.</p>
          <button type="button" className="btn-primary" style={{ backgroundColor: 'var(--text-color-secondary)' }}>Select File</button>
        </div>
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Upload Document</button>
      </form>
    </div>
  );
}
