import { getInternalPortalRuntime } from "../../../src/runtime.js";

const MOCK_AUDIT_LOGS = [
  { id: 'LOG-9910', timestamp: '2026-04-18T08:30:12Z', actor: 'Sarah Handler', action: 'ASSESS_COVERAGE', target: 'Case C-8921', status: 'Success' },
  { id: 'LOG-9911', timestamp: '2026-04-18T09:15:00Z', actor: 'System', action: 'TRIGGER_PAYMENT_RUN', target: 'Run PAY-102', status: 'Failed' },
  { id: 'LOG-9912', timestamp: '2026-04-18T10:05:45Z', actor: 'Alice Smith (Employer)', action: 'UPLOAD_DOCUMENT', target: 'Absence A-1001', status: 'Success' },
];

export default async function InternalCompliancePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Internal Operations</p>
          <h1 className="page-title">Compliance & Audit Logs</h1>
          <p className="page-description">Review system events, monitor access, and ensure regulatory compliance.</p>
        </div>
        <button className="btn-primary">Export Logs</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Log ID</th>
            <th>Timestamp</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Target</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_AUDIT_LOGS.map(log => (
            <tr key={log.id}>
              <td><strong>{log.id}</strong></td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.actor}</td>
              <td><code style={{ background: 'rgba(0,0,0,0.05)', padding: '2px 4px', borderRadius: '4px' }}>{log.action}</code></td>
              <td>{log.target}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: log.status === 'Success' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(234, 67, 53, 0.1)',
                  color: log.status === 'Success' ? 'var(--secondary-color)' : 'var(--accent-color)'
                }}>
                  {log.status}
                </span>
              </td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>View Payload</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
