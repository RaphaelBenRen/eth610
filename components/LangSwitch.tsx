"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/types";

/** Bascule FR ⇄ EN en gardant la même page (le parcours en cours est conservé). */
export function LangSwitch({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const other: Locale = current === "fr" ? "en" : "fr";
  const href = pathname.replace(new RegExp(`^/${current}(?=/|$)`), `/${other}`);
  return (
    <Link
      href={href}
      hrefLang={other}
      className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-muted transition hover:border-brand hover:text-ink"
    >
      {label}
    </Link>
  );
}
