import {
  createPortalShellModel,
  filterVisibleNavigation,
  internalNavigation,
  loadCatalog,
  resolveLocale,
} from "@elipslife/frontend-platform";
import type { ReactNode } from "react";

const mockUserContext = {
  userId: "placeholder-user",
  tenantId: "placeholder-tenant",
  locale: "de-CH",
  roleCodes: ["claims_handler"],
  effectivePermissions: [
    { resourceType: "claims_intake_workspace", action: "read", allowed: true },
    { resourceType: "ktg_case", action: "read_internal", allowed: true },
    { resourceType: "benefit_calculation", action: "read", allowed: true },
    { resourceType: "audit", action: "view", allowed: true },
    { resourceType: "internal_admin", action: "manage", allowed: true },
  ],
};

const mockTenantContext = {
  tenantId: "placeholder-tenant",
  tenantName: "elipsLife Intern",
  defaultLocale: "de-CH",
  featureFlags: ["dashboard-shell", "compliance-shell"],
};

export default function InternalPortalLayout(props: {
  children: ReactNode;
  params: { locale: "de-CH" | "en-CH" | "fr-CH" | "it-CH" };
}) {
  const locale = resolveLocale({ routeLocale: props.params.locale, tenantDefaultLanguage: "de-CH" });
  const messages = loadCatalog(locale);
  const navigation = filterVisibleNavigation(
    internalNavigation,
    { ...mockUserContext, locale },
  );
  const shell = createPortalShellModel({
    locale,
    portalTitleKey: "shell.internalPortal",
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
