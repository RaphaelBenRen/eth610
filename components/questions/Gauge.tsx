"use client";

import { useState } from "react";
import { formatUnit } from "@/lib/format";
import { gaugeBounds } from "@/lib/scoring";
import type { GaugeQ } from "@/lib/types";
import { SubmitButton, useHotkeys, type QProps } from "./shared";
import { Slider } from "./Slider";

export function Gauge({ q, locale, t, answer, revealed, onAnswer }: QProps<GaugeQ>) {
  const { min, max } = gaugeBounds(q);
  const initial = answer && "value" in answer ? answer.value : undefined;
  const [value, setValue] = useState(initial ?? (min + max) / 2);
  const [touched, setTouched] = useState(initial !== undefined);
  const frac = (v: number) => (v - min) / (max - min);

  const submit = () => touched && onAnswer({ value });
  useHotkeys((key) => key === "Enter" && submit(), !revealed);

  return (
    <>
      <Slider
        min={min}
        max={max}
        step={q.step ?? 1}
        value={value}
        touched={touched}
        disabled={revealed}
        label={q.prompt[locale]}
        valueText={formatUnit(value, q.unit, locale)}
        onChange={(v) => {
          setValue(v);
          setTouched(true);
        }}
        marker={
          revealed && q.correct !== undefined
            ? { frac: frac(q.correct), label: formatUnit(q.correct, q.unit, locale) }
            : undefined
        }
        markerFrom={frac(value)}
      />
      <div className={`flex justify-between gap-4 text-sm text-muted ${revealed ? "mt-9" : "mt-1"}`}>
        <span>{q.minLabel?.[locale] ?? formatUnit(min, q.unit, locale)}</span>
        <span className="text-right">{q.maxLabel?.[locale] ?? formatUnit(max, q.unit, locale)}</span>
      </div>
      {!revealed && <SubmitButton t={t} disabled={!touched} onClick={submit} />}
    </>
  );
}
