"use client";

import type { ABQ } from "@/lib/types";
import { Kbd, useHotkeys, type QProps } from "./shared";

export function AB({ q, locale, t, answer, revealed, onAnswer }: QProps<ABQ>) {
  const chosen = answer && "choice" in answer ? answer.choice : undefined;
  const sides = [
    { id: "a" as const, opt: q.a, key: "1" },
    { id: "b" as const, opt: q.b, key: "2" },
  ];

  useHotkeys((key) => {
    const s = sides.find((x) => x.key === key || x.id === key.toLowerCase());
    if (s) onAnswer({ choice: s.id });
  }, !revealed);

  return (
    <div className="relative grid gap-3 sm:grid-cols-2 sm:gap-6">
      {sides.map((s) => {
        const state = revealed ? (s.id === q.correct ? "is-correct" : s.id === chosen ? "is-wrong" : "opacity-60") : "";
        return (
          <button
            key={s.id}
            type="button"
            className={`choice ${state} min-h-32 flex-col justify-center gap-2 text-center text-lg sm:min-h-44`}
            aria-pressed={!revealed && s.id === chosen}
            disabled={revealed}
            onClick={() => onAnswer({ choice: s.id })}
          >
            {s.opt.emoji && <span className="text-4xl sm:text-5xl" aria-hidden>{s.opt.emoji}</span>}
            <span className="font-semibold">{s.opt.label[locale]}</span>
            {!revealed && <Kbd>{s.key}</Kbd>}
          </button>
        );
      })}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-xs font-bold text-muted uppercase"
      >
        {t.flow.or}
      </span>
    </div>
  );
}
