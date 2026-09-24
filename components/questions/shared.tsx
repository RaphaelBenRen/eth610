"use client";

import { useEffect, useRef } from "react";
import type { Dict } from "@/messages";
import type { AnswerValue, Locale, Question } from "@/lib/types";

export type QProps<T extends Question = Question> = {
  q: T;
  locale: Locale;
  t: Dict;
  /** Réponse déjà donnée (retour en arrière ou correction affichée). */
  answer?: AnswerValue;
  /** Quiz : la correction est affichée, la question est verrouillée. */
  revealed: boolean;
  onAnswer: (v: AnswerValue) => void;
};

/**
 * Raccourci clavier global (pratique sur ordinateur).
 * Ignoré quand le focus est sur un bouton ou un lien, pour ne pas doubler l'action native d'Entrée.
 */
export function useHotkeys(handler: (key: string) => void, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (e.key === "Enter" && (tag === "BUTTON" || tag === "A")) return;
      ref.current(e.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled]);
}

export function SubmitButton({ t, disabled, onClick }: { t: Dict; disabled?: boolean; onClick: () => void }) {
  return (
    <div className="mt-6 flex justify-end">
      <button type="button" className="btn btn-primary w-full sm:w-auto" disabled={disabled} onClick={onClick}>
        {t.flow.validate}
      </button>
    </div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <span className="kbd" aria-hidden>
      {children}
    </span>
  );
}
