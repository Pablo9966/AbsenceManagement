import { getEmployeePortalRuntime } from "../../../src/runtime.js";

export default async function ReportAbsencePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employee Portal</p>
          <h1 className="page-title">Report Absence</h1>
          <p className="page-description">Notify your employer about an illness or accident.</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Absence Type</label>
          <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}>
            <option>Illness (Krankheit)</option>
            <option>Occupational Accident (BU)</option>
            <option>Non-Occupational Accident (NBU)</option>
            <option>Maternity/Paternity</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Start Date</label>
            <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Expected End Date (Optional)</label>
            <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }} />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Additional Comments</label>
          <textarea rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}></textarea>
        </div>
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Absence Report</button>
      </form>
    </div>
  );
}
