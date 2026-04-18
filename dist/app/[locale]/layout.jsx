import { PortalLayout } from "../../src/frontend.js";
import { getInternalPortalRuntime } from "../../src/runtime.js";
export default async function InternalPortalLayout(props) {
    const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale });
    return (<html lang={runtime.locale}>
      <body>
        <PortalLayout shell={runtime.shell} messages={runtime.messages}>
          {props.children}
        </PortalLayout>
      </body>
    </html>);
}
//# sourceMappingURL=layout.jsx.map