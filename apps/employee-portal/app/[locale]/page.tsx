import { GuardedPortalPage } from "../../src/frontend.js";
import { getEmployeePortalRuntime } from "../../src/runtime.js";

const MOCK_MY_ABSENCES = [
  { id: 'A-1001', type: 'Illness', startDate: '2026-04-10', endDate: '2026-04-20', status: 'Pending Review' },
];

export default async function EmployeeDashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployeePortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employee Portal</p>
          <h1 className="page-title">My Status</h1>
          <p className="page-description">View your current absences and quickly take action.</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="surface-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h3>Report an Absence</h3>
          <p style={{ marginTop: '1rem' }}><a href={`/${locale}/report-absence`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>Start &rarr;</a></p>
        </div>
        <div className="surface-card" style={{ padding: '1rem', borderLeft: '4px solid var(--warning-color)' }}>
          <h3>Upload Medical Certificate</h3>
          <p style={{ marginTop: '1rem' }}><a href={`/${locale}/upload-certificate`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>Upload &rarr;</a></p>
        </div>
        <div className="surface-card" style={{ padding: '1rem', borderLeft: '4px solid var(--secondary-color)' }}>
          <h3>Return to Work Confirmation</h3>
          <p style={{ marginTop: '1rem' }}><a href={`/${locale}/return-to-work`} style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 500 }}>Confirm &rarr;</a></p>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem' }}>Active Absences</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_MY_ABSENCES.map(absence => (
            <tr key={absence.id}>
              <td><strong>{absence.id}</strong></td>
              <td>{absence.type}</td>
              <td>{absence.startDate}</td>
              <td>{absence.endDate}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: 'rgba(251, 188, 5, 0.1)',
                  color: 'var(--warning-color)'
                }}>
                  {absence.status}
                </span>
              </td>
            </tr>
          ))}
          {MOCK_MY_ABSENCES.length === 0 && (
            <tr><td colSpan={5}>No active absences.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
