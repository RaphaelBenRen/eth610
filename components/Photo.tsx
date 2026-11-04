import Image from "next/image";
import { IMAGE_CREDITS } from "@/content/image-credits";

/**
 * Photo d'illustration (public/images/<name>.jpg) avec crédit obligatoire (licences CC BY / CC BY-SA).
 * Décorative : le texte de la question porte le sens, donc alt="".
 */
export function Photo({
  name,
  className = "",
  sizes = "100vw",
  priority,
  overlay,
  children,
}: {
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Dégradé sombre pour rendre lisible du texte posé sur l'image. */
  overlay?: "bottom" | "full";
  children?: React.ReactNode;
}) {
  const credit = IMAGE_CREDITS[name];
  return (
    <div className={`relative overflow-hidden bg-surface-2 ${className}`}>
      <Image src={`/images/${name}.jpg`} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
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
