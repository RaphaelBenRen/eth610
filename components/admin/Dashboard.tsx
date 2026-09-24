"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Bar, PrePost, QuestionStats, Stats } from "@/lib/stats";
import type { Phase } from "@/lib/types";

const pct = (x: number | null, digits = 0) => (x === null ? "—" : `${(x * 100).toFixed(digits)} %`);
const num = (x: number, digits = 1) => x.toLocaleString("fr-CA", { maximumFractionDigits: digits });
const duration = (s: number | null) => (s === null ? "—" : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, "0")} s`);

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
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Tile label="Sessions démarrées" value={String(kpis.started)} />
      <Tile label="Sessions terminées" value={String(kpis.completed)} />
      <Tile label="Taux de complétion" value={pct(kpis.completionRate)} />
      <Tile label="Durée médiane" value={duration(kpis.medianDurationS)} sub="sessions terminées" />
      <Tile label="Score moyen au quiz" value={pct(kpis.avgQuizScore)} sub="justesse moyenne" />
      <Tile label="Langue / appareil" value={split(kpis.locales)} sub={split(kpis.devices)} small />
    </div>
  );
}

/* ---------- Avant / après ---------- */

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: i.color }} aria-hidden />
          {i.label}
        </span>
      ))}
    </div>
  );
}

function Dumbbell({ p }: { p: PrePost }) {
  const pos = (v: number) => `${((v - p.scaleMin) / (p.scaleMax - p.scaleMin)) * 100}%`;
  const [lo, hi] = [Math.min(p.meanPre, p.meanPost), Math.max(p.meanPre, p.meanPost)];
  return (
    <div className="px-2">
      <div className="relative h-10">
        <div className="absolute top-1/2 right-0 left-0 h-px bg-line" />
        <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-muted/60" style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})` }} />
        {[
          { v: p.meanPre, color: "var(--series-2)", label: "Avant" },
          { v: p.meanPost, color: "var(--series-1)", label: "Après" },
        ].map((d) => (
          <div
            key={d.label}
            title={`${d.label} : ${num(d.v, 2)}`}
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface"
            style={{ left: pos(d.v), background: d.color }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted tabular-nums">
        <span>{p.scaleMin}</span>
        <span>{p.scaleMax}</span>
      </div>
    </div>
  );
}

function ChangeBar({ p }: { p: PrePost }) {
  const segs = [
    { k: "down", n: p.down, color: "var(--div-down)", label: "↓ Baisse" },
    { k: "same", n: p.same, color: "var(--div-mid)", label: "= Inchangé" },
    { k: "up", n: p.up, color: "var(--div-up)", label: "↑ Hausse" },
  ];
  return (
    <div>
      <div className="flex h-5 gap-0.5 overflow-hidden rounded-md">
        {segs
          .filter((s) => s.n > 0)
          .map((s) => (
            <div key={s.k} title={`${s.label} : ${s.n} (${pct(s.n / p.n)})`} style={{ width: `${(s.n / p.n) * 100}%`, background: s.color }} />
          ))}
      </div>
      <div className="mt-1 flex justify-between gap-2 text-xs text-muted tabular-nums">
        {segs.map((s) => (
          <span key={s.k}>
            {s.label} {pct(s.n / p.n)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PrePostSection({ items }: { items: PrePost[] }) {
  if (!items.length) return <p className="mt-4 text-muted">Aucune question répétée.</p>;
  return (
    <>
      <div className="mt-4">
        <Legend
          items={[
            { color: "var(--series-2)", label: "Moyenne avant (sondage 1)" },
            { color: "var(--series-1)", label: "Moyenne après (sondage 2)" },
          ]}
        />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {items.map((p) => {
          const delta = p.meanPost - p.meanPre;
          return (
            <article key={p.q.id} className="rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold">{p.q.prompt.fr}</h3>
                <span className="shrink-0 text-xs text-muted">n = {p.n}</span>
              </div>
              {p.n === 0 ? (
                <p className="mt-4 text-sm text-muted">Pas encore de réponses appariées.</p>
              ) : (
                <>
                  <p className="mt-3 text-sm tabular-nums">
                    <span className="text-muted">Avant</span> <strong>{num(p.meanPre, 2)}</strong>
                    <span className="text-muted"> → Après</span> <strong>{num(p.meanPost, 2)}</strong>
                    <span className="ml-2 rounded-md bg-surface-2 px-1.5 py-0.5 font-semibold">
                      {delta >= 0 ? "+" : ""}
                      {num(delta, 2)}
                    </span>
                  </p>
                  <div className="mt-3">
                    <Dumbbell p={p} />
                  </div>
                  <div className="mt-4">
                    <ChangeBar p={p} />
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </>
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
        {s.medianTimeMs !== null && <span className="text-muted">· temps médian {num(s.medianTimeMs / 1000)} s</span>}
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

/* ---------- Entonnoir ---------- */

export function FunnelChart({ funnel }: { funnel: Stats["funnel"] }) {
  const max = Math.max(1, funnel[0]?.n ?? 1);
  return (
    <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
      <ul className="grid gap-1">
        {funnel.map((f) => (
          <li key={f.label} className="grid grid-cols-[8.5rem_1fr_3rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_4rem]">
            <span className="truncate text-muted">{f.label}</span>
            <span className="h-3" title={`${f.label} : ${f.n}`}>
              <span className="block h-full rounded-r-sm bg-series-1" style={{ width: `${(f.n / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums">{f.n}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
