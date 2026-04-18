export interface PortalPageProps {
  eyebrow: string;
  title: string;
  description: string;
  identifier?: string;
}

export const PortalPage = (props: PortalPageProps) => (
  <section>
    <p>{props.eyebrow}</p>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
    {props.identifier ? <p>Reference: {props.identifier}</p> : null}
  </section>
);
