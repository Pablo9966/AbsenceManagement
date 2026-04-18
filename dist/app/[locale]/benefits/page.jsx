import { GuardedPortalPage } from "../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../src/runtime.js";
export default async function InternalBenefitsPage(props) {
    const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale });
    return (<GuardedPortalPage routePattern="/[locale]/benefits" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Internal Portal" title="Benefit Calculations" description="Placeholder benefit-engine landing page for calculation review and payment approval prep."/>);
}
//# sourceMappingURL=page.jsx.map