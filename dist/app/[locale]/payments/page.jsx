import { GuardedPortalPage } from "../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../src/runtime.js";
export default async function EmployerPaymentsPage(props) {
    const runtime = await getEmployerPortalRuntime(props.params.locale);
    return (<GuardedPortalPage routePattern="/[locale]/payments" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Employer Portal" title="Payments" description="Placeholder payment statement and reconciliation view for payroll and HR users."/>);
}
//# sourceMappingURL=page.jsx.map