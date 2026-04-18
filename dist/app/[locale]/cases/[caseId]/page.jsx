import { GuardedPortalPage } from "../../../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../../../src/runtime.js";
export default async function EmployerCaseDetailPage(props) {
    const runtime = await getEmployerPortalRuntime(props.params.locale);
    return (<GuardedPortalPage routePattern="/[locale]/cases/[caseId]" rules={runtime.routeRules} userContext={runtime.userContext} messages={runtime.messages} eyebrow="Employer Portal" title="Case Detail" description="Placeholder detail surface for employer-visible KTG case data, deadlines, and notes." identifier={props.params.caseId}/>);
}
//# sourceMappingURL=page.jsx.map