import type { L } from "@/lib/types";

/* Conseils de l'écran final. BROUILLON : à valider par l'équipe. */
export const tips: { emoji: string; title: L; text: L }[] = [
  {
    emoji: "🧰",
    title: { fr: "Le bon outil pour le bon besoin", en: "The right tool for the job" },
    text: {
      fr: "Une recherche classique, un dictionnaire ou une calculatrice suffisent souvent, et consomment bien moins.",
      en: "A regular search, a dictionary or a calculator is often enough, and uses far less.",
    },
  },
  {
    emoji: "🎯",
    title: { fr: "Des demandes précises", en: "Precise prompts" },
    text: {
      fr: "Un prompt clair du premier coup évite de relancer 5 fois la même demande.",
      en: "A clear prompt the first time avoids regenerating the same request 5 times.",
    },
  },
  {
    emoji: "🖼️",
    title: { fr: "Images et vidéos avec modération", en: "Go easy on images and video" },
    text: {
      fr: "Générer des images ou des vidéos « pour le fun » en boucle a un coût énergétique bien plus élevé que du texte.",
      en: "Generating images or videos “for fun” over and over costs far more energy than text.",
    },
  },
  {
    emoji: "🪶",
    title: { fr: "Des modèles plus légers", en: "Lighter models" },
    text: {
      fr: "Pour les tâches simples, un petit modèle (ou un modèle local) fait souvent l'affaire.",
      en: "For simple tasks, a small (or local) model often does the job.",
    },
  },
  {
    emoji: "🔍",
    title: { fr: "Rester curieux·se et critique", en: "Stay curious and critical" },
    text: {
      fr: "Informe-toi sur les conditions de travail et les politiques environnementales des entreprises d'IA que tu utilises.",
      en: "Learn about the working conditions and environmental policies of the AI companies you use.",
    },
  },
];
