import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoGallery } from "@/components/DemoGallery";
import { isLocale } from "@/lib/types";
import { getDict } from "@/messages";

export const metadata: Metadata = { title: "Démo des types de questions", robots: { index: false } };

export default async function DemoPage({ params }: PageProps<"/[lang]/demo">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold">Démo : types de questions</h1>
      <p className="mt-1 text-muted">Page de test pour l&apos;équipe. Rien n&apos;est enregistré.</p>
      <div className="mt-6">
        <DemoGallery locale={lang} t={getDict(lang)} />
      </div>
    </div>
  );
}
