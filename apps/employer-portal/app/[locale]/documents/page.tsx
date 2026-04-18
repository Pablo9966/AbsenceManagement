import { getEmployerPortalRuntime } from "../../../src/runtime.js";

const MOCK_DOCUMENTS = [
  { id: 'D-501', title: 'Medical Certificate - A. Smith', type: 'Arztzeugnis', date: '2026-04-12', linkedTo: 'Absence A-1001', status: 'Verified' },
  { id: 'D-502', title: 'Accident Report - B. Jones', type: 'Unfallmeldung', date: '2026-04-15', linkedTo: 'Absence A-1002', status: 'Pending Review' },
];

export default async function EmployerDocumentsPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <div className="surface-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p className="page-eyebrow">Employer Portal</p>
          <h1 className="page-title">Document Inbox</h1>
          <p className="page-description">Manage incoming medical certificates and related documents.</p>
        </div>
        <button className="btn-primary">Upload Document</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Received Date</th>
            <th>Linked To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_DOCUMENTS.map(doc => (
            <tr key={doc.id}>
              <td><strong>{doc.id}</strong></td>
              <td>{doc.title}</td>
              <td>{doc.type}</td>
              <td>{doc.date}</td>
              <td>{doc.linkedTo}</td>
              <td>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem', 
                  backgroundColor: doc.status === 'Verified' ? 'rgba(52, 168, 83, 0.1)' : 'rgba(251, 188, 5, 0.1)',
                  color: doc.status === 'Verified' ? 'var(--secondary-color)' : 'var(--warning-color)'
                }}>
                  {doc.status}
                </span>
              </td>
              <td>
                <button style={{
                  background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 500
                }}>View Document</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
