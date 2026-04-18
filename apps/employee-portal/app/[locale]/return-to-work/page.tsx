import { getEmployeePortalRuntime } from "../../../src/runtime.js";

export default async function ReturnToWorkPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employee Portal</p>
          <h1 className="page-title">Return to Work Confirmation</h1>
          <p className="page-description">Confirm that you have returned to work and close an active absence.</p>
        </div>
      </div>

      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Active Absence</label>
          <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}>
            <option>A-1001 (Illness: Started 2026-04-10)</option>
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Actual Return Date</label>
          <input type="date" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="workCapacity" style={{ width: '1.25rem', height: '1.25rem' }} />
          <label htmlFor="workCapacity" style={{ fontWeight: 500 }}>I have returned with 100% working capacity.</label>
        </div>
        <button type="button" className="btn-primary" style={{ alignSelf: 'flex-start' }}>Confirm Return</button>
      </form>
    </div>
  );
}
