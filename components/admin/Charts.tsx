"use client";

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

/* ---------- 2. Vue d'ensemble : flèche avant → après par affirmation ---------- */

export function ShiftChart({ items }: { items: PrePost[] }) {
  const rows = items.filter((p) => p.n > 0 && p.q.type === "likert");
  if (!rows.length) return <Empty />;
  const pos = (v: number) => ((v - 1) / 4) * 100;

  return (
    <div className="mt-4 rounded-3xl border border-line bg-surface p-5 sm:p-8">
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-muted bg-surface" aria-hidden /> Avant le quiz (moyenne)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full bg-ink" aria-hidden /> Après le quiz (moyenne)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-1 w-5 rounded-full bg-good" aria-hidden /> ✓ évolution dans le sens attendu
        </span>
      </div>

      <ul className="mt-6 grid gap-5">
        {rows.map((p) => {
          const delta = p.meanPost - p.meanPre;
          const good = p.expected ? (p.expected === "agree" ? delta > 0 : delta < 0) : false;
          const [lo, hi] = [Math.min(p.meanPre, p.meanPost), Math.max(p.meanPre, p.meanPost)];
          const rightward = p.meanPost >= p.meanPre;
          return (
            <li key={p.q.id} className="grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,15rem)_1fr_6.5rem] md:items-center">
              <div className="text-sm leading-snug font-semibold md:text-base">
                <span aria-hidden>{dimEmoji(p.q)} </span>
                {shortOf(p.q)}
              </div>
              <div
                className="relative h-8"
                title={`${shortOf(p.q)} — avant ${p.meanPre.toFixed(2)} → après ${p.meanPost.toFixed(2)} (n = ${p.n})`}
              >
                {/* Repères 1 à 5 */}
                {[1, 2, 3, 4, 5].map((l) => (
                  <span key={l} className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-line" style={{ left: `${pos(l)}%` }} />
                ))}
                <span className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-line" />
                {/* Trait avant → après */}
                <span
                  className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${good ? "bg-good" : "bg-muted/50"}`}
                  style={{ left: `${pos(lo)}%`, width: `${pos(hi) - pos(lo)}%` }}
                />
                {/* Pointe de flèche côté « après » */}
                {hi - lo > 0.05 && (
                  <span
                    className={`absolute top-1/2 h-0 w-0 -translate-y-1/2 border-y-[6px] border-y-transparent ${
                      rightward ? `border-l-[8px] ${good ? "border-l-good" : "border-l-muted"}` : `border-r-[8px] ${good ? "border-r-good" : "border-r-muted"}`
                    }`}
                    style={rightward ? { left: `calc(${pos(p.meanPost)}% - 14px)` } : { left: `calc(${pos(p.meanPost)}% + 6px)` }}
                    aria-hidden
                  />
                )}
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-muted bg-surface"
                  style={{ left: `${pos(p.meanPre)}%` }}
                />
                <span
                  className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink ring-2 ring-surface"
                  style={{ left: `${pos(p.meanPost)}%` }}
                />
              </div>
              <div className="flex items-baseline gap-2 md:justify-end">
                <span className="text-lg font-bold tabular-nums">{signed(delta)}</span>
                {p.expected && (
                  <span className={`text-xs font-semibold ${good ? "text-good" : "text-muted"}`}>
                    {good ? "✓ attendu" : Math.abs(delta) < 0.05 ? "stable" : "sens inverse"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 grid md:grid-cols-[minmax(0,15rem)_1fr_6.5rem] md:gap-x-6">
        <span className="hidden md:block" />
        <div className="flex justify-between text-xs text-muted">
          <span>1 · Pas du tout d&apos;accord</span>
          <span>3 · Neutre</span>
          <span>5 · Tout à fait d&apos;accord</span>
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
