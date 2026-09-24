"use client";

import { useState } from "react";
import { formatUnit, roundNice } from "@/lib/format";
import type { EstimateQ } from "@/lib/types";
import { SubmitButton, useHotkeys, type QProps } from "./shared";
import { Slider } from "./Slider";

const STEPS = 1000;

/** Curseur logarithmique : chaque ordre de grandeur occupe la même largeur. */
export function Estimate({ q, locale, t, answer, revealed, onAnswer }: QProps<EstimateQ>) {
  const lmin = Math.log10(q.min);
  const lmax = Math.log10(q.max);
  const toPos = (v: number) => Math.round(((Math.log10(v) - lmin) / (lmax - lmin)) * STEPS);
  const toValue = (p: number) => Math.min(q.max, Math.max(q.min, roundNice(10 ** (lmin + (p / STEPS) * (lmax - lmin)))));

  const initial = answer && "value" in answer ? answer.value : undefined;
  const [pos, setPos] = useState(initial !== undefined ? toPos(initial) : STEPS / 2);
  const [touched, setTouched] = useState(initial !== undefined);
  const value = toValue(pos);
  const unit = q.unit[locale];

  const submit = () => touched && onAnswer({ value });
  useHotkeys((key) => key === "Enter" && submit(), !revealed);

  const ticks = [];
  for (let e = Math.ceil(lmin); e <= Math.floor(lmax); e++) {
    ticks.push({ frac: (e - lmin) / (lmax - lmin), label: compact(10 ** e, locale) });
  }

  return (
    <>
      <Slider
        min={0}
        max={STEPS}
        step={1}
        value={pos}
        touched={touched}
        disabled={revealed}
        label={q.prompt[locale]}
        valueText={formatUnit(value, unit, locale)}
        onChange={(p) => {
          setPos(p);
          setTouched(true);
        }}
        ticks={ticks}
        marker={
          revealed && q.correct !== undefined
            ? { frac: toPos(q.correct) / STEPS, label: formatUnit(q.correct, unit, locale) }
            : undefined
        }
        markerFrom={pos / STEPS}
      />
      {!revealed && <p className="mt-2 text-center text-sm text-muted">{t.flow.estimateHint}</p>}
      {!revealed && <SubmitButton t={t} disabled={!touched} onClick={submit} />}
    </>
  );
}

function compact(n: number, locale: string) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-CA", { notation: "compact" }).format(n);
}
