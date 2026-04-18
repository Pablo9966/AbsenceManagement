import { getEmployerPortalRuntime } from "../../../src/runtime.js";

// Mock data to simulate Phase 1 service output for Absences
const MOCK_ABSENCES = [
  { id: 'A-1001', employee: 'Alice Smith', type: 'Illness', startDate: '2026-04-10', endDate: '2026-04-20', status: 'Pending Review', reportDate: '2026-04-10' },
  { id: 'A-1002', employee: 'Bob Jones', type: 'Accident (UVG)', startDate: '2026-04-15', endDate: null, status: 'Open', reportDate: '2026-04-15' },
  { id: 'A-1003', employee: 'Charlie Brown', type: 'Illness', startDate: '2026-03-01', endDate: '2026-03-15', status: 'Closed', reportDate: '2026-03-02' },
];

export default async function EmployerAbsencesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  // We should enforce access using resolveRouteAccess, but for MVP UI we'll build the page directly.
  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Absence Inbox</h1>
          <p className="page-description">Manage and review recorded absences, track certificates, and monitor team status.</p>
        </div>
        <button className="btn-primary">Report Absence</button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="surface-card" style={{ padding: '1rem' }}>
          <h3>Pending Reviews</h3>
          <p style={{ fontSize: '2rem', color: 'var(--primary-color)' }}>1</p>
        </div>
        <div className="surface-card" style={{ padding: '1rem' }}>
          <h3>Open Absences</h3>
          <p style={{ fontSize: '2rem', color: 'var(--warning-color)' }}>2</p>
        </div>
        <div className="surface-card" style={{ padding: '1rem' }}>
          <h3>Missing Certificates</h3>
          <p style={{ fontSize: '2rem', color: 'var(--accent-color)' }}>1</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Employee</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th>Reported On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_ABSENCES.map(absence => (
            <tr key={absence.id}>
              <td><strong>{absence.id}</strong></td>
              <td>{absence.employee}</td>
              <td>{absence.type}</td>
              <td>{absence.startDate}</td>
              <td>{absence.endDate || '-'}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: absence.status === 'Closed' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: absence.status === 'Closed' ? 'var(--secondary-color)' : 'var(--warning-color)'
                }}>
                  {absence.status}
                </span>
              </td>
              <td>{absence.reportDate}</td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
