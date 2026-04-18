import {
  PortalLayout,
} from "@elipslife/frontend-platform";
import type { ReactNode } from "react";
import { getEmployerPortalRuntime } from "../../src/runtime";

export default function EmployerPortalLayout(props: {
  children: ReactNode;
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const runtime = getEmployerPortalRuntime(props.params.locale);

  return (
    <html lang={runtime.locale}>
      <body>
        <PortalLayout shell={runtime.shell} messages={runtime.messages}>
          {props.children}
        </PortalLayout>
      </body>
    </html>
  );
}
