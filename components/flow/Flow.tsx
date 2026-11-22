"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { CONTENT, CONTENT_VERSION } from "@/content";
import { hasFinished, KEYS, load, loadRun, remove, save } from "@/lib/client/storage";
import { sync } from "@/lib/client/sync";
import { isBrowser, useHydrated } from "@/lib/client/useHydrated";
import { score as scoreOf } from "@/lib/scoring";
import type { AnswerValue, Locale, Phase, Question } from "@/lib/types";
import type { Dict } from "@/messages";
import { Photo, PhotoPreloader } from "../Photo";
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

const SIZES = {
  survey: "(min-width: 768px) 672px, 100vw",
  quiz: "(min-width: 1024px) 400px, 100vw",
  break: "(min-width: 1024px) 976px, 100vw",
};
const BREAK_IMAGE = { quiz: "servers-corridor", post: "bulbs" } as const;

/** Photos des deux prochains écrans, à charger pendant qu'on lit l'écran courant. */
const upcomingPhotos = (index: number) =>
  SCREENS.slice(index + 1, index + 3).flatMap((s) =>
    s.kind === "break"
      ? [{ name: BREAK_IMAGE[s.to], sizes: SIZES.break }]
      : s.q.image
        ? [{ name: s.q.image, sizes: s.phase === "quiz" ? SIZES.quiz : SIZES.survey }]
        : [],
  );

type FlowState = {
  /** Version des questions et heure de début : un parcours périmé n'est pas repris. */
  version: string;
  startedAt: number;
  index: number;
  answers: Record<string, AnswerValue>;
  scores: Record<string, number>;
  /** Quiz : la correction de la question courante est affichée. */
  revealed: boolean;
};

const newRun = (): FlowState => ({ version: CONTENT_VERSION, startedAt: Date.now(), index: 0, answers: {}, scores: {}, revealed: false });
const keyOf = (phase: Phase, id: string) => `${phase}:${id}`;

/** Nombre de réponses considérées comme justes au quiz. */
export const countCorrect = (scores: Record<string, number>) =>
  CONTENT.quiz.filter((q) => (scores[keyOf("quiz", q.id)] ?? 0) >= 0.8).length;

export function Flow({ locale, t }: { locale: Locale; t: Dict }) {
  const router = useRouter();
  const hydrated = useHydrated();
  // Parcours déjà terminé (bouton « retour » du navigateur) : on ne le rejoue pas sur la même session.
  const [finished] = useState(() => isBrowser && hasFinished());
  const [state, setState] = useState<FlowState | null>(() => (isBrowser && !hasFinished() ? (loadRun<FlowState>() ?? newRun()) : null));
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
    if (finished) {
      router.replace(`/${locale}/merci`);
      return;
    }
    sync.setLocale(locale);
    sync.start();
  }, [finished, locale, router]);

  useEffect(() => {
    if (state) save(KEYS.flow, state);
  }, [state]);

  const index = state?.index;
  useEffect(() => {
    shownAt.current = performance.now();
    advancing.current = false;
  }, [index]);

  const finish = useCallback(
    (s: FlowState) => {
      save(KEYS.result, { correct: countCorrect(s.scores), total: CONTENT.quiz.length });
      sync.complete();
      remove(KEYS.flow);
      // replace : le bouton « retour » ramène à l'accueil, pas dans un parcours déjà terminé.
      router.replace(`/${locale}/merci`);
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

  const isQuiz = screen.kind === "q" ? screen.phase === "quiz" : screen.to === "quiz";
  const questionKey = screen.kind === "q" ? keyOf(screen.phase, screen.q.id) : "";

  const theme = isQuiz ? "theme-quiz" : "";

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-8 sm:px-6">
        <PhotoPreloader photos={upcomingPhotos(state.index)} />
        {/* Fond opaque, sans flou : le flou d'arrière-plan fait scintiller Safari pendant les animations. */}
        <div className={`sticky top-0 z-20 -mx-4 bg-bg px-4 pt-3 pb-3 sm:-mx-6 sm:px-6 ${theme}`}>
          <Progress t={t} phase={phase} fracInPhase={frac} />
        </div>

        {/* Couleur et largeur sont portées par l'écran lui-même : celui qui sort garde les siennes jusqu'au bout.
            Le retour en haut de page se fait entre les deux écrans, jamais pendant qu'on voit l'ancien. */}
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: "instant" })}>
          <motion.section
            key={state.index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.09, ease: "easeIn" } }}
            className={`mx-auto mt-3 w-full md:mt-6 ${theme} ${isQuiz ? "max-w-5xl" : "max-w-2xl"}`}
          >
            {screen.kind === "break" ? (
              <BreakScreen t={t} to={screen.to} scores={state.scores} onNext={() => advanceFrom(state.index)} />
            ) : screen.phase === "quiz" ? (
              <QuizScreen
                screen={screen}
                locale={locale}
                t={t}
                scores={state.scores}
                answer={state.answers[questionKey]}
                revealed={state.revealed}
                onAnswer={onAnswer}
                onNext={() => advanceFrom(state.index)}
              />
            ) : (
              <SurveyScreen
                screen={screen}
                locale={locale}
                t={t}
                answer={state.answers[questionKey]}
                onAnswer={onAnswer}
              />
            )}
          </motion.section>
        </AnimatePresence>

        <div className="mx-auto mt-4 h-12 w-full max-w-2xl">
          {canGoBack && (
            <button type="button" className="btn btn-ghost -ml-3" onClick={() => setState({ ...state, index: state.index - 1 })}>
              ← {t.flow.back}
            </button>
          )}
        </div>
      </div>
    </MotionConfig>
  );
}

type QScreen = Extract<Screen, { kind: "q" }>;

const DIM_EMOJI = { env: "🌍", soc: "👥", eco: "💰" } as const;

function DimChip({ q, t, className = "" }: { q: Question; t: Dict; className?: string }) {
  if (!q.dimension) return null;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <span aria-hidden>{DIM_EMOJI[q.dimension]}</span>
      {t.flow.dims[q.dimension]}
    </span>
  );
}

/** Sondage : grande citation sur fond clair, photo en bandeau. */
function SurveyScreen({
  screen,
  locale,
  t,
  answer,
  onAnswer,
}: {
  screen: QScreen;
  locale: Locale;
  t: Dict;
  answer?: AnswerValue;
  onAnswer: (v: AnswerValue) => void;
}) {
  const { q } = screen;
  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm">
      {q.image && (
        <Photo name={q.image} className="aspect-[16/5]" sizes={SIZES.survey} overlay="bottom">
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 pb-5">
            <DimChip q={q} t={t} className="bg-white/90 text-neutral-900" />
            <span className="rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white">
              {screen.i + 1} / {screen.n}
            </span>
          </div>
        </Photo>
      )}
      <div className="p-5 sm:p-8">
        <p className="text-xs font-bold tracking-widest text-brand uppercase">
          {t.flow.yourOpinion}
          {screen.phase === "post" && <span className="ml-2 tracking-normal text-accent normal-case">· {t.flow.postHint}</span>}
        </p>
        <h1 className="relative mt-3 pl-5 text-lg leading-snug font-semibold text-balance sm:text-xl">
          <span aria-hidden className="absolute top-0 bottom-0 left-0 w-1 rounded-full bg-brand" />
          {q.prompt[locale]}
        </h1>
        {q.help && <p className="mt-1 text-sm text-muted">{q.help[locale]}</p>}
        <div className="mt-6">
          <QuestionView q={q} locale={locale} t={t} answer={answer} revealed={false} onAnswer={onAnswer} />
        </div>
      </div>
    </div>
  );
}

/** Quiz : ambiance « jeu » (orange), photo à gauche sur grand écran, score en direct. */
function QuizScreen({
  screen,
  locale,
  t,
  scores,
  answer,
  revealed,
  onAnswer,
  onNext,
}: {
  screen: QScreen;
  locale: Locale;
  t: Dict;
  scores: Record<string, number>;
  answer?: AnswerValue;
  revealed: boolean;
  onAnswer: (v: AnswerValue) => void;
  onNext: () => void;
}) {
  const { q } = screen;
  return (
    <div className="grid gap-3 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-6">
      {q.image && (
        <Photo
          name={q.image}
          className="aspect-[16/7] rounded-3xl lg:sticky lg:top-24 lg:aspect-auto lg:h-[min(34rem,calc(100svh-8rem))]"
          sizes={SIZES.quiz}
          overlay="bottom"
        >
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end gap-2 p-4 pb-5 lg:p-6 lg:pb-8">
            <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold tracking-wide text-brand-ink uppercase">
              Quiz · {screen.i + 1}/{screen.n}
            </span>
            <DimChip q={q} t={t} className="bg-white/90 text-neutral-900" />
          </div>
        </Photo>
      )}
      <div className="rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-8">
        <ScoreDots scores={scores} current={screen.i} />
        <h1 className="mt-4 text-xl leading-snug font-bold text-balance sm:text-2xl">{q.prompt[locale]}</h1>
        {q.help && <p className="mt-1 text-sm text-muted">{q.help[locale]}</p>}
        <div className="mt-6">
          <QuestionView q={q} locale={locale} t={t} answer={answer} revealed={revealed} onAnswer={onAnswer} />
        </div>
        {revealed && <Feedback q={q} score={scores[keyOf("quiz", q.id)] ?? 0} locale={locale} t={t} onNext={onNext} />}
      </div>
    </div>
  );
}

/** Une pastille par question du quiz : verte (juste), orange (pas loin), rouge (raté), creuse (à venir). */
function ScoreDots({ scores, current }: { scores: Record<string, number>; current: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      {CONTENT.quiz.map((q, i) => {
        const s = scores[keyOf("quiz", q.id)];
        const color =
          s === undefined ? (i === current ? "border-2 border-brand" : "border-2 border-line") : s >= 0.8 ? "bg-good" : s >= 0.4 ? "bg-warn" : "bg-bad";
        return <span key={q.id} className={`h-2.5 rounded-full transition-all ${i === current ? "w-7" : "w-2.5"} ${color}`} />;
      })}
    </div>
  );
}

/** Écran de transition plein cadre, sur photo. */
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
    <Photo name={BREAK_IMAGE[to]} className="min-h-[28rem] rounded-3xl md:min-h-[32rem]" sizes={SIZES.break} overlay="full">
      <div className="relative flex min-h-[28rem] flex-col items-center justify-center px-6 py-12 text-center text-white md:min-h-[32rem]">
        <div className="text-6xl" aria-hidden>{b.emoji}</div>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{b.title}</h1>
        {to === "post" && (
          <p className="mt-5 rounded-2xl bg-white/15 px-5 py-3 text-lg">
            {t.flow.score} <strong>{correct} / {CONTENT.quiz.length}</strong>
          </p>
        )}
        <p className="mt-4 max-w-md text-white/85">{b.text.replace("{n}", String(CONTENT.quiz.length))}</p>
        <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={onNext} autoFocus>
          {b.cta} →
        </button>
      </div>
    </Photo>
  );
}
