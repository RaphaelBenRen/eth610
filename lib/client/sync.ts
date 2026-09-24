"use client";

import type { AnswerValue, Locale, Phase } from "@/lib/types";
import { KEYS, load, save } from "./storage";

/*
 * File d'envoi des réponses au serveur, en arrière-plan.
 * L'interface n'attend jamais le réseau : en cas d'erreur, on réessaie plus tard
 * (la file est sauvegardée en sessionStorage, donc survit à un rechargement).
 */

type Job =
  | { kind: "answer"; phase: Phase; questionId: string; value: AnswerValue; timeMs: number }
  | { kind: "complete" };

let locale: Locale = "fr";
let running = false;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let failures = 0;

const queue = (): Job[] => load<Job[]>(KEYS.pending) ?? [];

async function post(url: string, body: unknown) {
  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    keepalive: true,
  });
}

async function ensureSession(): Promise<string> {
  const existing = load<string>(KEYS.session);
  if (existing) return existing;
  const res = await post("/api/session", { locale });
  if (!res.ok) throw new Error(`session ${res.status}`);
  const { sessionId } = (await res.json()) as { sessionId: string };
  save(KEYS.session, sessionId);
  return sessionId;
}

function scheduleRetry() {
  clearTimeout(retryTimer);
  failures++;
  const delay = Math.min(30_000, 1000 * 2 ** failures);
  retryTimer = setTimeout(flush, delay);
}

export async function flush(): Promise<void> {
  if (running) return;
  running = true;
  try {
    while (queue().length > 0) {
      const job = queue()[0];
      let res: Response;
      try {
        const sessionId = await ensureSession();
        res =
          job.kind === "answer"
            ? await post("/api/answer", { sessionId, ...job })
            : await post("/api/complete", { sessionId });
      } catch {
        scheduleRetry();
        return;
      }
      if (res.status >= 500 || res.status === 429) {
        scheduleRetry();
        return;
      }
      if (res.status === 404) {
        // Session expirée ou inconnue : on abandonne ces réponses plutôt que de boucler.
        save(KEYS.pending, []);
        return;
      }
      // Succès, ou 400 (réponse invalide qu'aucun réessai ne corrigera) : on passe au suivant.
      failures = 0;
      save(KEYS.pending, queue().slice(1));
    }
  } finally {
    running = false;
  }
}

function enqueue(job: Job) {
  save(KEYS.pending, [...queue(), job]);
  void flush();
}

export const sync = {
  setLocale(l: Locale) {
    locale = l;
  },
  /** Crée la session dès le début du parcours (sans bloquer). */
  start() {
    void ensureSession().catch(() => scheduleRetry());
    void flush();
  },
  answer(phase: Phase, questionId: string, value: AnswerValue, timeMs: number) {
    enqueue({ kind: "answer", phase, questionId, value, timeMs });
  },
  complete() {
    enqueue({ kind: "complete" });
  },
  flush,
};
