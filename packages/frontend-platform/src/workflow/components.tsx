/* ── Workflow UI Components — Obsidian Design System ── */

export const PageHeader = (props: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: any;
}) => (
  <header
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "1.5rem",
      marginBottom: "2rem",
      paddingBottom: "1.75rem",
      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    }}
  >
    <div>
      <p className="page-eyebrow">{props.eyebrow}</p>
      <h1 className="page-title">{props.title}</h1>
      <p className="page-description">{props.description}</p>
    </div>
    {props.actions
      ? (
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "0.25rem" }}>
          {props.actions}
        </div>
      )
      : null}
  </header>
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
      <div
        key={item.key}
        className="surface-card"
        style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            fontWeight: 500,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-tertiary, rgba(255,255,255,0.44))",
          }}
        >
          {item.label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
            fontSize: "2.25rem",
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            background: "linear-gradient(135deg, #E8A86A 0%, #E8C9A0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {item.value}
        </p>
        {item.href
          ? (
            <a
              href={item.href}
              style={{
                fontSize: "0.8125rem",
                color: "var(--clay, #C97B4B)",
                marginTop: "0.25rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              View →
            </a>
          )
          : null}
      </div>
    ))}
  </div>
);

export const WorkflowTable = (props: {
  children?: any;
}) => (
  <div style={{ overflowX: "auto", width: "100%" }}>
    <table className="data-table">
      {props.children}
    </table>
  </div>
);

export const SectionCard = (props: {
  title: string;
  children?: any;
}) => (
  <section
    className="surface-card"
    style={{ marginBottom: "1.25rem" }}
    aria-labelledby={`section-${props.title.toLowerCase().replace(/\s+/g, "-")}`}
  >
    <h2
      id={`section-${props.title.toLowerCase().replace(/\s+/g, "-")}`}
      style={{
        fontSize: "1rem",
        fontWeight: 400,
        color: "var(--text-primary, #fff)",
        marginBottom: "1.25rem",
        letterSpacing: "-0.01em",
        paddingBottom: "1rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      {props.title}
    </h2>
    {props.children}
  </section>
);

export const EmptyState = (props: {
  title: string;
  message: string;
}) => (
  <div
    aria-live="polite"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 2rem",
      textAlign: "center",
      gap: "0.5rem",
    }}
  >
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "12px",
        background: "rgba(255, 255, 255, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.125rem",
        marginBottom: "0.75rem",
      }}
      aria-hidden="true"
    >
      ◦
    </div>
    <h3
      style={{
        fontSize: "1rem",
        fontWeight: 400,
        color: "var(--text-secondary, rgba(255,255,255,0.72))",
        letterSpacing: "-0.01em",
      }}
    >
      {props.title}
    </h3>
    <p
      style={{
        fontSize: "0.875rem",
        color: "var(--text-tertiary, rgba(255,255,255,0.44))",
        maxWidth: "320px",
        lineHeight: 1.6,
      }}
    >
      {props.message}
    </p>
  </div>
);

export const ErrorState = (props: {
  title: string;
  message: string;
}) => (
  <section
    className="surface-card"
    style={{
      padding: "2.5rem",
      maxWidth: "520px",
      borderColor: "rgba(239, 68, 68, 0.28)",
      background: "rgba(239, 68, 68, 0.04)",
    }}
    role="alert"
    aria-live="assertive"
  >
    <p
      style={{
        fontSize: "0.6875rem",
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "rgba(252, 165, 165, 0.8)",
        marginBottom: "0.625rem",
      }}
    >
      Error
    </p>
    <h1
      style={{
        fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
        fontSize: "1.5rem",
        fontWeight: 400,
        letterSpacing: "-0.02em",
        color: "var(--text-primary, #fff)",
        marginBottom: "0.625rem",
        lineHeight: 1.25,
      }}
    >
      {props.title}
    </h1>
    <p style={{ fontSize: "0.9375rem", color: "rgba(255,255,255,0.64)", lineHeight: 1.65 }}>
      {props.message}
    </p>
  </section>
);

export const LoadingState = (props: {
  title: string;
  message?: string;
}) => (
  <section
    aria-busy="true"
    aria-live="polite"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      gap: "0.75rem",
      textAlign: "center",
    }}
  >
    {/* Subtle animated ring */}
    <div
      aria-hidden="true"
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        border: "2px solid rgba(255, 255, 255, 0.08)",
        borderTopColor: "var(--clay, #C97B4B)",
        animation: "spin 0.9s linear infinite",
        marginBottom: "0.5rem",
      }}
    />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <p
      style={{
        fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
        fontSize: "1.125rem",
        fontWeight: 400,
        color: "var(--text-secondary, rgba(255,255,255,0.72))",
        letterSpacing: "-0.01em",
      }}
    >
      {props.title}
    </p>
    <p style={{ fontSize: "0.875rem", color: "var(--text-tertiary, rgba(255,255,255,0.44))" }}>
      {props.message ?? "Loading…"}
    </p>
  </section>
);

export const DetailList = (props: {
  items: Array<{ label: string; value: any }>;
}) => (
  <dl className="detail-list">
    {props.items.map((item) => (
      <FragmentRow key={item.label} label={item.label} value={item.value} />
    ))}
  </dl>
);

const FragmentRow = (props: {
  label: string;
  value: any;
}) => (
  <>
    <dt>{props.label}</dt>
    <dd>{props.value}</dd>
  </>
);
