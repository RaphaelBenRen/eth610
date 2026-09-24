import { jwtVerify, SignJWT } from "jose";

export const ADMIN_COOKIE = "admin_session";
const MAX_AGE_S = 8 * 60 * 60;

const isProd = () => Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

/** En développement local, des valeurs par défaut évitent d'avoir à configurer quoi que ce soit. */
function secret() {
  const s = process.env.ADMIN_SESSION_SECRET?.trim() || (isProd() ? undefined : "dev-secret-change-me-dev-secret-change-me");
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET manquante ou trop courte (32 caractères min.)");
  return new TextEncoder().encode(s);
}

export function adminPassword(): string {
  // trim : un retour à la ligne collé par erreur dans Vercel ne doit pas bloquer la connexion.
  const p = process.env.ADMIN_PASSWORD?.trim() || (isProd() ? undefined : "admin");
  if (!p) throw new Error("ADMIN_PASSWORD manquante");
  return p;
}

export async function signAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_S}s`)
    .sign(secret());
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: isProd(),
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE_S,
};

/** Comparaison en temps constant (évite les attaques par mesure du temps de réponse). */
export function safeEqual(a: string, b: string) {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  let diff = ea.length ^ eb.length;
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) diff |= (ea[i] ?? 0) ^ (eb[i] ?? 0);
  return diff === 0;
}
