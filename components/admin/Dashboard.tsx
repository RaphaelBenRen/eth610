"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bar, QuestionStats, Stats } from "@/lib/stats";
import type { Phase } from "@/lib/types";

const pct = (x: number | null, digits = 0) => (x === null ? "—" : `${(x * 100).toFixed(digits)} %`);
const num = (x: number, digits = 1) =>
  x.toLocaleString("fr-CA", Math.abs(x) > 0 && Math.abs(x) < 1 ? { maximumSignificantDigits: 2 } : { maximumFractionDigits: digits });

const TYPE_LABEL: Record<string, string> = {
  single: "QCM",
  multi: "Choix multiples",
  true_false: "Vrai/Faux",
  ab: "A ou B",
  likert: "Échelle 1-5",
  gauge: "Jauge",
  estimate: "Estimation",
  ranking: "Classement",
};

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn btn-ghost min-h-10 px-4 text-sm"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.replace("/admin/login");
      }}
    >
      Se déconnecter
    </button>
  );
}

/* ---------- KPIs ---------- */

function Tile({ label, value, sub, small }: { label: string; value: string; sub?: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="text-sm text-muted">{label}</div>
      <div className={`mt-1 font-bold tabular-nums ${small ? "text-base" : "text-2xl"}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}

export function Kpis({ kpis }: { kpis: Stats["kpis"] }) {
  const split = (r: Record<string, number>) =>
    Object.entries(r)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${v}`)
      .join(" · ") || "—";
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <Tile label="Sessions démarrées" value={String(kpis.started)} />
      <Tile label="Sessions terminées" value={String(kpis.completed)} />
      <Tile label="Taux de complétion" value={pct(kpis.completionRate)} />
      <Tile label="Score moyen au quiz" value={pct(kpis.avgQuizScore)} sub="justesse moyenne" />
      <Tile label="Langue / appareil" value={split(kpis.locales)} sub={split(kpis.devices)} small />
    </div>
  );
}

/* ---------- Détail par question ---------- */

function BarList({ bars, n }: { bars: Bar[]; n: number }) {
  return (
    <ul className="grid gap-1.5">
      {bars.map((b) => (
        <li key={b.label} className="grid grid-cols-[minmax(0,9rem)_1fr_4.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,14rem)_1fr_5rem]">
          <span className="truncate" title={b.label}>
            {b.correct && <span className="mr-1 font-bold text-good" title="Bonne réponse">✓</span>}
            {b.label}
          </span>
          <span className="h-3 rounded-r-sm bg-surface-2" title={`${b.label} : ${b.count} / ${n}`}>
            <span className="block h-full rounded-r-sm bg-series-1" style={{ width: `${b.share * 100}%` }} />
          </span>
          <span className="text-right text-muted tabular-nums">
            {pct(b.share)} <span className="text-xs">({b.count})</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function QuestionCard({ s }: { s: QuestionStats }) {
  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-full bg-surface-2 px-2 py-0.5 font-medium">{TYPE_LABEL[s.q.type]}</span>
        <span className="text-muted">n = {s.n}</span>
        {s.successRate !== null && <span className="text-muted">· réussite {pct(s.successRate)}</span>}
        <span className="ml-auto font-mono text-muted">{s.q.id}</span>
      </div>
      <h3 className="mt-2 font-semibold">{s.q.prompt.fr}</h3>
      <div className="mt-4">
        {s.n === 0 ? (
          <p className="text-sm text-muted">Aucune réponse pour l&apos;instant.</p>
        ) : s.ranking ? (
          <div className="overflow-x-auto">
            <p className="mb-2 text-sm">
              Classements parfaits : <strong>{pct(s.ranking.perfect)}</strong>
            </p>
            <table className="w-full text-sm">
              <thead className="text-left text-muted">
                <tr>
                  <th className="py-1 font-medium">Élément</th>
                  <th className="py-1 text-right font-medium">Bonne position</th>
                  <th className="py-1 text-right font-medium">Position moyenne donnée</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {s.ranking.items.map((it) => (
                  <tr key={it.label} className="border-t border-line">
                    <td className="py-1.5">{it.label}</td>
                    <td className="py-1.5 text-right">{it.correctPos || "—"}</td>
                    <td className="py-1.5 text-right">{num(it.avgPos, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            <BarList bars={s.bars} n={s.n} />
            {s.summary && (
              <p className="mt-3 text-sm text-muted tabular-nums">
                Moyenne <strong className="text-ink">{num(s.summary.mean)}</strong> · médiane{" "}
                <strong className="text-ink">{num(s.summary.median)}</strong>
                {s.summary.correct !== undefined && (
                  <>
                    {" "}
                    · bonne réponse <strong className="text-ink">{num(s.summary.correct)}</strong>
                  </>
                )}{" "}
                {s.summary.unit}
              </p>
            )}
          </>
        )}
      </div>
    </article>
  );
}

const TABS: { phase: Phase; label: string }[] = [
  { phase: "pre", label: "Sondage 1 (avant)" },
  { phase: "quiz", label: "Quiz" },
  { phase: "post", label: "Sondage 2 (après)" },
];

export function QuestionsSection({ questions }: { questions: QuestionStats[] }) {
  const [phase, setPhase] = useState<Phase>("quiz");
  return (
    <>
      <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl bg-surface-2 p-1" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.phase}
            type="button"
            role="tab"
            aria-selected={phase === t.phase}
            onClick={() => setPhase(t.phase)}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition ${
              phase === t.phase ? "bg-surface shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {questions
          .filter((s) => s.phase === phase)
          .map((s) => (
            <QuestionCard key={s.q.id} s={s} />
          ))}
      </div>
    </>
  );
}
