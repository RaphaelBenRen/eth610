import { describe, expect, it } from "vitest";
import { CONTENT } from "@/content";
import { REPEATED } from "@/content/survey-pre";
import { tips } from "@/content/tips";
import { answerSchema, kendallScore, score } from "./scoring";
import { LOCALES, type Question } from "./types";

describe("score", () => {
  const gauge: Question = { id: "g", type: "gauge", prompt: { fr: "", en: "" }, correct: 50, tolerance: 20 };
  it("gauge: exact = 1, à la tolérance = 0", () => {
    expect(score(gauge, { value: 50 })).toBe(1);
    expect(score(gauge, { value: 60 })).toBeCloseTo(0.5);
    expect(score(gauge, { value: 90 })).toBe(0);
  });

  const est: Question = { id: "e", type: "estimate", prompt: { fr: "", en: "" }, min: 1, max: 1e5, unit: { fr: "", en: "" }, correct: 500 };
  it("estimate: un ordre de grandeur d'écart = 0", () => {
    expect(score(est, { value: 500 })).toBe(1);
    expect(score(est, { value: 5000 })).toBeCloseTo(0);
    expect(score(est, { value: 50 })).toBeCloseTo(0);
  });

  it("ranking: kendall", () => {
    expect(kendallScore(["a", "b", "c"], ["a", "b", "c"])).toBe(1);
    expect(kendallScore(["c", "b", "a"], ["a", "b", "c"])).toBe(0);
    expect(kendallScore(["b", "a", "c"], ["a", "b", "c"])).toBeCloseTo(2 / 3);
  });

  it("true_false", () => {
    const tf: Question = { id: "t", type: "true_false", prompt: { fr: "", en: "" }, correct: false };
    expect(score(tf, { choice: "false" })).toBe(1);
    expect(score(tf, { choice: "true" })).toBe(0);
  });

  it("sondage: pas de score", () => {
    expect(score(REPEATED[0], { level: 3 })).toBeNull();
  });
});

describe("answerSchema", () => {
  it("rejette une option inconnue et un classement incomplet", () => {
    const single = CONTENT.quiz.find((q) => q.type === "single")!;
    expect(answerSchema(single).safeParse({ choice: "zzz" }).success).toBe(false);
    const rank = CONTENT.quiz.find((q) => q.type === "ranking")!;
    expect(answerSchema(rank).safeParse({ order: ["video"] }).success).toBe(false);
  });
});

describe("contenu", () => {
  const all = Object.values(CONTENT).flat();

  it("aucune traduction manquante", () => {
    const walk = (o: unknown, path: string) => {
      if (o && typeof o === "object") {
        const keys = Object.keys(o);
        if (keys.includes("fr") || keys.includes("en")) {
          for (const l of LOCALES) {
            const s = (o as Record<string, unknown>)[l];
            expect(typeof s === "string" && s.trim().length > 0, `${path}.${l}`).toBe(true);
          }
        } else for (const k of keys) walk((o as Record<string, unknown>)[k], `${path}.${k}`);
      }
    };
    walk(all, "questions");
    walk(tips, "tips");
  });

  it("ids uniques par phase", () => {
    for (const qs of Object.values(CONTENT)) {
      const ids = qs.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("chaque question du quiz a une bonne réponse valide", () => {
    for (const q of CONTENT.quiz) {
      expect(q.type).not.toBe("likert");
      const correct = "correct" in q ? q.correct : undefined;
      expect(correct, q.id).toBeDefined();
    }
  });
});
