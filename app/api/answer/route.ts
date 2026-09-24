import { z } from "zod";
import { findQuestion } from "@/content";
import { getOpenSession } from "@/lib/api";
import { getStore } from "@/lib/db";
import { answerSchema, score } from "@/lib/scoring";
import { PHASES } from "@/lib/types";

const Body = z.object({
  sessionId: z.uuid(),
  phase: z.enum(PHASES),
  questionId: z.string().max(100),
  value: z.unknown(),
  timeMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { sessionId, phase, questionId, value, timeMs } = parsed.data;

  const q = findQuestion(phase, questionId);
  if (!q) return Response.json({ error: "unknown question" }, { status: 400 });

  const v = answerSchema(q).safeParse(value);
  if (!v.success) return Response.json({ error: "invalid value" }, { status: 400 });

  const session = await getOpenSession(sessionId);
  if (!session) return Response.json({ error: "session" }, { status: 404 });
  // Une réponse de quiz ne peut pas être modifiée une fois enregistrée (la correction a été vue).
  if (phase === "quiz") {
    const existing = await getStore().listAnswers(sessionId);
    if (existing.some((a) => a.phase === "quiz" && a.question_id === questionId))
      return Response.json({ ok: true, duplicate: true });
  }

  const correctness = phase === "quiz" ? score(q, v.data) : null;
  await getStore().upsertAnswer({
    session_id: sessionId,
    phase,
    question_id: questionId,
    value: v.data,
    correctness,
    time_ms: timeMs ?? null,
  });
  return Response.json({ ok: true, correctness });
}
