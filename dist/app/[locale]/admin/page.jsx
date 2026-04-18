import { GuardedPortalPage } from "../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";
export default async function InternalAdminPage(props) {
    const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale, viewer: "compliance" });
    return (<GuardedPortalPage routePattern="/[locale]/admin" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Internal Portal" title="Admin" description="Placeholder internal administration surface for operational settings and platform controls."/>);
}
//# sourceMappingURL=page.jsx.map