import type { Question } from "@/lib/types";

/*
 * Sondage 1 (« avant »). BROUILLON : à valider par l'équipe.
 * Les questions exportées dans REPEATED sont reposées à l'identique dans le sondage 2
 * (même `id`) pour mesurer l'évolution de chaque répondant.
 */

export const usageFrequency: Question = {
  id: "p_usage_freq",
  type: "single",
  prompt: {
    fr: "À quelle fréquence utilises-tu des outils d'IA générative (ChatGPT, Copilot, Gemini…) ?",
    en: "How often do you use generative AI tools (ChatGPT, Copilot, Gemini…)?",
  },
  options: [
    { id: "never", label: { fr: "Jamais", en: "Never" } },
    { id: "monthly", label: { fr: "Quelques fois par mois", en: "A few times a month" } },
    { id: "weekly", label: { fr: "Quelques fois par semaine", en: "A few times a week" } },
    { id: "daily", label: { fr: "Tous les jours", en: "Every day" } },
    { id: "many_daily", label: { fr: "Plusieurs fois par jour", en: "Several times a day" } },
  ],
};

export const usageType: Question = {
  id: "p_usage_type",
  type: "multi",
  prompt: { fr: "Tu l'utilises surtout pour…", en: "You mostly use it for…" },
  help: { fr: "Plusieurs choix possibles", en: "Select all that apply" },
  options: [
    { id: "study", emoji: "📚", label: { fr: "Études / devoirs", en: "Studies / homework" } },
    { id: "code", emoji: "💻", label: { fr: "Programmer", en: "Coding" } },
    { id: "writing", emoji: "✍️", label: { fr: "Rédiger / traduire", en: "Writing / translating" } },
    { id: "images", emoji: "🎨", label: { fr: "Images / vidéos", en: "Images / videos" } },
    { id: "work", emoji: "💼", label: { fr: "Travail / stage", en: "Work / internship" } },
    { id: "fun", emoji: "🎮", label: { fr: "Loisirs / curiosité", en: "Fun / curiosity" } },
  ],
};

export const envConcern: Question = {
  id: "q_env_concern",
  type: "likert",
  prompt: {
    fr: "« L'impact environnemental de l'IA me préoccupe. »",
    en: "“The environmental impact of AI worries me.”",
  },
  minLabel: { fr: "Pas du tout d'accord", en: "Strongly disagree" },
  maxLabel: { fr: "Tout à fait d'accord", en: "Strongly agree" },
};

export const envImpactPerceived: Question = {
  id: "q_env_impact",
  type: "gauge",
  prompt: {
    fr: "Selon toi, quel est l'impact environnemental de ton usage de l'IA ?",
    en: "In your opinion, how big is the environmental impact of your AI use?",
  },
  help: { fr: "Glisse le curseur", en: "Drag the slider" },
  min: 0,
  max: 100,
  minLabel: { fr: "Négligeable", en: "Negligible" },
  maxLabel: { fr: "Énorme", en: "Huge" },
};

export const socialFair: Question = {
  id: "q_social_fair",
  type: "likert",
  prompt: {
    fr: "« Les personnes qui entraînent et modèrent les IA sont traitées équitablement. »",
    en: "“The people who train and moderate AI systems are treated fairly.”",
  },
  minLabel: { fr: "Pas du tout d'accord", en: "Strongly disagree" },
  maxLabel: { fr: "Tout à fait d'accord", en: "Strongly agree" },
};

export const changeHabit: Question = {
  id: "q_change_habit",
  type: "likert",
  prompt: {
    fr: "« Je suis prêt·e à changer ma façon d'utiliser l'IA pour réduire son impact. »",
    en: "“I am willing to change how I use AI to reduce its impact.”",
  },
  minLabel: { fr: "Pas du tout d'accord", en: "Strongly disagree" },
  maxLabel: { fr: "Tout à fait d'accord", en: "Strongly agree" },
};

/** Questions reposées dans le sondage « après ». */
export const REPEATED: Question[] = [envConcern, envImpactPerceived, socialFair, changeHabit];

export const surveyPre: Question[] = [usageFrequency, usageType, ...REPEATED];
