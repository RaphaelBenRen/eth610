import { notFound } from "next/navigation";
import { EndScreen } from "@/components/EndScreen";
import { tips } from "@/content/tips";
import { isLocale } from "@/lib/types";
import { getDict } from "@/messages";

export default async function MerciPage({ params }: PageProps<"/[lang]/merci">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 md:py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">{t.end.title}</h1>
      <EndScreen locale={lang} t={t} />
      <p className="mt-8 text-lg font-semibold">{t.end.subtitle}</p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tips.map((tip) => (
          <li key={tip.title.fr} className="rounded-2xl border border-line bg-surface p-5">
            <div className="text-3xl" aria-hidden>{tip.emoji}</div>
            <h2 className="mt-2 font-bold">{tip.title[lang]}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{tip.text[lang]}</p>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-center text-sm text-muted">{t.end.footer}</p>
    </div>
  );
}
