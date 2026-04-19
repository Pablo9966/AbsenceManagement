import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  LOCAL_TEST_LOCALE_COOKIE,
  LOCAL_TEST_PERSONA_COOKIE,
  getLocalPortalBaseUrl,
  resolveLocalTestLocale,
  resolveLocalTestPersona,
} from "../../../packages/frontend-platform/src/local-testing.js";

export default async function EmployeeRootPage() {
  const cookieStore = await cookies();
  const selectedPersona = resolveLocalTestPersona(cookieStore.get(LOCAL_TEST_PERSONA_COOKIE)?.value);
  if (selectedPersona && !selectedPersona.portalSessions.employee) {
    redirect(`${getLocalPortalBaseUrl("employer")}/?unsupported=employee`);
  }

  const locale = resolveLocalTestLocale(cookieStore.get(LOCAL_TEST_LOCALE_COOKIE)?.value);
  redirect(`/${locale}/dashboard`);
}
