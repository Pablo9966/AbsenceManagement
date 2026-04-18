import { getInternalPortalRuntime } from "../../../src/runtime.js";

const MOCK_KTG_CASES = [
  { id: 'C-8921', employer: 'Tech Corp AG', employee: 'Alice Smith', openDate: '2026-04-12', stage: 'Coverage Assessment', assignedTo: 'Sarah Handler' },
  { id: 'C-8910', employer: 'Bakery GmbH', employee: 'Charlie Brown', openDate: '2026-03-05', stage: 'Ongoing Payments', assignedTo: 'Mike Validator' },
];

export default async function InternalKtgCasesPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Internal Operations</p>
          <h1 className="page-title">KTG Review Workspace</h1>
          <p className="page-description">Assess coverage, determine liability, and manage ongoing claims.</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Case ID</th>
            <th>Employer</th>
            <th>Employee</th>
            <th>Open Date</th>
            <th>Stage</th>
            <th>Assigned To</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_KTG_CASES.map(c => (
            <tr key={c.id}>
              <td><strong>{c.id}</strong></td>
              <td>{c.employer}</td>
              <td>{c.employee}</td>
              <td>{c.openDate}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: c.stage === 'Ongoing Payments' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(66, 133, 244, 0.1)',
                  color: c.stage === 'Ongoing Payments' ? 'var(--secondary-color)' : 'var(--primary-color)'
                }}>
                  {c.stage}
                </span>
              </td>
              <td>{c.assignedTo}</td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>Open Workspace</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
