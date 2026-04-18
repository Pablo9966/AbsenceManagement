import { getEmployerPortalRuntime } from "../../../src/runtime.js";

const MOCK_PAYMENTS = [
  { id: 'PAY-100', runDate: '2026-03-31', period: 'March 2026', totalAmount: 'CHF 12,450.00', status: 'Settled', statement: 'Available' },
  { id: 'PAY-101', runDate: '2026-04-30', period: 'April 2026', totalAmount: 'CHF 4,200.00', status: 'Pending Calculation', statement: 'Not Available' },
];

export default async function EmployerPaymentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Payments & Calculations</h1>
          <p className="page-description">View payment runs, statement PDFs, and basic calculation details.</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Period</th>
            <th>Run Date</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Statement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_PAYMENTS.map(pay => (
            <tr key={pay.id}>
              <td><strong>{pay.id}</strong></td>
              <td>{pay.period}</td>
              <td>{pay.runDate}</td>
              <td>{pay.totalAmount}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: pay.status === 'Settled' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: pay.status === 'Settled' ? 'var(--secondary-color)' : 'var(--warning-color)'
                }}>
                  {pay.status}
                </span>
              </td>
              <td>{pay.statement}</td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }} disabled={pay.statement === 'Not Available'}>
                  Download PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
