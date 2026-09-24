"use client";

import type { SingleQ } from "@/lib/types";
import { Kbd, useHotkeys, type QProps } from "./shared";

export function Single({ q, locale, answer, revealed, onAnswer }: QProps<SingleQ>) {
  const chosen = answer && "choice" in answer ? answer.choice : undefined;

  useHotkeys((key) => {
    const i = Number(key) - 1;
    if (q.options[i]) onAnswer({ choice: q.options[i].id });
  }, !revealed);

  return (
    <div className={`grid gap-3 ${q.options.length === 4 ? "md:grid-cols-2" : ""}`}>
      {q.options.map((o, i) => {
        const state = revealed
          ? o.id === q.correct
            ? "is-correct"
            : o.id === chosen
              ? "is-wrong"
              : "opacity-60"
          : "";
        return (
          <button
            key={o.id}
            type="button"
            className={`choice ${state}`}
            aria-pressed={!revealed && o.id === chosen}
            disabled={revealed}
            onClick={() => onAnswer({ choice: o.id })}
          >
            {o.emoji && <span className="text-2xl" aria-hidden>{o.emoji}</span>}
            <span className="flex-1">{o.label[locale]}</span>
            {revealed && o.id === q.correct && <span aria-hidden>✅</span>}
            {revealed && o.id === chosen && o.id !== q.correct && <span aria-hidden>❌</span>}
            {!revealed && <Kbd>{i + 1}</Kbd>}
          </button>
        );
      })}
    </div>
  );
}
