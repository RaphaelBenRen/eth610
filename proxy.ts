import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/types";

function preferredLocale(req: NextRequest): Locale {
  const header = req.headers.get("accept-language") ?? "";
  const langs = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.slice(0, 2).toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  return (langs.find((l) => (LOCALES as readonly string[]).includes(l.lang))?.lang as Locale) ?? DEFAULT_LOCALE;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dashboard admin et API admin : cookie de session obligatoire (sauf page et route de connexion).
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";
  if (isAdminPage || isAdminApi) {
    const ok = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
    if (!ok) {
      if (isAdminApi) return Response.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return;
  }
  if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

  // Pages publiques : ajoute la langue dans l'URL si elle manque (/ → /fr).
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) return;
  const url = req.nextUrl.clone();
  url.pathname = `/${preferredLocale(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Tout sauf les fichiers statiques et internes de Next.
  matcher: ["/((?!_next/|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|.*\\..*).*)"],
};
