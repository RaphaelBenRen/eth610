"use client";

import { CONTENT_VERSION } from "@/content";

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

/** Au-delà, le serveur refuse les réponses (session expirée à 2 h) : on repart de zéro plutôt que de les perdre. */
const RUN_MAX_AGE_MS = 110 * 60 * 1000;

/** Parcours en cours, s'il est encore valable (mêmes questions, pas trop ancien). */
export function loadRun<T extends { version: string; startedAt: number }>(): T | null {
  const run = load<T>(KEYS.flow);
  if (!run) return null;
  if (run.version === CONTENT_VERSION && Date.now() - run.startedAt < RUN_MAX_AGE_MS) return run;
  resetRun();
  return null;
}

/** Le parcours de cet onglet est terminé (page de fin atteinte, rien de relancé depuis). */
export const hasFinished = () => load(KEYS.result) !== null && load(KEYS.flow) === null;

/** Remet tout à zéro pour un nouveau passage (garde le consentement). */
export function resetRun() {
  remove(KEYS.flow, KEYS.session, KEYS.pending, KEYS.result);
}
