import { NextResponse } from "next/server";
import {
  LOCAL_TEST_LOCALE_COOKIE,
  LOCAL_TEST_PERSONA_COOKIE,
  getLocalPortalBaseUrl,
  resolveLocalTestLocale,
  resolveLocalTestPersona,
  type LocalTestPortalId,
} from "../../../../../packages/frontend-platform/src/local-testing.js";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const personaId = requestUrl.searchParams.get("persona");
  const portalId = requestUrl.searchParams.get("portal") as LocalTestPortalId | null;
  const locale = resolveLocalTestLocale(requestUrl.searchParams.get("locale"));
  const targetPath = requestUrl.searchParams.get("path") ?? `/${locale}/dashboard`;

  const persona = resolveLocalTestPersona(personaId);
  if (!persona || !portalId || !["employer", "internal", "employee"].includes(portalId)) {
    return NextResponse.redirect(new URL("/?error=Invalid local test launch request.", request.url));
  }

  if (!persona.portalSessions[portalId]) {
    return NextResponse.redirect(new URL(`/?unsupported=${portalId}`, request.url));
  }

  const redirectUrl = new URL(targetPath, getLocalPortalBaseUrl(portalId));
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set(LOCAL_TEST_PERSONA_COOKIE, persona.id, { path: "/", sameSite: "lax" });
  response.cookies.set(LOCAL_TEST_LOCALE_COOKIE, locale, { path: "/", sameSite: "lax" });
  return response;
}
