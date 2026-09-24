"use client";

import type { LikertQ } from "@/lib/types";
import { useHotkeys, type QProps } from "./shared";

const FACES = ["😠", "🙁", "😐", "🙂", "😃"];

export function Likert({ q, locale, answer, onAnswer }: QProps<LikertQ>) {
  const chosen = answer && "level" in answer ? answer.level : undefined;

  useHotkeys((key) => {
    const n = Number(key);
    if (n >= 1 && n <= 5) onAnswer({ level: n });
  });

  return (
    <div role="radiogroup" aria-label={q.prompt[locale]}>
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={chosen === n}
            aria-label={n === 1 ? q.minLabel[locale] : n === 5 ? q.maxLabel[locale] : String(n)}
            className="choice aspect-square min-h-0 flex-col justify-center gap-1 px-0 text-center sm:aspect-auto sm:min-h-24"
            onClick={() => onAnswer({ level: n })}
          >
            <span className="text-2xl sm:text-3xl" aria-hidden>{FACES[n - 1]}</span>
            <span className="text-sm font-semibold text-muted">{n}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 flex justify-between gap-4 text-sm text-muted">
        <span>← {q.minLabel[locale]}</span>
        <span className="text-right">{q.maxLabel[locale]} →</span>
      </div>
    </div>
  );
}
