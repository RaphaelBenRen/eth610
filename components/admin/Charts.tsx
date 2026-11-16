"use client";

import { useState } from "react";

import type { PrePost, QuestionStats, Stats } from "@/lib/stats";
import type { Question } from "@/lib/types";

/* Graphiques « présentation » du dashboard : lisibles en un coup d'œil, projetables. */

const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)} %`);
const signed = (x: number, digits = 1) =>
  `${x > 0 ? "+" : x < 0 ? "−" : "±"}${Math.abs(x).toLocaleString("fr-CA", { maximumFractionDigits: digits })}`;
const shortOf = (q: Question) => q.short?.fr ?? q.prompt.fr;
const DIM_EMOJI = { env: "🌍", soc: "👥", eco: "💰" } as const;
const dimEmoji = (q: Question) => (q.dimension ? DIM_EMOJI[q.dimension] : "");

const LEVELS = [
  { level: 1, label: "Tout à fait pas d'accord" },
  { level: 2, label: "Plutôt pas d'accord" },
  { level: 3, label: "Ni d'accord, ni pas d'accord" },
  { level: 4, label: "Plutôt d'accord" },
  { level: 5, label: "Tout à fait d'accord" },
];

/* ---------- 1. Chiffres clés ---------- */

function BigTile({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">{value}</div>
      <div className="mt-2 font-semibold">{label}</div>
      {sub && <div className="mt-0.5 text-sm text-muted">{sub}</div>}
    </div>
  );
}

export function Headline({ kpis, quiz }: { kpis: Stats["kpis"]; quiz: QuestionStats[] }) {
  const rights = quiz.map((s) => s.rightShare).filter((x): x is number => x !== null);
  const avgRight = rights.length ? rights.reduce((a, b) => a + b, 0) / rights.length : null;
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <BigTile value={String(kpis.completed)} label="participants" sub={`${kpis.started} parcours commencés`} />
      <BigTile value={pct(kpis.changedAny)} label="ont changé au moins un avis" sub="entre le sondage avant et après" />
      <BigTile value={pct(kpis.movedExpectedShare)} label="des avis ont bougé dans le sens attendu" sub="toutes affirmations confondues" />
      <BigTile value={pct(avgRight)} label="de bonnes réponses au quiz" sub="en moyenne par question" />
    </div>
  );
}

/* ---------- 2. Vue d'ensemble : courbe « avant » et courbe « après » ---------- */

/** Coupe un libellé en lignes courtes pour l'axe des abscisses. */
function wrap(text: string, max = 17, maxLines = 3) {
  const lines: string[] = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) lines.splice(maxLines - 1, lines.length, lines.slice(maxLines - 1).join(" "));
  return lines;
}

const W = 920;
const H = 430;
const M = { top: 28, right: 28, bottom: 132, left: 168 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const yOf = (v: number) => M.top + ((5 - v) / 4) * PH;

const SERIES = [
  { key: "pre" as const, label: "Avant le quiz", color: "var(--series-2)" },
  { key: "post" as const, label: "Après le quiz", color: "var(--series-1)" },
];

export function EvolutionChart({ items }: { items: PrePost[] }) {
  const rows = items.filter((p) => p.n > 0 && p.q.type === "likert");
  const [hover, setHover] = useState<number | null>(null);
  if (!rows.length) return <Empty />;

  const xOf = (i: number) => M.left + (PW * (i + 0.5)) / rows.length;
  const colW = PW / rows.length;
  const path = (key: "pre" | "post") =>
    rows.map((p, i) => `${i ? "L" : "M"}${xOf(i).toFixed(1)},${yOf(key === "pre" ? p.meanPre : p.meanPost).toFixed(1)}`).join(" ");
  const h = hover !== null ? rows[hover] : null;
  // Info-bulle au-dessus du point le plus haut s'il reste de la place, sinon sous le point le plus bas.
  const yHigh = h ? yOf(Math.max(h.meanPre, h.meanPost)) : 0;
  const yLow = h ? yOf(Math.min(h.meanPre, h.meanPost)) : 0;
  const tipAbove = yHigh > 135;
  const tipY = tipAbove ? yHigh - 14 : yLow + 14;

  /** Colonne sous le pointeur (souris ou doigt), calculée depuis sa position dans le graphique. */
  const pick = (e: React.PointerEvent<SVGSVGElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - box.left) / box.width) * W;
    const i = Math.floor((x - M.left) / colW);
    setHover(i >= 0 && i < rows.length ? i : null);
  };

  return (
    <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sm:p-8">
      {/* Légende */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-2">
            <svg width="28" height="12" aria-hidden>
              <line x1="0" y1="6" x2="28" y2="6" stroke={s.color} strokeWidth="2.5" />
              <circle cx="14" cy="6" r="4.5" fill={s.color} stroke="var(--surface)" strokeWidth="2" />
            </svg>
            {s.label}
          </span>
        ))}
        <span className="text-muted">· Accord moyen, de 1 (pas du tout d&apos;accord) à 5 (tout à fait d&apos;accord)</span>
      </div>

      <div className="-mx-2 mt-4 overflow-x-auto px-2">
        <div className="relative min-w-[640px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="block w-full touch-pan-y"
            role="img"
            aria-label="Accord moyen avant et après le quiz, par affirmation"
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setHover(null)}
          >
            {/* Grille horizontale + graduations de l'axe Y */}
            {[1, 2, 3, 4, 5].map((v) => (
              <g key={v}>
                <line x1={M.left} x2={W - M.right} y1={yOf(v)} y2={yOf(v)} stroke="var(--line)" strokeWidth={v === 3 ? 1.5 : 1} />
                <text x={M.left - 12} y={yOf(v)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[13px]">
                  {v === 1 ? "1 · Pas du tout d'accord" : v === 3 ? "3 · Neutre" : v === 5 ? "5 · Tout à fait d'accord" : v}
                </text>
              </g>
            ))}

            {/* Colonne survolée */}
            {hover !== null && <rect x={xOf(hover) - colW / 2} y={M.top} width={colW} height={PH} fill="var(--surface-2)" />}
            {hover !== null && <line x1={xOf(hover)} x2={xOf(hover)} y1={M.top} y2={M.top + PH} stroke="var(--muted)" strokeWidth="1" />}

            {/* Zone entre les deux courbes */}
            <path
              d={`${path("pre")} ${rows
                .map((p, i) => `L${xOf(rows.length - 1 - i).toFixed(1)},${yOf(rows[rows.length - 1 - i].meanPost).toFixed(1)}`)
                .join(" ")} Z`}
              fill="var(--series-1)"
              opacity="0.07"
            />

            {/* Courbes */}
            {SERIES.map((s) => (
              <path key={s.key} d={path(s.key)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {SERIES.map((s) =>
              rows.map((p, i) => (
                <circle
                  key={`${s.key}-${p.q.id}`}
                  cx={xOf(i)}
                  cy={yOf(s.key === "pre" ? p.meanPre : p.meanPost)}
                  r={hover === i ? 7 : 5.5}
                  fill={s.color}
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
              )),
            )}

            {/* Étiquettes directes en bout de courbe */}
            {SERIES.map((s) => {
              const last = rows[rows.length - 1];
              const v = s.key === "pre" ? last.meanPre : last.meanPost;
              const other = s.key === "pre" ? last.meanPost : last.meanPre;
              const dy = Math.abs(v - other) < 0.25 ? (v >= other ? -12 : 12) : 0;
              return (
                <text key={s.key} x={xOf(rows.length - 1) + 12} y={yOf(v) + dy} dominantBaseline="middle" className="fill-ink text-[12px] font-semibold">
                  {s.key === "pre" ? "Avant" : "Après"}
                </text>
              );
            })}

            {/* Axe X : libellés + écart */}
            {rows.map((p, i) => {
              const delta = p.meanPost - p.meanPre;
              const good = p.expected ? (p.expected === "agree" ? delta > 0 : delta < 0) : false;
              const lines = wrap(`${dimEmoji(p.q)} ${shortOf(p.q)}`);
              return (
                <g key={p.q.id}>
                  <text x={xOf(i)} y={M.top + PH + 24} textAnchor="middle" className="fill-ink text-[13px] font-semibold">
                    {lines.map((l, k) => (
                      <tspan key={k} x={xOf(i)} dy={k === 0 ? 0 : 16}>
                        {l}
                      </tspan>
                    ))}
                  </text>
                  <text
                    x={xOf(i)}
                    y={M.top + PH + 24 + lines.length * 16 + 10}
                    textAnchor="middle"
                    className={`text-[13px] font-bold ${good ? "fill-good" : "fill-muted"}`}
                  >
                    {signed(delta)}
                    {p.expected ? (good ? " ✓" : "") : ""}
                  </text>
                </g>
              );
            })}

          </svg>

          {/* Info-bulle */}
          {h && hover !== null && (
            <div
              className={`pointer-events-none absolute z-10 w-56 -translate-x-1/2 rounded-xl border border-line bg-surface p-3 text-sm shadow-lg ${
                tipAbove ? "-translate-y-full" : ""
              }`}
              style={{ left: `${(xOf(hover) / W) * 100}%`, top: `${(tipY / H) * 100}%` }}
            >
              <div className="font-semibold">{shortOf(h.q)}</div>
              {SERIES.map((s) => (
                <div key={s.key} className="mt-1 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-semibold tabular-nums">{(s.key === "pre" ? h.meanPre : h.meanPost).toFixed(2).replace(".", ",")}</span>
                </div>
              ))}
              <div className="mt-1 border-t border-line pt-1 text-xs text-muted">
                Écart {signed(h.meanPost - h.meanPre, 2)} · n = {h.n}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- 3. Détail : barres empilées avant / après ---------- */

export function LikertLegend() {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
      {LEVELS.map((l) => (
        <span key={l.level} className="inline-flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded" style={{ background: `var(--lk-${l.level})`, boxShadow: "inset 0 0 0 1px rgb(0 0 0 / 0.08)" }} aria-hidden />
          {l.label}
        </span>
      ))}
    </div>
  );
}

function StackedBar({ dist, label }: { dist: number[]; label: string }) {
  const n = dist.reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="grid grid-cols-[3.25rem_1fr] items-center gap-3">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <div className="flex h-9 gap-0.5 overflow-hidden rounded-lg">
        {dist.map((c, i) => {
          const share = c / n;
          if (share === 0) return null;
          const lvl = i + 1;
          return (
            <div
              key={lvl}
              className="flex items-center justify-center text-xs font-bold tabular-nums"
              style={{ width: `${share * 100}%`, background: `var(--lk-${lvl})`, color: `var(--lk-${lvl}-ink)` }}
              title={`${label} · ${LEVELS[i].label} : ${c} (${Math.round(share * 100)} %)`}
            >
              {share >= 0.09 ? `${Math.round(share * 100)}%` : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LikertCompare({ items }: { items: PrePost[] }) {
  const rows = items.filter((p) => p.n > 0 && p.distPre && p.distPost);
  if (!rows.length) return <Empty />;
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-2">
      {rows.map((p) => {
        const agree = (d: number[]) => (d[3] + d[4]) / p.n;
        const before = agree(p.distPre!);
        const after = agree(p.distPost!);
        const diffPts = Math.round((after - before) * 100);
        const good = p.expected ? (p.expected === "agree" ? diffPts > 0 : diffPts < 0) : false;
        return (
          <article key={p.q.id} className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg leading-snug font-bold">
                <span aria-hidden>{dimEmoji(p.q)} </span>
                {shortOf(p.q)}
              </h3>
              <span className="shrink-0 text-xs text-muted">n = {p.n}</span>
            </div>
            <p className="mt-1 text-sm leading-snug text-muted">{p.q.prompt.fr}</p>

            <div className="mt-5 grid gap-2">
              <StackedBar dist={p.distPre!} label="Avant" />
              <StackedBar dist={p.distPost!} label="Après" />
            </div>

            <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm font-semibold text-muted">D&apos;accord</span>
              <span className="text-3xl font-extrabold tabular-nums">
                {pct(before)} <span className="text-muted">→</span> {pct(after)}
              </span>
              <span className={`text-sm font-bold ${good ? "text-good" : "text-muted"}`}>
                {diffPts > 0 ? "▲" : diffPts < 0 ? "▼" : "="} {Math.abs(diffPts)} pts{p.expected ? (good ? " ✓ attendu" : "") : ""}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------- 4. Quiz : taux de bonnes réponses ---------- */

export function QuizChart({ questions }: { questions: QuestionStats[] }) {
  const rows = questions.filter((s) => s.n > 0);
  if (!rows.length) return <Empty />;
  return (
    <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sm:p-8">
      <ul className="grid gap-4">
        {rows.map((s, i) => (
          <li key={s.q.id} className="grid gap-x-6 gap-y-1.5 md:grid-cols-[minmax(0,15rem)_1fr_4.5rem] md:items-center">
            <span className="text-sm font-semibold md:text-base">
              <span className="text-muted">Q{i + 1} · </span>
              <span aria-hidden>{dimEmoji(s.q)} </span>
              {shortOf(s.q)}
            </span>
            <span
              className="h-6 rounded-r-md bg-surface-2"
              title={`${shortOf(s.q)} : ${pct(s.rightShare)} de bonnes réponses (n = ${s.n})`}
            >
              <span className="block h-full rounded-r-md bg-series-1" style={{ width: `${(s.rightShare ?? 0) * 100}%` }} />
            </span>
            <span className="text-lg font-bold tabular-nums md:text-right">{pct(s.rightShare)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-muted">
        Part des réponses jugées justes (pour les curseurs : réponse suffisamment proche de la bonne valeur). Une barre courte = une
        idée reçue répandue.
      </p>
    </div>
  );
}

function Empty() {
  return <p className="mt-4 rounded-3xl border border-dashed border-line p-8 text-center text-muted">Pas encore de participations terminées.</p>;
}
