import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { AnswerValue, Locale, Phase } from "./types";

export type Device = "mobile" | "tablet" | "desktop";

export type SessionRow = {
  id: string;
  locale: Locale;
  device: Device | null;
  content_version: string;
  started_at: string;
  completed_at: string | null;
  quiz_score: number | null;
};

export type AnswerRow = {
  session_id: string;
  phase: Phase;
  question_id: string;
  value: AnswerValue;
  correctness: number | null;
  time_ms: number | null;
  created_at: string;
};

export interface Store {
  createSession(s: Pick<SessionRow, "locale" | "device" | "content_version">): Promise<string>;
  getSession(id: string): Promise<SessionRow | null>;
  upsertAnswer(a: Omit<AnswerRow, "created_at">): Promise<void>;
  listAnswers(sessionId: string): Promise<AnswerRow[]>;
  completeSession(id: string, quizScore: number): Promise<void>;
  dump(): Promise<{ sessions: SessionRow[]; answers: AnswerRow[] }>;
  reset(): Promise<void>;
}

/* ---------- Supabase (production) ---------- */

class SupabaseStore implements Store {
  constructor(private sb: SupabaseClient) {}

  async createSession(s: Pick<SessionRow, "locale" | "device" | "content_version">) {
    const { data, error } = await this.sb.from("sessions").insert(s).select("id").single();
    if (error) throw error;
    return data.id as string;
  }
  async getSession(id: string) {
    const { data, error } = await this.sb.from("sessions").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data as SessionRow | null;
  }
  async upsertAnswer(a: Omit<AnswerRow, "created_at">) {
    const { error } = await this.sb
      .from("answers")
      .upsert(a, { onConflict: "session_id,phase,question_id" });
    if (error) throw error;
  }
  async listAnswers(sessionId: string) {
    const { data, error } = await this.sb.from("answers").select("*").eq("session_id", sessionId);
    if (error) throw error;
    return data as AnswerRow[];
  }
  async completeSession(id: string, quizScore: number) {
    const { error } = await this.sb
      .from("sessions")
      .update({ completed_at: new Date().toISOString(), quiz_score: quizScore })
      .eq("id", id);
    if (error) throw error;
  }
  private async all<T>(table: string, order: string): Promise<T[]> {
    const out: T[] = [];
    const page = 1000;
    for (let from = 0; ; from += page) {
      const { data, error } = await this.sb
        .from(table)
        .select("*")
        .order(order)
        .range(from, from + page - 1);
      if (error) throw error;
      out.push(...(data as T[]));
      if (data.length < page) return out;
    }
  }
  async dump() {
    const [sessions, answers] = await Promise.all([
      this.all<SessionRow>("sessions", "started_at"),
      this.all<AnswerRow>("answers", "id"),
    ]);
    return { sessions, answers };
  }
  async reset() {
    const { error } = await this.sb.from("sessions").delete().not("id", "is", null);
    if (error) throw error;
  }
}

/* ---------- Fichier JSON local (développement uniquement) ---------- */

type FileData = { sessions: SessionRow[]; answers: AnswerRow[] };

class FileStore implements Store {
  private file = path.join(process.cwd(), ".data", "db.json");
  private lock: Promise<unknown> = Promise.resolve();

  private async read(): Promise<FileData> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return { sessions: [], answers: [] };
    }
  }
  private async write(d: FileData) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(d));
  }
  /** Sérialise les lectures-écritures pour éviter les pertes lors de requêtes simultanées. */
  private tx<T>(fn: (d: FileData) => T | Promise<T>, save = true): Promise<T> {
    const run = this.lock.then(async () => {
      const d = await this.read();
      const r = await fn(d);
      if (save) await this.write(d);
      return r;
    });
    this.lock = run.catch(() => {});
    return run;
  }

  createSession(s: Pick<SessionRow, "locale" | "device" | "content_version">) {
    return this.tx((d) => {
      const id = randomUUID();
      d.sessions.push({ ...s, id, started_at: new Date().toISOString(), completed_at: null, quiz_score: null });
      return id;
    });
  }
  getSession(id: string) {
    return this.tx((d) => d.sessions.find((s) => s.id === id) ?? null, false);
  }
  upsertAnswer(a: Omit<AnswerRow, "created_at">) {
    return this.tx((d) => {
      const i = d.answers.findIndex(
        (x) => x.session_id === a.session_id && x.phase === a.phase && x.question_id === a.question_id,
      );
      const row = { ...a, created_at: new Date().toISOString() };
      if (i >= 0) d.answers[i] = row;
      else d.answers.push(row);
    });
  }
  listAnswers(sessionId: string) {
    return this.tx((d) => d.answers.filter((a) => a.session_id === sessionId), false);
  }
  completeSession(id: string, quizScore: number) {
    return this.tx((d) => {
      const s = d.sessions.find((x) => x.id === id);
      if (s) Object.assign(s, { completed_at: new Date().toISOString(), quiz_score: quizScore });
    });
  }
  dump() {
    return this.tx((d) => d, false);
  }
  reset() {
    return this.tx((d) => {
      d.sessions = [];
      d.answers = [];
    });
  }
}

let store: Store | undefined;

/**
 * Accepte aussi les noms créés par l'intégration Supabase de Vercel ; ignore les espaces collés par erreur.
 * Ne garde que le domaine de l'URL : « https://xxx.supabase.co/rest/v1/ » → « https://xxx.supabase.co »
 * (sinon supabase-js ajoute un second /rest/v1 et Supabase répond PGRST125).
 */
function supabaseEnv() {
  const env = process.env;
  const raw = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  let url = raw;
  try {
    if (raw) url = new URL(raw).origin;
  } catch {
    /* URL invalide : on la laisse telle quelle, l'erreur Supabase sera affichée sur le dashboard */
  }
  return {
    url,
    key: (env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || "").trim(),
  };
}

export function getStore(): Store {
  if (store) return store;
  const { url, key } = supabaseEnv();
  if (url && key) {
    store = new SupabaseStore(createClient(url, key, { auth: { persistSession: false } }));
  } else if (process.env.VERCEL) {
    const missing = [!url && "SUPABASE_URL", !key && "SUPABASE_SERVICE_ROLE_KEY"].filter(Boolean).join(" et ");
    throw new Error(
      `Variable(s) vide(s) ou absente(s) à l'exécution : ${missing}. Vérifie le nom exact et la valeur dans Vercel (Settings → Environment Variables), puis redéploie.`,
    );
  } else {
    store = new FileStore();
  }
  return store;
}

export const usingSupabase = () => {
  const { url, key } = supabaseEnv();
  return Boolean(url && key);
};
