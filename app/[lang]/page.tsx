import { notFound } from "next/navigation";
import { Photo } from "@/components/Photo";
import { StartForm } from "@/components/StartForm";
import { CONTENT } from "@/content";
import { isLocale } from "@/lib/types";
import { getDict } from "@/messages";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <div className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-4 px-4 py-4 sm:gap-10 sm:px-6 md:py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <Photo name="hero" className="rounded-3xl shadow-sm" overlay="full" priority sizes="(min-width: 1024px) 560px, 100vw">
        <div className="relative px-5 pt-6 pb-8 text-white sm:p-10 lg:py-14">
          <p className="text-xs font-semibold tracking-widest text-white/80 uppercase sm:text-sm">{t.home.kicker}</p>
          <h1 className="mt-2 text-[2.25rem] leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t.home.title}
          </h1>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-white/85 sm:mt-5 sm:text-lg">{t.home.subtitle}</p>
          <ul className="mt-4 flex flex-wrap gap-1.5 sm:mt-6 sm:gap-2">
            {t.home.pills.map((p) => (
              <li
                key={p}
                className="rounded-full border border-white/25 bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur sm:px-3 sm:text-sm"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Photo>

      <div className="rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-8">
        <ol className="hidden grid-cols-3 gap-2 sm:grid lg:grid-cols-1 lg:gap-3">
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
                <span className="hidden text-sm text-muted lg:block">{s.text.replace("{n}", String(CONTENT.quiz.length))}</span>
              </span>
            </li>
          ))}
        </ol>
        <StartForm locale={lang} t={t} />
      </div>
    </div>
  );
}
