"use client";

import { useState } from "react";
import { demoQuestions } from "@/content/demo";
import { score } from "@/lib/scoring";
import type { AnswerValue, Locale } from "@/lib/types";
import type { Dict } from "@/messages";
import { Feedback } from "./flow/Feedback";
import { QuestionView } from "./questions/QuestionView";

/** Galerie de tous les types de questions (rien n'est enregistré). */
export function DemoGallery({ locale, t }: { locale: Locale; t: Dict }) {
  return (
    <div className="grid gap-6">
      {demoQuestions.map((d) => (
        <DemoCard key={d.q.id} {...d} locale={locale} t={t} />
      ))}
    </div>
  );
}

function DemoCard({ label, quiz, q, locale, t }: (typeof demoQuestions)[number] & { locale: Locale; t: Dict }) {
  const [answer, setAnswer] = useState<AnswerValue>();
  const [round, setRound] = useState(0);
  const revealed = quiz && answer !== undefined;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 sm:p-8">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{label}</span>
        <button type="button" className="text-sm text-muted underline" onClick={() => { setAnswer(undefined); setRound((r) => r + 1); }}>
          ↺ reset
        </button>
      </div>
      <h2 className="mt-3 text-xl font-bold">{q.prompt[locale]}</h2>
      <div className="mt-5">
        <QuestionView key={round} q={q} locale={locale} t={t} answer={answer} revealed={revealed} onAnswer={setAnswer} />
      </div>
      {revealed && <Feedback q={q} score={score(q, answer) ?? 0} locale={locale} t={t} onNext={() => { setAnswer(undefined); setRound((r) => r + 1); }} />}
      {!quiz && answer && <pre className="mt-4 rounded-xl bg-surface-2 p-3 text-xs">{JSON.stringify(answer)}</pre>}
    </section>
  );
}
