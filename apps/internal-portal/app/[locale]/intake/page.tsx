import { getInternalPortalRuntime } from "../../../src/runtime.js";

const MOCK_INTAKE = [
  { id: 'I-901', employer: 'Tech Corp AG', employee: 'Alice Smith', document: 'Arztzeugnis.pdf', received: '2026-04-12', status: 'Requires Verification' },
  { id: 'I-902', employer: 'Bakery GmbH', employee: 'Unknown', document: 'Unfallmeldung.pdf', received: '2026-04-15', status: 'Needs Triage' },
];

export default async function InternalIntakePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Internal Operations</p>
          <h1 className="page-title">Claims Intake Queue</h1>
          <p className="page-description">Triage incoming documents, verify medical certificates, and route cases to handlers.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="surface-card" style={{ padding: '1rem' }}>
          <h3>Unassigned Documents</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>2</p>
        </div>
        <div className="surface-card" style={{ padding: '1rem' }}>
          <h3>Pending Verification</h3>
          <p style={{ fontSize: '2rem', color: 'var(--warning-color)' }}>1</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Intake ID</th>
            <th>Employer</th>
            <th>Employee</th>
            <th>Document</th>
            <th>Received Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_INTAKE.map(item => (
            <tr key={item.id}>
              <td><strong>{item.id}</strong></td>
              <td>{item.employer}</td>
              <td>{item.employee}</td>
              <td>{item.document}</td>
              <td>{item.received}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: item.status === 'Needs Triage' ? 'rgba(234, 67, 53, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: item.status === 'Needs Triage' ? 'var(--accent-color)' : 'var(--warning-color)'
                }}>
                  {item.status}
                </span>
              </td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>Process</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
