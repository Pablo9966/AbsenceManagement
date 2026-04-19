import { PortalLayout } from "../../src/frontend.js";
import { getInternalPortalRuntime } from "../../src/runtime.js";
export const dynamic = "force-dynamic";

export default async function InternalPortalLayout(props: {
  children: any;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getInternalPortalRuntime({ routeLocale: locale });

  return (
    <PortalLayout shell={runtime.shell} messages={runtime.messages}>
      {props.children}
    </PortalLayout>
  );
}
