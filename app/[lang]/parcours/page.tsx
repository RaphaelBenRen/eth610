import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Flow } from "@/components/flow/Flow";
import { isLocale } from "@/lib/types";
import { getDict } from "@/messages";

export const metadata: Metadata = { robots: { index: false } };

export default async function ParcoursPage({ params }: PageProps<"/[lang]/parcours">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <Flow locale={lang} t={getDict(lang)} />;
}
