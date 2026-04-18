import { GuardedPortalPage } from "../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";
export default async function InternalIntakePage(props) {
    const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale });
    return (<GuardedPortalPage routePattern="/[locale]/intake" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Internal Portal" title="Intake" description="Placeholder work queue for claims-intake workspaces and missing-information loops."/>);
}
//# sourceMappingURL=page.jsx.map