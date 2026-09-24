"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { KEYS, load, resetRun } from "@/lib/client/storage";
import { sync } from "@/lib/client/sync";
import { useHydrated } from "@/lib/client/useHydrated";
import type { Locale } from "@/lib/types";
import type { Dict } from "@/messages";

/** Score + boutons partager / recommencer (côté client : lit le résultat en sessionStorage). */
export function EndScreen({ locale, t }: { locale: Locale; t: Dict }) {
  const hydrated = useHydrated();
  const result = hydrated ? load<{ correct: number; total: number }>(KEYS.result) : null;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Termine l'envoi des dernières réponses si le réseau avait coupé.
    sync.setLocale(locale);
    void sync.flush();
  }, [locale]);

  const share = async () => {
    const url = `${window.location.origin}/${locale}`;
    try {
      if (navigator.share) await navigator.share({ title: t.meta.title, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* partage annulé */
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      {result && (
        <div className="rounded-2xl bg-brand-soft px-5 py-4">
          <div className="text-sm text-muted">{t.end.scoreLabel}</div>
          <div className="text-3xl font-extrabold tabular-nums">
            {result.correct} / {result.total}
          </div>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn btn-primary" onClick={share}>
          {copied ? t.end.copied : t.end.share}
        </button>
        <Link href={`/${locale}`} className="btn btn-ghost" onClick={() => resetRun()}>
          {t.end.restart}
        </Link>
      </div>
    </div>
  );
}
