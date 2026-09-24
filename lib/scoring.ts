import { z } from "zod";
import type { AnswerValue, Question } from "./types";

export function gaugeBounds(q: { min?: number; max?: number }) {
  return { min: q.min ?? 0, max: q.max ?? 100 };
}

/** Schéma zod de la réponse attendue pour une question donnée. */
export function answerSchema(q: Question): z.ZodType<AnswerValue> {
  switch (q.type) {
    case "single":
      return z.object({ choice: z.enum(q.options.map((o) => o.id) as [string, ...string[]]) });
    case "multi": {
      const ids = q.options.map((o) => o.id) as [string, ...string[]];
      return z.object({
        choices: z.array(z.enum(ids)).min(1).max(ids.length).refine((a) => new Set(a).size === a.length),
      });
    }
    case "true_false":
      return z.object({ choice: z.enum(["true", "false"]) });
    case "ab":
      return z.object({ choice: z.enum(["a", "b"]) });
    case "likert":
      return z.object({ level: z.number().int().min(1).max(5) });
    case "gauge": {
      const { min, max } = gaugeBounds(q);
      return z.object({ value: z.number().min(min).max(max) });
    }
    case "estimate":
      return z.object({ value: z.number().min(q.min).max(q.max) });
    case "ranking": {
      const ids = q.items.map((i) => i.id);
      return z.object({
        order: z
          .array(z.string())
          .length(ids.length)
          .refine((o) => ids.every((id) => o.includes(id))),
      });
    }
  }
}

/** Kendall tau normalisé sur [0, 1] (1 = ordre identique). */
export function kendallScore(answer: string[], correct: string[]): number {
  const pos = new Map(correct.map((id, i) => [id, i]));
  const n = answer.length;
  if (n < 2) return 1;
  let concordant = 0;
  let pairs = 0;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      pairs++;
      if (pos.get(answer[i])! < pos.get(answer[j])!) concordant++;
    }
  return concordant / pairs;
}

/**
 * Justesse d'une réponse, entre 0 et 1.
 * Renvoie null si la question n'a pas de bonne réponse (question de sondage).
 */
export function score(q: Question, v: AnswerValue): number | null {
  switch (q.type) {
    case "single":
    case "ab":
      if (q.correct === undefined) return null;
      return "choice" in v && v.choice === q.correct ? 1 : 0;
    case "true_false":
      if (q.correct === undefined) return null;
      return "choice" in v && v.choice === String(q.correct) ? 1 : 0;
    case "multi": {
      if (!q.correct || !("choices" in v)) return null;
      const a = new Set(v.choices);
      const c = new Set(q.correct);
      const inter = [...a].filter((x) => c.has(x)).length;
      const union = new Set([...a, ...c]).size;
      return union === 0 ? 1 : inter / union;
    }
    case "likert":
      return null;
    case "gauge": {
      if (q.correct === undefined || !("value" in v)) return null;
      const { min, max } = gaugeBounds(q);
      const tol = q.tolerance ?? (max - min) * 0.25;
      return Math.max(0, 1 - Math.abs(v.value - q.correct) / tol);
    }
    case "estimate": {
      if (q.correct === undefined || !("value" in v)) return null;
      // 1 ordre de grandeur d'écart => 0.
      const err = Math.abs(Math.log10(v.value) - Math.log10(q.correct));
      return Math.max(0, 1 - err);
    }
    case "ranking":
      if (!q.correct || !("order" in v)) return null;
      return kendallScore(v.order, q.correct);
  }
}

/** Seuils utilisés pour le message de feedback. */
export function verdict(s: number): "right" | "close" | "wrong" {
  if (s >= 0.8) return "right";
  if (s >= 0.4) return "close";
  return "wrong";
}

/** Valeur numérique d'une réponse de sondage (pour la comparaison avant/après). */
export function numericValue(v: AnswerValue): number | null {
  if ("level" in v) return v.level;
  if ("value" in v) return v.value;
  return null;
}
