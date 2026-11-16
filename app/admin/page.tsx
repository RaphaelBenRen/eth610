import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { EvolutionChart, Headline, LikertCompare, LikertLegend, QuizChart } from "@/components/admin/Charts";
import { Kpis, LogoutButton, QuestionsSection } from "@/components/admin/Dashboard";
import { CONTENT_VERSION } from "@/content";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { getStore, usingSupabase } from "@/lib/db";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Double vérification (le proxy protège déjà la route).
  if (!(await verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value))) redirect("/admin/login");

  let data: Awaited<ReturnType<ReturnType<typeof getStore>["dump"]>>;
  try {
    data = await getStore().dump();
  } catch (e) {
    return <DbError error={e} />;
  }
  const stats = computeStats(data.sessions, data.answers);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard : IA, ce qu&apos;on ne voit pas</h1>
          <p className="text-sm text-muted">
            Données {usingSupabase() ? "Supabase" : "locales (.data/db.json)"} · contenu {CONTENT_VERSION} · mis à jour à chaque
            rechargement
          </p>
        </div>
        <LogoutButton />
      </header>

      <Headline kpis={stats.kpis} quiz={stats.questions.filter((s) => s.phase === "quiz")} />

      <h2 className="mt-14 text-2xl font-bold">Le quiz a-t-il fait bouger les avis&nbsp;?</h2>
      <p className="mt-1 text-muted">
        Accord moyen avec chaque affirmation, avant puis après le quiz (mêmes participants, sessions terminées).
      </p>

      <h3 className="mt-8 text-lg font-bold">📈 Affirmations où l&apos;on attend plus d&apos;accord après le quiz</h3>
      <p className="text-sm text-muted">La courbe bleue (après) devrait passer au-dessus de la courbe orange (avant).</p>
      <EvolutionChart items={stats.prePost} expected="agree" />

      <h3 className="mt-10 text-lg font-bold">📉 Affirmations où l&apos;on attend moins d&apos;accord après le quiz</h3>
      <p className="text-sm text-muted">La courbe bleue (après) devrait passer sous la courbe orange (avant).</p>
      <EvolutionChart items={stats.prePost} expected="disagree" />

      <h2 className="mt-14 text-2xl font-bold">Avant / après, affirmation par affirmation</h2>
      <p className="mt-1 text-muted">Répartition des réponses des mêmes participants, avant et après le quiz.</p>
      <LikertLegend />
      <LikertCompare items={stats.prePost} />

      <h2 className="mt-14 text-2xl font-bold">Résultats du quiz</h2>
      <p className="mt-1 text-muted">Part de bonnes réponses par question.</p>
      <QuizChart questions={stats.questions.filter((s) => s.phase === "quiz")} />

      <details className="group mt-16 rounded-3xl border border-line bg-surface-2/50 p-5 sm:p-6">
        <summary className="cursor-pointer text-lg font-bold">Données détaillées (participation, réponses brutes par question)</summary>
        <Kpis kpis={stats.kpis} />
        <QuestionsSection questions={stats.questions} />
      </details>

    </div>
  );
}

/** Affiché quand la base est inaccessible : donne la vraie cause (la page est réservée aux admins). */
function DbError({ error }: { error: unknown }) {
  const e = error as { message?: string; code?: string; hint?: string; details?: string };
  const message = [e?.message ?? String(error), e?.code && `code ${e.code}`, e?.hint, e?.details].filter(Boolean).join(" · ");
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold">⚠️ Impossible de lire la base de données</h1>
      <p className="mt-4 rounded-xl bg-bad-soft p-4 font-mono text-sm break-words">{message}</p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm">
        <li>
          <code>SUPABASE_URL</code> doit être de la forme <code>https://xxxx.supabase.co</code> (actuellement :{" "}
          <code>{url ? url.replace(/^(https:\/\/[^.]{4})[^.]*/, "$1…") : "non définie"}</code>).
        </li>
        <li>
          <code>SUPABASE_SERVICE_ROLE_KEY</code> doit être la clé <strong>service_role</strong> (ou « secret »), pas la clé anon /
          publishable.
        </li>
        <li>
          Les tables <code>sessions</code> et <code>answers</code> doivent exister (script <code>supabase/migrations/001_init.sql</code>).
        </li>
        <li>Après avoir modifié une variable sur Vercel : Deployments → Redeploy.</li>
      </ul>
    </div>
  );
}
