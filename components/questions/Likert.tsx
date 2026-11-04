"use client";

import type { LikertQ } from "@/lib/types";
import { Kbd, useHotkeys, type QProps } from "./shared";

const FACES = ["😠", "🙁", "😐", "🙂", "😃"];

export function Likert(props: QProps<LikertQ>) {
  return props.q.labels?.length === 5 ? <LabeledLikert {...props} labels={props.q.labels} /> : <FacesLikert {...props} />;
}

/** 5 options en toutes lettres, de l'accord total (en haut / à gauche) au désaccord total. */
function LabeledLikert({ q, locale, answer, onAnswer, labels }: QProps<LikertQ> & { labels: NonNullable<LikertQ["labels"]> }) {
  const chosen = answer && "level" in answer ? answer.level : undefined;
  const levels = [5, 4, 3, 2, 1];

  useHotkeys((key) => {
    const level = levels[Number(key) - 1];
    if (level) onAnswer({ level });
  });

  return (
    <div role="radiogroup" aria-label={q.prompt[locale]} className="grid gap-2 sm:grid-cols-5 sm:gap-3">
      {levels.map((level, i) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={chosen === level}
          className="choice min-h-12 py-2.5 sm:min-h-24 sm:flex-col sm:justify-center sm:px-2 sm:text-center sm:text-sm"
          onClick={() => onAnswer({ level })}
        >
          <span className="flex-1 sm:w-full sm:flex-none sm:text-center">{labels[level - 1][locale]}</span>
          <Kbd>{i + 1}</Kbd>
        </button>
      ))}
    </div>
  );
}

function FacesLikert({ q, locale, answer, onAnswer }: QProps<LikertQ>) {
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
