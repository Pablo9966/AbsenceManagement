import { Inter, Roboto } from "next/font/google";
import { PortalLayout } from "../../src/frontend.js";
import { getEmployerPortalRuntime } from "../../src/runtime.js";
import "../../src/globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ["latin"], variable: '--font-roboto' });

export default async function EmployerPortalLayout(props: {
  children: any;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const runtime = await getEmployerPortalRuntime(locale);

  return (
    <html lang={runtime.locale} className={`${inter.variable} ${roboto.variable}`}>
      <body>
        <PortalLayout shell={runtime.shell} messages={runtime.messages}>
          {props.children}
        </PortalLayout>
      </body>
    </html>
  );
}
