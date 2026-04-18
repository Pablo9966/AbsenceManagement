export const PageHeader = (props: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: any;
}) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "2rem" }}>
    <div>
      <p className="page-eyebrow">{props.eyebrow}</p>
      <h1 className="page-title">{props.title}</h1>
      <p className="page-description">{props.description}</p>
    </div>
    {props.actions ? <div>{props.actions}</div> : null}
  </div>
);

export const MetricCards = (props: {
  items: Array<{
    key: string;
    label: string;
    value: string | number;
    href?: string;
  }>;
}) => (
  <div className="dashboard-grid" style={{ marginBottom: "2rem" }}>
    {props.items.map((item) => (
      <div key={item.key} className="surface-card" style={{ padding: "1rem" }}>
        <h3>{item.label}</h3>
        <p style={{ fontSize: "2rem", color: "var(--primary-color)" }}>{item.value}</p>
        {item.href ? <a href={item.href}>Open</a> : null}
      </div>
    ))}
  </div>
);

export const WorkflowTable = (props: {
  children?: any;
}) => (
  <table className="data-table">
    {props.children}
  </table>
);

export const SectionCard = (props: {
  title: string;
  children?: any;
}) => (
  <section className="surface-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
    <h2 style={{ marginBottom: "1rem" }}>{props.title}</h2>
    {props.children}
  </section>
);

export const EmptyState = (props: {
  title: string;
  message: string;
}) => (
  <section className="surface-card" style={{ padding: "2rem" }}>
    <h1>{props.title}</h1>
    <p>{props.message}</p>
  </section>
);

export const ErrorState = (props: {
  title: string;
  message: string;
}) => (
  <section className="surface-card" style={{ padding: "2rem" }}>
    <h1>{props.title}</h1>
    <p>{props.message}</p>
  </section>
);

export const LoadingState = (props: {
  title: string;
  message?: string;
}) => (
  <section className="surface-card" style={{ padding: "2rem" }}>
    <h1>{props.title}</h1>
    <p>{props.message ?? "Loading..."}</p>
  </section>
);

export const DetailList = (props: {
  items: Array<{ label: string; value: any }>;
}) => (
  <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.75rem 1rem" }}>
    {props.items.map((item) => (
      <FragmentRow label={item.label} value={item.value} />
    ))}
  </dl>
);

const FragmentRow = (props: {
  label: string;
  value: any;
}) => (
  <>
    <dt style={{ fontWeight: 600 }}>{props.label}</dt>
    <dd>{props.value}</dd>
  </>
);
