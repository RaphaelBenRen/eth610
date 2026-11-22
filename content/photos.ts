import type { StaticImageData } from "next/image";
import bulb from "@/assets/photos/bulb.webp";
import bulbs from "@/assets/photos/bulbs.webp";
import cameras from "@/assets/photos/cameras.webp";
import cooling from "@/assets/photos/cooling.webp";
import gpu from "@/assets/photos/gpu.webp";
import hero from "@/assets/photos/hero.webp";
import interview from "@/assets/photos/interview.webp";
import interviewWoman from "@/assets/photos/interview-woman.webp";
import money from "@/assets/photos/money.webp";
import padlock from "@/assets/photos/padlock.webp";
import phone from "@/assets/photos/phone.webp";
import powerlines from "@/assets/photos/powerlines.webp";
import robots from "@/assets/photos/robots.webp";
import serversCorridor from "@/assets/photos/servers-corridor.webp";
import sunsetLines from "@/assets/photos/sunset-lines.webp";
import workers from "@/assets/photos/workers.webp";

/*
 * Photos importées (et non servies depuis /public) : leur adresse contient une empreinte, donc le navigateur les garde
 * en cache définitivement. Depuis /public ou /_next/image, Vercel les fait revérifier à chaque affichage.
 */
export const PHOTOS: Record<string, StaticImageData> = {
  bulb: bulb,
  bulbs: bulbs,
  cameras: cameras,
  cooling: cooling,
  gpu: gpu,
  hero: hero,
  interview: interview,
  "interview-woman": interviewWoman,
  money: money,
  padlock: padlock,
  phone: phone,
  powerlines: powerlines,
  robots: robots,
  "servers-corridor": serversCorridor,
  "sunset-lines": sunsetLines,
  workers: workers,
};
