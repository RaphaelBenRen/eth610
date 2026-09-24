import type { Question } from "@/lib/types";

/*
 * Sondage 1 (« avant »). BROUILLON : à valider par l'équipe.
 * Les questions de REPEATED sont reposées à l'identique dans le sondage 2 (même `id`)
 * pour mesurer l'évolution de chaque répondant. Chacune touche une dimension :
 * environnementale, sociale, économique, éthique.
 */

const agree = {
  minLabel: { fr: "Pas du tout d'accord", en: "Strongly disagree" },
  maxLabel: { fr: "Tout à fait d'accord", en: "Strongly agree" },
};

export const usageFrequency: Question = {
  id: "p_usage_freq",
  type: "single",
  prompt: {
    fr: "À quelle fréquence utilises-tu des outils d'IA (assistants conversationnels, générateurs d'images, traduction…) ?",
    en: "How often do you use AI tools (chat assistants, image generators, translation…)?",
  },
  options: [
    { id: "never", label: { fr: "Jamais", en: "Never" } },
    { id: "monthly", label: { fr: "Quelques fois par mois", en: "A few times a month" } },
    { id: "weekly", label: { fr: "Quelques fois par semaine", en: "A few times a week" } },
    { id: "daily", label: { fr: "Tous les jours", en: "Every day" } },
    { id: "many_daily", label: { fr: "Plusieurs fois par jour", en: "Several times a day" } },
  ],
};

/* Environnement */
export const envImpact: Question = {
  id: "q_env_impact",
  type: "gauge",
  prompt: {
    fr: "Selon toi, quel est l'impact de l'IA sur l'environnement ?",
    en: "In your opinion, how big is AI's impact on the environment?",
  },
  help: { fr: "Glisse le curseur", en: "Drag the slider" },
  min: 0,
  max: 100,
  minLabel: { fr: "Négligeable", en: "Negligible" },
  maxLabel: { fr: "Énorme", en: "Huge" },
};

/* Éthique : discriminations */
export const fairness: Question = {
  id: "q_fairness",
  type: "likert",
  prompt: {
    fr: "« Une IA est neutre : elle traite tout le monde de la même façon. »",
    en: "“AI is neutral: it treats everyone the same way.”",
  },
  ...agree,
};

/* Social : travail humain caché */
export const hiddenLabor: Question = {
  id: "q_hidden_labor",
  type: "likert",
  prompt: {
    fr: "« L'IA fonctionne toute seule, sans travail humain derrière. »",
    en: "“AI works on its own, with no human labour behind it.”",
  },
  ...agree,
};

/* Économie */
export const econBenefit: Question = {
  id: "q_econ_benefit",
  type: "likert",
  prompt: {
    fr: "« Les bénéfices de l'IA profiteront à tout le monde, pas seulement à quelques grandes entreprises. »",
    en: "“The benefits of AI will reach everyone, not just a few big companies.”",
  },
  ...agree,
};

/* Engagement personnel */
export const changeHabit: Question = {
  id: "q_change_habit",
  type: "likert",
  prompt: {
    fr: "« Je suis prêt·e à changer ma façon d'utiliser l'IA pour limiter ses impacts négatifs. »",
    en: "“I am willing to change how I use AI to limit its negative impacts.”",
  },
  ...agree,
};

/** Questions reposées dans le sondage « après ». */
export const REPEATED: Question[] = [envImpact, fairness, hiddenLabor, econBenefit, changeHabit];

export const surveyPre: Question[] = [usageFrequency, ...REPEATED];
