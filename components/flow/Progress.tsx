import type { Dict } from "@/messages";
import { PHASES, type Phase } from "@/lib/types";

/** Barre de progression en 3 segments : Sondage / Quiz / Sondage. */
export function Progress({ t, phase, fracInPhase }: { t: Dict; phase: Phase; fracInPhase: number }) {
  const current = PHASES.indexOf(phase);
  return (
    <div className="grid grid-cols-[1fr_1.6fr_1fr] gap-2" aria-hidden>
      {PHASES.map((p, i) => {
        const fill = i < current ? 1 : i === current ? fracInPhase : 0;
        return (
          <div key={p}>
            <div className="h-2 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand transition-[width] duration-500" style={{ width: `${fill * 100}%` }} />
            </div>
            <div className={`mt-1.5 text-xs font-medium ${i === current ? "text-ink" : "text-muted"}`}>
              {i + 1}. {t.flow.phases[p]}
            </div>
          </div>
        );
      })}
    </div>
  );
}
