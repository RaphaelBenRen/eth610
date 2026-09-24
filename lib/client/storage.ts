"use client";

/*
 * Tout l'état du parcours vit dans sessionStorage : il survit à un rechargement de page
 * mais disparaît quand l'onglet est fermé. Aucun cookie, aucun suivi.
 */

export const KEYS = {
  consent: "ia-consent",
  flow: "ia-flow",
  session: "ia-session",
  pending: "ia-pending",
  result: "ia-result",
} as const;

export function load<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function save(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* navigation privée ou stockage plein : le parcours continue sans sauvegarde */
  }
}

export function remove(...keys: string[]) {
  try {
    for (const k of keys) sessionStorage.removeItem(k);
  } catch {}
}

/** Remet tout à zéro pour un nouveau passage (garde le consentement). */
export function resetRun() {
  remove(KEYS.flow, KEYS.session, KEYS.pending, KEYS.result);
}
