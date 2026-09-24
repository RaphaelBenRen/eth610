import { getStore } from "./db";

/** Une session n'accepte plus de réponses après ce délai. */
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

export async function getOpenSession(id: string) {
  const s = await getStore().getSession(id);
  if (!s) return null;
  if (Date.now() - new Date(s.started_at).getTime() > SESSION_TTL_MS) return null;
  return s;
}
