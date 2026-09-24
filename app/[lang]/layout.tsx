import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LangSwitch } from "@/components/LangSwitch";
import { isLocale, LOCALES } from "@/lib/types";
import { getDict } from "@/messages";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const generateStaticParams = () => LOCALES.map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: { title: t.meta.title, description: t.meta.description, type: "website" },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1713" },
  ],
};

export default async function PublicLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDict(lang);

  return (
    <html lang={lang} className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col pb-[env(safe-area-inset-bottom)]">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
          <Link href={`/${lang}`} className="flex items-center gap-2 font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-sm text-brand-ink" aria-hidden>
              🌱
            </span>
            <span className="hidden sm:inline">{t.home.title}</span>
          </Link>
          <LangSwitch current={lang} label={t.common.switchLang} />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
