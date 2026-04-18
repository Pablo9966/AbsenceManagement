import { getEmployerPortalRuntime } from "../../../src/runtime.js";

export default async function AnalyticsDashboardPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Client Analytics</h1>
          <p className="page-description">Interactive reporting on trends, heatmaps, causes, cost, and duration.</p>
        </div>
        <button className="btn-primary">Download Report PDF</button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="surface-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary-color)' }}>
          <h3 style={{ color: 'var(--text-color-secondary)', fontSize: '0.875rem' }}>Total Absence Cost (YTD)</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--text-color-primary)', marginTop: '0.5rem' }}>CHF 42,500</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>&darr; 4.2% from last year</p>
        </div>
        
        <div className="surface-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--warning-color)' }}>
          <h3 style={{ color: 'var(--text-color-secondary)', fontSize: '0.875rem' }}>Average Duration</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--text-color-primary)', marginTop: '0.5rem' }}>14 Days</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--accent-color)', marginTop: '0.5rem' }}>&uarr; 1.1 Days from last year</p>
        </div>
        
        <div className="surface-card" style={{ padding: '1.5rem', borderTop: '4px solid var(--secondary-color)' }}>
          <h3 style={{ color: 'var(--text-color-secondary)', fontSize: '0.875rem' }}>Return-to-Work Success</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--text-color-primary)', marginTop: '0.5rem' }}>92%</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary-color)', marginTop: '0.5rem' }}>&uarr; 3% improvement</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="surface-card" style={{ padding: '1.5rem' }}>
          <h3>Absence Causes (Heatmap Simulation)</h3>
          <div style={{ height: '300px', backgroundColor: 'var(--bg-color-main)', marginTop: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-color-secondary)' }}>[Interactive Heatmap Visualization]</p>
          </div>
        </div>
        <div className="surface-card" style={{ padding: '1.5rem' }}>
          <h3>Top Causes</h3>
          <ul style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Illness (General)</span>
              <strong>45%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Non-Occupational Accident</span>
              <strong>30%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Maternity</span>
              <strong>15%</strong>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Occupational Accident</span>
              <strong>10%</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
