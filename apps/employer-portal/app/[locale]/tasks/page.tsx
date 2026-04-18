import { getEmployerPortalRuntime } from "../../../src/runtime.js";

const MOCK_TASKS = [
  { id: 'T-9001', title: 'Submit salary details for Alice Smith', dueDate: '2026-04-25', priority: 'High', status: 'Pending' },
  { id: 'T-9002', title: 'Review KTG settlement C-8910', dueDate: '2026-04-30', priority: 'Medium', status: 'Pending' },
];

export default async function EmployerTasksPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Tasks & Deadlines</h1>
          <p className="page-description">Manage your pending actions, review deadlines, and resolve blocked items.</p>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_TASKS.map(task => (
            <tr key={task.id}>
              <td><strong>{task.id}</strong></td>
              <td>{task.title}</td>
              <td style={{ color: task.priority === 'High' ? 'var(--accent-color)' : 'inherit' }}>{task.dueDate}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: task.priority === 'High' ? 'rgba(234, 67, 53, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: task.priority === 'High' ? 'var(--accent-color)' : 'var(--warning-color)'
                }}>
                  {task.priority}
                </span>
              </td>
              <td>{task.status}</td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>Resolve</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
