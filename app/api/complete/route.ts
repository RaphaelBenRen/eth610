import { z } from "zod";
import { CONTENT } from "@/content";
import { getOpenSession } from "@/lib/api";
import { getStore } from "@/lib/db";

const Body = z.object({ sessionId: z.uuid() });

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid" }, { status: 400 });
  const { sessionId } = parsed.data;

  const session = await getOpenSession(sessionId);
  if (!session) return Response.json({ error: "session" }, { status: 404 });
  if (session.completed_at) return Response.json({ ok: true, quizScore: session.quiz_score });

  // Score recalculé côté serveur : moyenne sur toutes les questions du quiz (non répondue = 0).
  const answers = await getStore().listAnswers(sessionId);
  const byId = new Map(answers.filter((a) => a.phase === "quiz").map((a) => [a.question_id, a.correctness ?? 0]));
  const total = CONTENT.quiz.reduce((sum, q) => sum + (byId.get(q.id) ?? 0), 0);
  const quizScore = total / CONTENT.quiz.length;

  await getStore().completeSession(sessionId, quizScore);
  return Response.json({ ok: true, quizScore });
}
