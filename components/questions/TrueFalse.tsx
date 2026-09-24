"use client";

import type { TrueFalseQ } from "@/lib/types";
import { Kbd, useHotkeys, type QProps } from "./shared";

export function TrueFalse({ q, t, answer, revealed, onAnswer }: QProps<TrueFalseQ>) {
  const chosen = answer && "choice" in answer ? answer.choice : undefined;
  const opts = [
    { id: "true", label: t.flow.true, emoji: "👍", key: "1" },
    { id: "false", label: t.flow.false, emoji: "👎", key: "2" },
  ];

  useHotkeys((key) => {
    const o = opts.find((x) => x.key === key || x.label[0].toLowerCase() === key.toLowerCase());
    if (o) onAnswer({ choice: o.id });
  }, !revealed);

  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o) => {
        const isCorrect = String(q.correct) === o.id;
        const state = revealed ? (isCorrect ? "is-correct" : o.id === chosen ? "is-wrong" : "opacity-60") : "";
        return (
          <button
            key={o.id}
            type="button"
            className={`choice ${state} min-h-28 flex-col justify-center text-center text-lg`}
            aria-pressed={!revealed && o.id === chosen}
            disabled={revealed}
            onClick={() => onAnswer({ choice: o.id })}
          >
            <span className="text-3xl" aria-hidden>{o.emoji}</span>
            <span className="font-semibold">{o.label}</span>
            {!revealed && <Kbd>{o.key}</Kbd>}
          </button>
        );
      })}
    </div>
  );
}
