import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin · IA, ce qu'on ne voit pas",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
