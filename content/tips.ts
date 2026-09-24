import type { L } from "@/lib/types";

/* Conseils de l'écran final. BROUILLON : à valider par l'équipe. */
export const tips: { emoji: string; title: L; text: L }[] = [
  {
    emoji: "🤔",
    title: { fr: "Se demander : ai-je vraiment besoin d'une IA ?", en: "Ask yourself: do I really need AI?" },
    text: {
      fr: "Une recherche classique, un dictionnaire ou ta propre réflexion suffisent souvent, et consomment bien moins.",
      en: "A regular search, a dictionary or your own thinking is often enough, and uses far less.",
    },
  },
  {
    emoji: "🖼️",
    title: { fr: "Éviter les générations « pour le fun »", en: "Skip “just for fun” generations" },
    text: {
      fr: "Images et vidéos générées en boucle pour suivre une tendance ont un coût énergétique et en eau bien réel.",
      en: "Images and videos generated over and over to follow a trend have a very real energy and water cost.",
    },
  },
  {
    emoji: "🔍",
    title: { fr: "Garder un esprit critique", en: "Stay critical" },
    text: {
      fr: "Une IA n'est pas neutre : vérifie ses réponses, surtout quand elles concernent des personnes ou des groupes.",
      en: "AI is not neutral: check its answers, especially when they concern people or groups.",
    },
  },
  {
    emoji: "🎨",
    title: { fr: "Respecter le travail des autres", en: "Respect other people's work" },
    text: {
      fr: "Soutiens les artistes et créateurs humains ; ne génère pas d'images de vraies personnes sans leur accord.",
      en: "Support human artists and creators; never generate images of real people without their consent.",
    },
  },
  {
    emoji: "📣",
    title: { fr: "En parler et exiger la transparence", en: "Talk about it and demand transparency" },
    text: {
      fr: "Partage ce que tu as appris et interroge les entreprises (et ton futur employeur) sur leurs impacts sociaux et environnementaux.",
      en: "Share what you learned and question companies (and your future employer) about their social and environmental impacts.",
    },
  },
];
