"use client";

import { motion } from "motion/react";
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
    // Sur mobile, la carte peut être sous la ligne de flottaison : on la fait défiler.
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    btn.current?.focus({ preventScroll: true });
  }, []);

  const explanation = "explanation" in q ? q.explanation : undefined;
  const source = "source" in q ? q.source : undefined;
  const comparison = q.type === "estimate" ? q.comparison?.[locale] : undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`mt-6 scroll-mb-6 rounded-2xl border-2 p-5 ${s.box}`}
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
      {source && (
        <p className="mt-3 text-sm text-muted">
          {t.flow.feedback.source}{" "}
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
            {source.label}
          </a>
        </p>
      )}
      <div className="mt-5 flex justify-end">
        <button ref={btn} type="button" className="btn btn-primary w-full sm:w-auto" onClick={onNext}>
          {t.flow.next} →
        </button>
      </div>
    </motion.div>
  );
}
