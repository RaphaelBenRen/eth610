import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, adminCookieOptions, adminPassword, safeEqual, signAdminToken } from "@/lib/admin-auth";

const Body = z.object({ password: z.string().max(200) });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });

  let token: string;
  let expected: string;
  try {
    expected = adminPassword();
    token = await signAdminToken();
  } catch (e) {
    // Variable d'environnement manquante : on le dit clairement plutôt que « mot de passe incorrect ».
    return Response.json({ error: "config", message: (e as Error).message }, { status: 500 });
  }

  if (!safeEqual(parsed.data.password.trim(), expected)) {
    // Petit délai pour ralentir les essais en série.
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ error: "wrong password" }, { status: 401 });
  }

  (await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions);
  return Response.json({ ok: true });
}
