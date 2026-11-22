"use client";

import Image from "next/image";
import { useState } from "react";
import { IMAGE_BLUR } from "@/content/image-blur";
import { IMAGE_CREDITS } from "@/content/image-credits";
import { PHOTOS } from "@/content/photos";

/**
 * Photo d'illustration (assets/photos/<name>.webp) avec crédit obligatoire (licences CC BY / CC BY-SA).
 * Décorative : le texte de la question porte le sens, donc alt="".
 * Quand `name` change, la nouvelle photo apparaît en fondu par-dessus l'ancienne : le cadre n'est jamais vide.
 */
export function Photo({
  name,
  className = "",
  preload,
  overlay,
  children,
}: {
  name: string;
  className?: string;
  /** Photo visible dès l'arrivée sur la page (accueil, fin). */
  preload?: boolean;
  /** Dégradé sombre pour rendre lisible du texte posé sur l'image. */
  overlay?: "bottom" | "full";
  children?: React.ReactNode;
}) {
  const [shown, setShown] = useState<{ current: string; previous?: string }>({ current: name });
  if (shown.current !== name) setShown({ current: name, previous: shown.current });
  const credit = IMAGE_CREDITS[name];

  return (
    <div className={`relative isolate overflow-hidden bg-surface-2 ${className}`}>
      {[shown.previous, shown.current].map(
        (n, i) =>
          n && (
            <Image
              key={n}
              src={PHOTOS[n]}
              alt=""
              fill
              unoptimized
              preload={preload}
              loading={preload ? undefined : "eager"}
              decoding="sync"
              // Aperçu flou en fond de l'image elle-même : visible seulement si la photo n'est pas encore arrivée.
              style={{ backgroundImage: `url(${IMAGE_BLUR[n]})`, backgroundSize: "cover", backgroundPosition: "center" }}
              className={`object-cover ${i === 1 && shown.previous ? "photo-in" : ""}`}
            />
          ),
      )}
      {overlay === "bottom" && <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/5" />}
      {overlay === "full" && <div className="absolute inset-0 bg-black/55" />}
      {children}
      {credit && (
        <a
          href={credit.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-2 bottom-1 z-10 max-w-[75%] truncate text-[10px] text-white/70 hover:text-white"
          style={{ textShadow: "0 1px 2px rgb(0 0 0 / 0.7)" }}
        >
          📷 {credit.author} · {credit.license}
        </a>
      )}
    </div>
  );
}

/** Charge à l'avance (invisible) les photos des écrans suivants. */
export function PhotoPreloader({ names }: { names: string[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0">
      {names.map((n) => (
        <Image key={n} src={PHOTOS[n]} alt="" fill unoptimized loading="eager" />
      ))}
    </div>
  );
}
