import { CONTENT } from "@/content";
import type { AnswerRow, SessionRow } from "./db";
import { gaugeBounds, numericValue } from "./scoring";
import { PHASES, type Phase, type Question } from "./types";

/* Agrégations pour le dashboard admin. Fonctions pures, calculées côté serveur. */

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

export type Bar = { label: string; count: number; share: number; correct?: boolean };

export type QuestionStats = {
  phase: Phase;
  q: Question;
  n: number;
  /** Quiz : justesse moyenne (0-1). */
  successRate: number | null;
  medianTimeMs: number | null;
  bars: Bar[];
  /** Jauge / estimation : moyenne, médiane, bonne réponse. */
  summary?: { mean: number; median: number; correct?: number; unit?: string };
  /** Classement : position moyenne de chaque élément + % de classements parfaits. */
  ranking?: { items: { label: string; avgPos: number; correctPos: number }[]; perfect: number };
};

export type PrePost = {
  q: Question;
  n: number;
  scaleMin: number;
  scaleMax: number;
  meanPre: number;
  meanPost: number;
  up: number;
  same: number;
  down: number;
};

export type Stats = {
  kpis: {
    started: number;
    completed: number;
    completionRate: number | null;
    medianDurationS: number | null;
    avgQuizScore: number | null;
    locales: Record<string, number>;
    devices: Record<string, number>;
  };
  prePost: PrePost[];
  questions: QuestionStats[];
  funnel: { label: string; n: number }[];
};

function histogram(q: Question, values: number[]): Bar[] {
  if (q.type === "gauge") {
    const { min, max } = gaugeBounds(q);
    const bins = 10;
    const w = (max - min) / bins;
    const counts = new Array(bins).fill(0);
    for (const v of values) counts[Math.min(bins - 1, Math.floor((v - min) / w))]++;
    return counts.map((c, i) => {
      const lo = min + i * w;
      const hi = lo + w;
      return {
        label: `${fmt(lo)}–${fmt(hi)}${q.unit ?? ""}`,
        count: c,
        share: values.length ? c / values.length : 0,
        correct: q.correct !== undefined && q.correct >= lo && (q.correct < hi || i === bins - 1),
      };
    });
  }
  if (q.type === "estimate") {
    const lo = Math.floor(Math.log10(q.min));
    const hi = Math.ceil(Math.log10(q.max));
    const bars: Bar[] = [];
    for (let e = lo; e < hi; e++) {
      const a = 10 ** e;
      const b = 10 ** (e + 1);
      const c = values.filter((v) => v >= a && (v < b || (e === hi - 1 && v <= b))).length;
      bars.push({
        label: `${fmt(a)}–${fmt(b)} ${q.unit.fr}`,
        count: c,
        share: values.length ? c / values.length : 0,
        correct: q.correct !== undefined && q.correct >= a && q.correct < b,
      });
    }
    return bars;
  }
  return [];
}

const fmt = (n: number) => new Intl.NumberFormat("fr-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n);

function questionStats(phase: Phase, q: Question, rows: AnswerRow[]): QuestionStats {
  const n = rows.length;
  const quizRows = rows.filter((r) => r.correctness !== null);
  const base: QuestionStats = {
    phase,
    q,
    n,
    successRate: phase === "quiz" ? mean(quizRows.map((r) => r.correctness!)) : null,
    medianTimeMs: median(rows.map((r) => r.time_ms).filter((t): t is number => t !== null)),
    bars: [],
  };
  const share = (c: number) => (n ? c / n : 0);
  const count = (pred: (r: AnswerRow) => boolean) => rows.filter(pred).length;
  const choiceOf = (r: AnswerRow) => ("choice" in r.value ? r.value.choice : undefined);

  switch (q.type) {
    case "single":
      base.bars = q.options.map((o) => {
        const c = count((r) => choiceOf(r) === o.id);
        return { label: o.label.fr, count: c, share: share(c), correct: q.correct ? o.id === q.correct : undefined };
      });
      break;
    case "multi":
      base.bars = q.options.map((o) => {
        const c = count((r) => "choices" in r.value && r.value.choices.includes(o.id));
        return { label: o.label.fr, count: c, share: share(c), correct: q.correct ? q.correct.includes(o.id) : undefined };
      });
      break;
    case "true_false":
      base.bars = (["true", "false"] as const).map((id) => {
        const c = count((r) => choiceOf(r) === id);
        return { label: id === "true" ? "Vrai" : "Faux", count: c, share: share(c), correct: q.correct === undefined ? undefined : String(q.correct) === id };
      });
      break;
    case "ab":
      base.bars = (["a", "b"] as const).map((id) => {
        const c = count((r) => choiceOf(r) === id);
        return { label: q[id].label.fr, count: c, share: share(c), correct: q.correct ? q.correct === id : undefined };
      });
      break;
    case "likert":
      base.bars = [1, 2, 3, 4, 5].map((l) => {
        const c = count((r) => "level" in r.value && r.value.level === l);
        const label = l === 1 ? `1 · ${q.minLabel.fr}` : l === 5 ? `5 · ${q.maxLabel.fr}` : String(l);
        return { label, count: c, share: share(c) };
      });
      break;
    case "gauge":
    case "estimate": {
      const values = rows.map((r) => numericValue(r.value)).filter((v): v is number => v !== null);
      base.bars = histogram(q, values);
      if (values.length)
        base.summary = {
          mean: mean(values)!,
          median: median(values)!,
          correct: q.correct,
          unit: q.type === "gauge" ? q.unit : q.unit.fr,
        };
      break;
    }
    case "ranking": {
      const orders = rows.map((r) => ("order" in r.value ? r.value.order : [])).filter((o) => o.length);
      base.ranking = {
        items: q.items
          .map((it) => ({
            label: it.label.fr,
            avgPos: mean(orders.map((o) => o.indexOf(it.id) + 1)) ?? 0,
            correctPos: (q.correct?.indexOf(it.id) ?? -1) + 1,
          }))
          .sort((a, b) => a.correctPos - b.correctPos),
        perfect: orders.length ? orders.filter((o) => q.correct && o.join() === q.correct.join()).length / orders.length : 0,
      };
      break;
    }
  }
  return base;
}

function scaleOf(q: Question): [number, number] | null {
  if (q.type === "likert") return [1, 5];
  if (q.type === "gauge") {
    const { min, max } = gaugeBounds(q);
    return [min, max];
  }
  return null;
}

export function computeStats(sessions: SessionRow[], answers: AnswerRow[]): Stats {
  const completed = sessions.filter((s) => s.completed_at);
  const completedIds = new Set(completed.map((s) => s.id));

  const tally = (key: "locale" | "device") =>
    sessions.reduce<Record<string, number>>((acc, s) => {
      const k = s[key] ?? "?";
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {});

  const kpis: Stats["kpis"] = {
    started: sessions.length,
    completed: completed.length,
    completionRate: sessions.length ? completed.length / sessions.length : null,
    medianDurationS: median(
      completed.map((s) => (new Date(s.completed_at!).getTime() - new Date(s.started_at).getTime()) / 1000),
    ),
    avgQuizScore: mean(completed.map((s) => s.quiz_score).filter((x): x is number => x !== null)),
    locales: tally("locale"),
    devices: tally("device"),
  };

  // Index : phase -> question -> réponses
  const byQ = new Map<string, AnswerRow[]>();
  for (const a of answers) {
    const k = `${a.phase}:${a.question_id}`;
    if (!byQ.has(k)) byQ.set(k, []);
    byQ.get(k)!.push(a);
  }

  const questions = PHASES.flatMap((phase) => CONTENT[phase].map((q) => questionStats(phase, q, byQ.get(`${phase}:${q.id}`) ?? [])));

  // Avant / après : uniquement les sessions terminées ayant répondu aux deux.
  const prePost: PrePost[] = [];
  for (const q of CONTENT.post) {
    const scale = scaleOf(q);
    if (!scale || !CONTENT.pre.some((p) => p.id === q.id)) continue;
    const pre = new Map(
      (byQ.get(`pre:${q.id}`) ?? []).filter((a) => completedIds.has(a.session_id)).map((a) => [a.session_id, numericValue(a.value)]),
    );
    const pairs: [number, number][] = [];
    for (const a of byQ.get(`post:${q.id}`) ?? []) {
      const before = pre.get(a.session_id);
      const after = numericValue(a.value);
      if (completedIds.has(a.session_id) && before != null && after != null) pairs.push([before, after]);
    }
    if (!pairs.length) {
      prePost.push({ q, n: 0, scaleMin: scale[0], scaleMax: scale[1], meanPre: 0, meanPost: 0, up: 0, same: 0, down: 0 });
      continue;
    }
    // Pour une jauge 0-100, un écart de moins de 5 points compte comme « inchangé ».
    const eps = q.type === "gauge" ? (scale[1] - scale[0]) * 0.05 : 0;
    prePost.push({
      q,
      n: pairs.length,
      scaleMin: scale[0],
      scaleMax: scale[1],
      meanPre: mean(pairs.map((p) => p[0]))!,
      meanPost: mean(pairs.map((p) => p[1]))!,
      up: pairs.filter(([a, b]) => b - a > eps).length,
      same: pairs.filter(([a, b]) => Math.abs(b - a) <= eps).length,
      down: pairs.filter(([a, b]) => a - b > eps).length,
    });
  }

  // Entonnoir : nombre de sessions ayant répondu à chaque question, dans l'ordre du parcours.
  const funnel = [
    { label: "Sessions démarrées", n: sessions.length },
    ...PHASES.flatMap((phase) =>
      CONTENT[phase].map((q, i) => ({
        label: `${phase === "pre" ? "Sondage 1" : phase === "quiz" ? "Quiz" : "Sondage 2"} · Q${i + 1}`,
        n: new Set((byQ.get(`${phase}:${q.id}`) ?? []).map((a) => a.session_id)).size,
      })),
    ),
    { label: "Terminé", n: completed.length },
  ];

  return { kpis, prePost, questions, funnel };
}
