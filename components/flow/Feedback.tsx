"use client";

import { useEffect, useRef } from "react";
import { formatCorrect } from "@/lib/format";
import { verdict } from "@/lib/scoring";
import type { Locale, Question } from "@/lib/types";
import type { Dict } from "@/messages";

const STYLE = {
  right: { emoji: "🎉", box: "border-good bg-good-soft", title: "text-good" },
  close: { emoji: "👌", box: "border-warn bg-warn-soft", title: "text-warn" },
  wrong: { emoji: "💡", box: "border-bad bg-bad-soft", title: "text-bad" },
};

/** Carte de correction affichée après chaque réponse du quiz. */
export function Feedback({
  q,
  score,
  locale,
  t,
  onNext,
}: {
  q: Question;
  score: number;
  locale: Locale;
  t: Dict;
  onNext: () => void;
}) {
  const v = verdict(score);
  const s = STYLE[v];
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // On descend juste assez pour lire la correction, en gardant son titre (et le curseur au-dessus) visibles :
    // la carte ne remonte jamais plus haut que la moitié de l'écran, donc jamais sous la barre de progression.
    const box = ref.current?.getBoundingClientRect();
    if (box) {
      const toShowAll = box.bottom + 24 - window.innerHeight;
      const toMidScreen = box.top - window.innerHeight * 0.52;
      const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top = Math.max(0, Math.min(toShowAll, toMidScreen));
      if (top > 0) window.scrollBy({ top, behavior: calm ? "instant" : "smooth" });
    }
    // Sur écran tactile, le focus ferait apparaître un halo autour du bouton.
    if (window.matchMedia("(hover: hover)").matches) btn.current?.focus({ preventScroll: true });
  }, []);

  const explanation = "explanation" in q ? q.explanation : undefined;
  const raw = "source" in q ? q.source : undefined;
  const sources = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
  const comparison = q.type === "estimate" ? q.comparison?.[locale] : undefined;

  return (
    <div
      ref={ref}
      className={`soft-in mt-6 rounded-2xl border-2 p-5 ${s.box}`}
      role="status"
      aria-live="polite"
    >
      <p className={`text-lg font-bold ${s.title}`}>
        <span aria-hidden>{s.emoji} </span>
        {t.flow.feedback[v]}
      </p>
      {v !== "right" &&
        (q.type === "ranking" && q.correct ? (
          <div className="mt-2 font-semibold">
            {t.flow.feedback.answerIs}
            <ol className="mt-1 list-inside list-decimal font-medium">
              {q.correct.map((id) => (
                <li key={id}>{q.items.find((it) => it.id === id)?.label[locale]}</li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="mt-2 font-semibold">
            {t.flow.feedback.answerIs} {formatCorrect(q, locale, t)}
          </p>
        ))}
      {comparison && <p className="mt-1 font-medium">{comparison}</p>}
      {explanation && <p className="mt-2 leading-relaxed">{explanation[locale]}</p>}
      {sources.length > 0 && (
        <div className="mt-3 text-sm text-muted">
          {sources.length > 1 ? t.flow.feedback.sources : t.flow.feedback.source}
          <ul className={sources.length > 1 ? "mt-1 list-inside list-disc space-y-0.5" : "inline"}>
            {sources.map((src) => (
              <li key={src.url} className={sources.length > 1 ? "" : "inline"}>
                {sources.length === 1 && " "}
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <button ref={btn} type="button" className="btn btn-primary w-full sm:w-auto" onClick={onNext}>
          {t.flow.next} →
        </button>
      </div>
    </div>
  );
}
