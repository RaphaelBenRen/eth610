import { notFound } from "next/navigation";
import { StartForm } from "@/components/StartForm";
import { isLocale } from "@/lib/types";
import { getDict } from "@/messages";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-6 px-4 py-6 sm:gap-10 sm:px-6 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <div>
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">{t.home.kicker}</p>
        <h1 className="mt-2 text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {t.home.title}
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:mt-5 sm:text-lg">{t.home.subtitle}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
          {t.home.pills.map((p) => (
            <li key={p} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-medium sm:px-3 sm:text-sm">
              {p}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-8">
        <ol className="grid grid-cols-3 gap-2 lg:grid-cols-1 lg:gap-3">
          {t.home.steps.map((s, i) => (
            <li
              key={i}
              className="flex flex-col items-center gap-1 rounded-2xl bg-surface-2 p-2 text-center sm:p-3 lg:flex-row lg:gap-4 lg:p-4 lg:text-left"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-ink lg:h-10 lg:w-10 lg:text-base">
                {i + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold lg:text-base">{s.title}</span>
                <span className="hidden text-sm text-muted lg:block">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <StartForm locale={lang} t={t} />
      </div>
    </div>
  );
}
