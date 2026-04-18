import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getInternalPortalRuntime } from "../../../../src/runtime.js";
export default async function InternalBenefitDetailPage(props) {
    const runtime = await getInternalPortalRuntime({ routeLocale: props.params.locale });
    return (<GuardedPortalPage routePattern="/[locale]/benefits/[calculationId]" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Internal Portal" title="Calculation Detail" description="Placeholder calculation detail for salary basis, entitlement periods, and Taggelddispositiv context." identifier={props.params.calculationId}/>);
}
//# sourceMappingURL=page.jsx.map