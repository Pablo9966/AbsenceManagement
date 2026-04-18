import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";
export default async function EmployerCasesPage(props) {
    const runtime = await getEmployerPortalRuntime(props.params.locale);
    return (<GuardedPortalPage routePattern="/[locale]/cases" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Employer Portal" title="KTG Cases" description="Placeholder case inbox for employer-facing KTG registration, status, and communication flows."/>);
}
//# sourceMappingURL=page.jsx.map