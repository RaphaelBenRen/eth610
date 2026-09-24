"use client";

import { useState } from "react";
import type { MultiQ } from "@/lib/types";
import { Kbd, SubmitButton, useHotkeys, type QProps } from "./shared";

export function Multi({ q, locale, t, answer, revealed, onAnswer }: QProps<MultiQ>) {
  const [sel, setSel] = useState<string[]>(answer && "choices" in answer ? answer.choices : []);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const submit = () => sel.length > 0 && onAnswer({ choices: q.options.map((o) => o.id).filter((id) => sel.includes(id)) });

  useHotkeys((key) => {
    const i = Number(key) - 1;
    if (q.options[i]) toggle(q.options[i].id);
    if (key === "Enter") submit();
  }, !revealed);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const on = sel.includes(o.id);
          const state = revealed && q.correct ? (q.correct.includes(o.id) ? "is-correct" : on ? "is-wrong" : "opacity-60") : "";
          return (
            <button
              key={o.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              className={`choice ${state}`}
              disabled={revealed}
              onClick={() => toggle(o.id)}
            >
              <span
                aria-hidden
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 text-sm ${
                  on ? "border-brand bg-brand text-brand-ink" : "border-line"
                }`}
              >
                {on && "✓"}
              </span>
              {o.emoji && <span className="text-xl" aria-hidden>{o.emoji}</span>}
              <span className="flex-1">{o.label[locale]}</span>
              {!revealed && <Kbd>{i + 1}</Kbd>}
            </button>
          );
        })}
      </div>
      {!revealed && <SubmitButton t={t} disabled={sel.length === 0} onClick={submit} />}
    </>
  );
}
