import { PortalLayout } from "../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../src/runtime.js";
export const dynamic = "force-dynamic";

export default async function EmployerPortalLayout(props: {
  children: any;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <PortalLayout shell={runtime.shell} messages={runtime.messages}>
      {props.children}
    </PortalLayout>
  );
}
