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

  const { sessions, answers } = await getStore().dump();
  const stats = computeStats(sessions, answers);

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
