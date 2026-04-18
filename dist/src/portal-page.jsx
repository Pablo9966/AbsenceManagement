export const PortalPage = (props) => (<section>
    <p>{props.eyebrow}</p>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
    {props.identifier ? <p>Reference: {props.identifier}</p> : null}
  </section>);
//# sourceMappingURL=portal-page.jsx.map