"use client";

import { motion } from "motion/react";

/** Position horizontale alignée sur le centre du pouce (32 px de large). */
const left = (frac: number) => `calc(${frac} * (100% - 32px) + 16px)`;

type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  touched: boolean;
  disabled?: boolean;
  label: string;
  valueText: string;
  onChange: (v: number) => void;
  /** Graduations affichées sous le curseur. */
  ticks?: { frac: number; label: string }[];
  /** Bonne réponse, affichée après validation. */
  marker?: { frac: number; label: string };
  /** Position de départ de l'animation du marqueur (= réponse de l'utilisateur). */
  markerFrom?: number;
};

export function Slider({ min, max, step, value, touched, disabled, label, valueText, onChange, ticks, marker, markerFrom }: Props) {
  const frac = (value - min) / (max - min);
  return (
    <div className="relative select-none">
      {/* Valeur choisie, en grand, au-dessus du pouce */}
      <div className="relative h-14">
        <div
          className={`absolute bottom-1 -translate-x-1/2 rounded-xl px-3 py-1 text-xl font-bold whitespace-nowrap tabular-nums transition-colors sm:text-2xl ${
            touched ? "bg-brand text-brand-ink" : "bg-surface-2 text-muted"
          }`}
          style={{ left: left(frac) }}
        >
          {touched ? valueText : "?"}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          className={`range ${touched ? "" : "untouched"}`}
          style={{ "--pct": left(frac) } as React.CSSProperties}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={valueText}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={(e) => onChange(Number((e.target as HTMLInputElement).value))}
        />
        {marker && (
          <motion.div
            className="pointer-events-none absolute top-0 flex h-full -translate-x-1/2 flex-col items-center"
            initial={{ left: left(markerFrom ?? marker.frac), opacity: 0 }}
            animate={{ left: left(marker.frac), opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <div className="h-full w-1 rounded-full bg-good" />
            <div className="absolute top-full mt-1 rounded-lg bg-good px-2 py-0.5 text-sm font-bold whitespace-nowrap text-white">
              ✓ {marker.label}
            </div>
          </motion.div>
        )}
      </div>

      {ticks && (
        <div className={`relative h-6 text-xs text-muted ${marker ? "mt-8" : "mt-1"}`}>
          {ticks.map((tk) => (
            <span key={tk.label} className="absolute -translate-x-1/2 tabular-nums" style={{ left: left(tk.frac) }}>
              {tk.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
