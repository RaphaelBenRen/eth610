import type { Dict } from "@/messages";
import type { Locale, Question } from "./types";

export function formatNumber(n: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", { maximumFractionDigits: 1 }).format(n);
}

/** Arrondit à 2 chiffres significatifs (pour le curseur logarithmique). */
export function roundNice(n: number) {
  if (n <= 0) return 0;
  const p = 10 ** (Math.floor(Math.log10(n)) - 1);
  return Math.round(n / p) * p;
}

export function formatUnit(n: number, unit: string | undefined, locale: Locale) {
  // Grands nombres en toutes lettres : « 5,85 milliards » plutôt que « 5 850 000 000 ».
  if (n >= 1_000_000) {
    const big = new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-CA", {
      notation: "compact",
      compactDisplay: "long",
      maximumFractionDigits: 2,
    }).format(n);
    return unit ? `${big} ${unit}` : big;
  }
  if (!unit) return formatNumber(n, locale);
  return unit === "%" ? `${formatNumber(n, locale)}${locale === "fr" ? " " : ""}%` : `${formatNumber(n, locale)} ${unit}`;
}

/** Texte « bonne réponse » affiché dans la carte de feedback. */
export function formatCorrect(q: Question, locale: Locale, t: Dict): string {
  switch (q.type) {
    case "single":
      return q.options.find((o) => o.id === q.correct)?.label[locale] ?? "";
    case "multi":
      return q.options
        .filter((o) => q.correct?.includes(o.id))
        .map((o) => o.label[locale])
        .join(", ");
    case "true_false":
      return q.correct ? t.flow.true : t.flow.false;
    case "ab":
      return q.correct ? q[q.correct].label[locale] : "";
    case "gauge":
      return q.correct === undefined ? "" : formatUnit(q.correct, q.unit, locale);
    case "estimate":
      return q.correct === undefined ? "" : formatUnit(q.correct, q.unit[locale], locale);
    case "ranking":
      return (q.correct ?? []).map((id, i) => `${i + 1}. ${q.items.find((it) => it.id === id)?.label[locale]}`).join("  ");
    case "likert":
      return "";
  }
}
