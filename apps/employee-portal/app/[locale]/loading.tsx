import { LoadingState, loadCatalog, resolveLocale, type LocaleCode } from "../../src/frontend.js";

export default async function EmployeeLocaleLoadingPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const routeLocale = (
    locale === "de-CH" ||
    locale === "en-CH" ||
    locale === "fr-CH" ||
    locale === "it-CH"
  ) ? locale as LocaleCode : undefined;
  const messages = loadCatalog(resolveLocale({ routeLocale }));

  return (
    <LoadingState
      title={messages["employee.loading.title"] ?? messages["shell.employeePortal"] ?? "Employee Portal"}
      message={messages["employee.loading.message"] ?? messages["common.loading"] ?? "Loading"}
    />
  );
}
