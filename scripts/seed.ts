/*
 * Génère des sessions fictives pour tester le dashboard.
 *   npm run seed            → 200 sessions
 *   npm run seed -- 500     → 500 sessions
 * Écrit dans Supabase si SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY sont définies (.env.local), sinon dans .data/db.json.
 * ⚠️ Penser à lancer `npm run db:reset` avant la mise en ligne officielle.
 */
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT, CONTENT_VERSION } from "../content";
import type { AnswerRow, SessionRow } from "../lib/db";
import { gaugeBounds, score } from "../lib/scoring";
import type { AnswerValue, Phase, Question } from "../lib/types";

const N = Number(process.argv[2] ?? 200);
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];
const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Réponse plausible. `shift` simule l'effet du quiz sur le sondage 2. */
function fakeAnswer(q: Question, phase: Phase, prev?: AnswerValue): AnswerValue {
  switch (q.type) {
    case "single":
      return { choice: phase === "quiz" && q.correct && Math.random() < 0.45 ? q.correct : pick(q.options).id };
    case "multi": {
      const choices = q.options.filter(() => Math.random() < 0.4).map((o) => o.id);
      return { choices: choices.length ? choices : [q.options[0].id] };
    }
    case "true_false":
      return { choice: phase === "quiz" && q.correct !== undefined && Math.random() < 0.6 ? String(q.correct) : pick(["true", "false"]) };
    case "ab":
      return { choice: phase === "quiz" && q.correct && Math.random() < 0.5 ? q.correct : pick(["a", "b"]) };
    case "likert": {
      if (prev && "level" in prev) return { level: clamp(prev.level + pick([0, 0, 1, 1, 1, 2, -1]), 1, 5) };
      return { level: pick([1, 2, 2, 3, 3, 3, 4, 4, 5]) };
    }
    case "gauge": {
      const { min, max } = gaugeBounds(q);
      if (prev && "value" in prev) return { value: Math.round(clamp(prev.value + rand(-5, 25), min, max)) };
      const center = q.correct ?? (min + max) * 0.4;
      return { value: Math.round(clamp(center + rand(-35, 35), min, max)) };
    }
    case "estimate":
      return { value: Math.round(clamp(10 ** (Math.log10(q.correct ?? 100) + rand(-2, 2)), q.min, q.max)) };
    case "ranking": {
      const ids = q.items.map((i) => i.id);
      if (q.correct && Math.random() < 0.3) return { order: [...q.correct] };
      return { order: [...ids].sort(() => Math.random() - 0.5) };
    }
  }
}

function generate() {
  const sessions: SessionRow[] = [];
  const answers: AnswerRow[] = [];
  const now = Date.now();
  for (let s = 0; s < N; s++) {
    const id = randomUUID();
    const start = now - rand(0, 14 * 24 * 3600 * 1000);
    let t = start;
    const completes = Math.random() < 0.78;
    // Point d'abandon pour les sessions non terminées.
    const all = (["pre", "quiz", "post"] as Phase[]).flatMap((phase) => CONTENT[phase].map((q) => ({ phase, q })));
    const stopAt = completes ? all.length : Math.floor(rand(0, all.length));
    const pre = new Map<string, AnswerValue>();
    let quizTotal = 0;
    all.slice(0, stopAt).forEach(({ phase, q }) => {
      const timeMs = Math.round(rand(3000, phase === "quiz" ? 25000 : 9000));
      t += timeMs + (phase === "quiz" ? 6000 : 300);
      const value = fakeAnswer(q, phase, phase === "post" ? pre.get(q.id) : undefined);
      if (phase === "pre") pre.set(q.id, value);
      const correctness = phase === "quiz" ? score(q, value) : null;
      if (correctness) quizTotal += correctness;
      answers.push({ session_id: id, phase, question_id: q.id, value, correctness, time_ms: timeMs, created_at: new Date(t).toISOString() });
    });
    sessions.push({
      id,
      locale: Math.random() < 0.75 ? "fr" : "en",
      device: pick(["mobile", "mobile", "mobile", "desktop", "desktop", "tablet"]),
      content_version: CONTENT_VERSION,
      started_at: new Date(start).toISOString(),
      completed_at: completes ? new Date(t).toISOString() : null,
      quiz_score: completes ? quizTotal / CONTENT.quiz.length : null,
    });
  }
  return { sessions, answers };
}

async function main() {
  const data = generate();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) {
    const sb = createClient(url, key, { auth: { persistSession: false } });
    for (let i = 0; i < data.sessions.length; i += 500) {
      const { error } = await sb.from("sessions").insert(data.sessions.slice(i, i + 500));
      if (error) throw error;
    }
    for (let i = 0; i < data.answers.length; i += 1000) {
      const { error } = await sb.from("answers").insert(data.answers.slice(i, i + 1000));
      if (error) throw error;
    }
    console.log(`✅ ${N} sessions fictives insérées dans Supabase`);
  } else {
    const file = path.join(process.cwd(), ".data", "db.json");
    let db = { sessions: [] as SessionRow[], answers: [] as AnswerRow[] };
    try {
      db = JSON.parse(await fs.readFile(file, "utf8"));
    } catch {}
    db.sessions.push(...data.sessions);
    db.answers.push(...data.answers);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(db));
    console.log(`✅ ${N} sessions fictives ajoutées dans ${file}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
