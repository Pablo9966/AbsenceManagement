import { getInternalPortalRuntime } from "../../../src/runtime.js";

const MOCK_CALCULATIONS = [
  { id: 'CALC-501', caseId: 'C-8910', employee: 'Charlie Brown', calculationDate: '2026-03-25', period: 'March 2026', totalBenefit: 'CHF 4,500.00', status: 'Approved' },
  { id: 'CALC-502', caseId: 'C-8921', employee: 'Alice Smith', calculationDate: 'Pending', period: 'April 2026', totalBenefit: '-', status: 'Draft' },
];

export default async function InternalBenefitsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Internal Operations</p>
          <h1 className="page-title">Benefit Calculation Workspace</h1>
          <p className="page-description">Calculate daily allowances, adjust for coordinate benefits, and finalize amounts.</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Calc ID</th>
            <th>Case ID</th>
            <th>Employee</th>
            <th>Period</th>
            <th>Calc Date</th>
            <th>Total Benefit</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_CALCULATIONS.map(calc => (
            <tr key={calc.id}>
              <td><strong>{calc.id}</strong></td>
              <td>{calc.caseId}</td>
              <td>{calc.employee}</td>
              <td>{calc.period}</td>
              <td>{calc.calculationDate}</td>
              <td>{calc.totalBenefit}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: calc.status === 'Approved' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: calc.status === 'Approved' ? 'var(--secondary-color)' : 'var(--warning-color)'
                }}>
                  {calc.status}
                </span>
              </td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>Review Calculation</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
