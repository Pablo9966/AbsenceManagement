import {
  createPortalShellModel,
  employerNavigation,
  filterVisibleNavigation,
  loadCatalog,
  resolveLocale,
} from "@elipslife/frontend-platform";
import type { ReactNode } from "react";

const mockUserContext = {
  userId: "placeholder-user",
  tenantId: "placeholder-tenant",
  locale: "de-CH",
  roleCodes: ["hr_manager"],
  effectivePermissions: [
    { resourceType: "absence", action: "read", allowed: true },
    { resourceType: "ktg_case", action: "read", allowed: true },
    { resourceType: "document", action: "read", allowed: true },
    { resourceType: "payment_instruction", action: "read", allowed: true },
    { resourceType: "premium", action: "read", allowed: true },
    { resourceType: "task", action: "read", allowed: true },
    { resourceType: "tenant_admin", action: "manage", allowed: true },
  ],
};

const mockTenantContext = {
  tenantId: "placeholder-tenant",
  tenantName: "elipsLife Demo Kunde",
  defaultLocale: "de-CH",
  featureFlags: ["dashboard-shell", "admin-shell"],
};

export default function EmployerPortalLayout(props: {
  children: ReactNode;
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const locale = resolveLocale({ routeLocale: props.params.locale, tenantDefaultLanguage: "de-CH" });
  const messages = loadCatalog(locale);
  const navigation = filterVisibleNavigation(
    employerNavigation,
    { ...mockUserContext, locale },
  );
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.employerPortal",
    messages,
    navigation,
    tenantContext: { ...mockTenantContext, defaultLocale: locale },
    userContext: { ...mockUserContext, locale },
  });

  return (
    <html lang={locale}>
      <body>
        <div>
          <header>
            <strong>{shell.appName}</strong>
            <span> | {shell.portalTitle} | {shell.locale}</span>
          </header>
          <p>{messages["shell.tenant"]}: {shell.tenantName}</p>
          <nav>
            <ul>
              {shell.navigation.map((item) => (
                <li key={item.key}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <main>{props.children}</main>
        </div>
      </body>
    </html>
  );
}
