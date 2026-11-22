import Image from "next/image";
import { IMAGE_BLUR } from "@/content/image-blur";
import { IMAGE_CREDITS } from "@/content/image-credits";

/**
 * Photo d'illustration (public/images/<name>.jpg) avec crédit obligatoire (licences CC BY / CC BY-SA).
 * Décorative : le texte de la question porte le sens, donc alt="".
 */
export function Photo({
  name,
  className = "",
  sizes = "100vw",
  preload,
  overlay,
  children,
}: {
  name: string;
  className?: string;
  sizes?: string;
  /** Photo visible dès l'arrivée sur la page (accueil, fin). */
  preload?: boolean;
  /** Dégradé sombre pour rendre lisible du texte posé sur l'image. */
  overlay?: "bottom" | "full";
  children?: React.ReactNode;
}) {
  const credit = IMAGE_CREDITS[name];
  return (
    <div className={`relative isolate overflow-hidden bg-surface-2 ${className}`}>
      <Image
        src={`/images/${name}.jpg`}
        alt=""
        fill
        sizes={sizes}
        preload={preload}
        loading={preload ? undefined : "eager"}
        // sync : une photo déjà préchargée s'affiche dans la même image que le texte, sans clignoter.
        decoding="sync"
        placeholder="blur"
        blurDataURL={IMAGE_BLUR[name]}
        className="object-cover"
      />
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

/** Charge à l'avance (invisible) les photos des écrans suivants. `sizes` doit être celui de l'écran visé. */
export function PhotoPreloader({ photos }: { photos: { name: string; sizes: string }[] }) {
  return (
    <div aria-hidden className="pointer-events-none fixed top-0 left-0 -z-10 h-px w-px overflow-hidden opacity-0">
      {photos.map((p) => (
        <Image key={p.name} src={`/images/${p.name}.jpg`} alt="" fill sizes={p.sizes} loading="eager" />
      ))}
    </div>
  );
}
