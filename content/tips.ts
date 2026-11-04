import type { L } from "@/lib/types";

/* Conseils de l'écran final. BROUILLON : à valider par l'équipe. */
export const tips: { emoji: string; title: L; text: L }[] = [
  {
    emoji: "🔢",
    title: { fr: "Chaque requête compte", en: "Every prompt adds up" },
    text: {
      fr: "Une requête consomme peu, mais des milliards de requêtes pèsent lourd. Une recherche classique ou ta propre réflexion suffisent souvent.",
      en: "One prompt uses little, but billions of prompts weigh a lot. A regular search or your own thinking is often enough.",
    },
  },
  {
    emoji: "🖼️",
    title: { fr: "Éviter les générations « pour le fun »", en: "Skip “just for fun” generations" },
    text: {
      fr: "Images et vidéos générées en boucle consomment bien plus d'énergie et d'eau qu'une réponse texte.",
      en: "Images and videos generated over and over use far more energy and water than a text answer.",
    },
  },
  {
    emoji: "⚖️",
    title: { fr: "Une IA n'est pas neutre", en: "AI is not neutral" },
    text: {
      fr: "Elle reproduit les biais de ses données. Vérifie ses réponses, surtout quand elles concernent des personnes.",
      en: "It reproduces the biases in its data. Check its answers, especially when they concern people.",
    },
  },
  {
    emoji: "🔒",
    title: { fr: "Protéger tes données", en: "Protect your data" },
    text: {
      fr: "Ne partage pas d'informations de santé, privées ou confidentielles, et désactive l'utilisation de tes conversations pour l'entraînement dans les réglages.",
      en: "Don't share health, private or confidential information, and turn off the use of your conversations for training in the settings.",
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
