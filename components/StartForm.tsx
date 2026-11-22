"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { KEYS, load, loadRun, resetRun, save } from "@/lib/client/storage";
import { useHydrated } from "@/lib/client/useHydrated";
import type { Locale } from "@/lib/types";
import type { Dict } from "@/messages";

export function StartForm({ locale, t }: { locale: Locale; t: Dict }) {
  const router = useRouter();
  const hydrated = useHydrated();
  // Case non contrôlée : sur un téléphone lent, on peut la cocher avant que React soit prêt. On reprend alors son état.
  const box = useRef<HTMLInputElement>(null);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    if (!box.current) return;
    if (load<boolean>(KEYS.consent)) box.current.checked = true;
    setConsent(box.current.checked);
  }, []);
  const canResume = hydrated && loadRun() !== null;

  const start = (fresh: boolean) => {
    save(KEYS.consent, true);
    if (fresh) resetRun();
    router.push(`/${locale}/parcours`);
  };

  return (
    <form
      className="sm:mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (consent) start(true);
      }}
    >
      <label className="flex cursor-pointer items-start gap-3 text-[0.8rem] leading-snug text-muted sm:text-sm sm:leading-relaxed">
        <input
          ref={box}
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-brand"
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span>{t.home.consent}</span>
      </label>
      <button type="submit" className="btn btn-primary mt-4 w-full text-lg sm:mt-5" disabled={!consent}>
        {t.home.start} →
      </button>
      {canResume && (
        <button type="button" className="btn btn-ghost mt-2 w-full" onClick={() => start(false)}>
          {t.home.resume}
        </button>
      )}
    </form>
  );
}
