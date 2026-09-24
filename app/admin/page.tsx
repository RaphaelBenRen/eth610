import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FunnelChart, Kpis, LogoutButton, PrePostSection, QuestionsSection } from "@/components/admin/Dashboard";
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

      <Kpis kpis={stats.kpis} />

      <h2 className="mt-12 text-xl font-bold">⭐ Évolution avant / après</h2>
      <p className="mt-1 text-sm text-muted">
        Comparaison appariée, par répondant, sur les sessions terminées. Même question posée au sondage 1 puis au sondage 2.
      </p>
      <PrePostSection items={stats.prePost} />

      <h2 className="mt-12 text-xl font-bold">Détail par question</h2>
      <QuestionsSection questions={stats.questions} />

      <h2 className="mt-12 text-xl font-bold">Entonnoir d&apos;abandon</h2>
      <p className="mt-1 text-sm text-muted">Nombre de sessions ayant répondu à chaque étape.</p>
      <FunnelChart funnel={stats.funnel} />
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
