import type { Phase, Question } from "@/lib/types";
import { surveyPre } from "./survey-pre";
import { quiz } from "./quiz";
import { surveyPost } from "./survey-post";

/** À changer quand on modifie les questions après le lancement (stocké avec chaque session). */
export const CONTENT_VERSION = "2026-09-24-brouillon-v2";

export const CONTENT: Record<Phase, Question[]> = {
  pre: surveyPre,
  quiz,
  post: surveyPost,
};

export function findQuestion(phase: Phase, id: string): Question | undefined {
  return CONTENT[phase].find((q) => q.id === id);
}
