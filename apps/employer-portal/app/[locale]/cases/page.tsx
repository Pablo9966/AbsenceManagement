import { getEmployerPortalRuntime } from "../../../src/runtime.js";

const MOCK_CASES = [
  { id: 'C-8921', employee: 'Alice Smith', type: 'KTG', openDate: '2026-04-12', status: 'Reviewing Documents', assignedHandler: 'Sarah Handler' },
  { id: 'C-8910', employee: 'Charlie Brown', type: 'KTG', openDate: '2026-03-05', status: 'Payment Authorized', assignedHandler: 'Mike Validator' },
];

export default async function EmployerCasesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">KTG Cases</h1>
          <p className="page-description">Manage KTG cases, track claims progression, and communicate with case handlers.</p>
        </div>
        <button className="btn-primary">Register New KTG Case</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Employee</th>
            <th>Type</th>
            <th>Open Date</th>
            <th>Status</th>
            <th>Handler</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_CASES.map(c => (
            <tr key={c.id}>
              <td><strong>{c.id}</strong></td>
              <td>{c.employee}</td>
              <td>{c.type}</td>
              <td>{c.openDate}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: c.status === 'Payment Authorized' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(66, 133, 244, 0.1)',
                  color: c.status === 'Payment Authorized' ? 'var(--secondary-color)' : 'var(--primary-color)'
                }}>
                  {c.status}
                </span>
              </td>
              <td>{c.assignedHandler}</td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>View Case</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
