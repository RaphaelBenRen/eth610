"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTENT } from "@/content";
import { KEYS, load, remove, save } from "@/lib/client/storage";
import { sync } from "@/lib/client/sync";
import { isBrowser, useHydrated } from "@/lib/client/useHydrated";
import { score as scoreOf } from "@/lib/scoring";
import type { AnswerValue, Locale, Phase, Question } from "@/lib/types";
import type { Dict } from "@/messages";
import { QuestionView } from "../questions/QuestionView";
import { useHotkeys } from "../questions/shared";
import { Feedback } from "./Feedback";
import { Progress } from "./Progress";

type Screen =
  | { kind: "q"; phase: Phase; q: Question; i: number; n: number }
  | { kind: "break"; to: "quiz" | "post" };

const phaseScreens = (phase: Phase): Screen[] =>
  CONTENT[phase].map((q, i, all) => ({ kind: "q", phase, q, i, n: all.length }));

const SCREENS: Screen[] = [
  ...phaseScreens("pre"),
  { kind: "break", to: "quiz" },
  ...phaseScreens("quiz"),
  { kind: "break", to: "post" },
  ...phaseScreens("post"),
];

type FlowState = {
  index: number;
  answers: Record<string, AnswerValue>;
  scores: Record<string, number>;
  /** Quiz : la correction de la question courante est affichée. */
  revealed: boolean;
};

const INITIAL: FlowState = { index: 0, answers: {}, scores: {}, revealed: false };
const keyOf = (phase: Phase, id: string) => `${phase}:${id}`;

/** Nombre de réponses considérées comme justes au quiz. */
export const countCorrect = (scores: Record<string, number>) =>
  CONTENT.quiz.filter((q) => (scores[keyOf("quiz", q.id)] ?? 0) >= 0.8).length;

export function Flow({ locale, t }: { locale: Locale; t: Dict }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [state, setState] = useState<FlowState | null>(() => (isBrowser ? (load<FlowState>(KEYS.flow) ?? INITIAL) : null));
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  const shownAt = useRef(0);
  const advancing = useRef(false);

  // Sans consentement (accès direct à l'URL), retour à l'accueil.
  useEffect(() => {
    if (!load<boolean>(KEYS.consent)) {
      router.replace(`/${locale}`);
      return;
    }
    sync.setLocale(locale);
    sync.start();
  }, [locale, router]);

  useEffect(() => {
    if (state) save(KEYS.flow, state);
  }, [state]);

  const index = state?.index;
  useEffect(() => {
    shownAt.current = performance.now();
    advancing.current = false;
    window.scrollTo({ top: 0 });
  }, [index]);

  const finish = useCallback(
    (s: FlowState) => {
      save(KEYS.result, { correct: countCorrect(s.scores), total: CONTENT.quiz.length });
      sync.complete();
      remove(KEYS.flow);
      router.push(`/${locale}/merci`);
    },
    [locale, router],
  );

  /**
   * Passe à l'écran suivant, seulement si `from` est bien l'écran courant.
   * Évite qu'un double-clic sur l'écran en train de disparaître (animation) ne fasse revenir en arrière.
   */
  const advanceFrom = useCallback(
    (from: number) => {
      const s = stateRef.current;
      if (!s || s.index !== from) return;
      if (from + 1 >= SCREENS.length) finish(s);
      else setState({ ...s, index: from + 1, revealed: false });
    },
    [finish],
  );

  const screen = state ? SCREENS[Math.min(state.index, SCREENS.length - 1)] : undefined;

  useHotkeys((key) => {
    if (key === "Enter" && screen?.kind === "break") advanceFrom(state!.index);
  }, screen?.kind === "break");

  if (!hydrated || !state || !screen) return <div className="min-h-[60vh]" />;

  const onAnswer = (value: AnswerValue) => {
    const cur = stateRef.current;
    if (screen.kind !== "q" || !cur || cur.index !== state.index || cur.revealed || advancing.current) return;
    const { phase, q } = screen;
    const k = keyOf(phase, q.id);
    const timeMs = Math.round(performance.now() - shownAt.current);
    sync.answer(phase, q.id, value, timeMs);

    if (phase === "quiz") {
      const s = scoreOf(q, value) ?? 0;
      setState({ ...cur, answers: { ...cur.answers, [k]: value }, scores: { ...cur.scores, [k]: s }, revealed: true });
    } else {
      // Sondage : on laisse voir la sélection un court instant, puis on avance.
      advancing.current = true;
      setState({ ...cur, answers: { ...cur.answers, [k]: value } });
      setTimeout(() => advanceFrom(cur.index), 280);
    }
  };

  const prev = SCREENS[state.index - 1];
  const canGoBack = screen.kind === "q" && screen.phase !== "quiz" && prev?.kind === "q" && prev.phase === screen.phase;

  const phase: Phase = screen.kind === "q" ? screen.phase : screen.to;
  const frac = screen.kind === "q" ? screen.i / screen.n : 0;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 pb-8 sm:px-6">
      <div className="sticky top-0 z-20 -mx-4 bg-bg/90 px-4 pt-3 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Progress t={t} phase={phase} fracInPhase={frac} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={state.index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="mt-4 flex-1 md:mt-8 md:rounded-3xl md:border md:border-line md:bg-surface md:p-10 md:shadow-sm"
        >
          {screen.kind === "break" ? (
            <BreakScreen t={t} to={screen.to} scores={state.scores} onNext={() => advanceFrom(state.index)} />
          ) : (
            <>
              <p className="text-sm font-medium text-muted">
                {t.flow.question} {screen.i + 1} {t.flow.of} {screen.n}
                {screen.phase === "post" && <span className="ml-2 text-accent">· {t.flow.postHint}</span>}
              </p>
              <h1 className="mt-2 text-xl leading-snug font-bold text-balance sm:text-2xl">{screen.q.prompt[locale]}</h1>
              {screen.q.help && <p className="mt-1 text-sm text-muted">{screen.q.help[locale]}</p>}
              <div className="mt-6">
                <QuestionView
                  q={screen.q}
                  locale={locale}
                  t={t}
                  answer={state.answers[keyOf(screen.phase, screen.q.id)]}
                  revealed={state.revealed}
                  onAnswer={onAnswer}
                />
              </div>
              {state.revealed && (
                <Feedback
                  q={screen.q}
                  score={state.scores[keyOf("quiz", screen.q.id)] ?? 0}
                  locale={locale}
                  t={t}
                  onNext={() => advanceFrom(state.index)}
                />
              )}
            </>
          )}
        </motion.section>
      </AnimatePresence>

      <div className="mt-4 h-12">
        {canGoBack && (
          <button type="button" className="btn btn-ghost -ml-3" onClick={() => setState({ ...state, index: state.index - 1 })}>
            ← {t.flow.back}
          </button>
        )}
      </div>
    </div>
  );
}

function BreakScreen({
  t,
  to,
  scores,
  onNext,
}: {
  t: Dict;
  to: "quiz" | "post";
  scores: Record<string, number>;
  onNext: () => void;
}) {
  const b = t.flow.breaks[to];
  const correct = countCorrect(scores);
  return (
    <div className="flex flex-col items-center py-10 text-center md:py-6">
      <div className="text-6xl" aria-hidden>{b.emoji}</div>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">{b.title}</h1>
      {to === "post" && (
        <p className="mt-4 rounded-2xl bg-brand-soft px-5 py-3 text-lg">
          {t.flow.score} <strong>{correct} / {CONTENT.quiz.length}</strong>
        </p>
      )}
      <p className="mt-4 max-w-md text-muted">{b.text}</p>
      <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={onNext} autoFocus>
        {b.cta} →
      </button>
    </div>
  );
}
