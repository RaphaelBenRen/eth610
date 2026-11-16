import type { L, Question } from "@/lib/types";

/*
 * Sondage 1 (« avant »), contenu final de l'équipe.
 * Ordre : environnement, société, économie.
 * Toutes ces questions sont reposées à l'identique dans le sondage 2 (même `id`)
 * pour mesurer l'évolution de chaque répondant.
 */

/** Libellés du niveau 1 (désaccord total) au niveau 5 (accord total). */
const AGREE: L[] = [
  { fr: "Tout à fait pas d'accord", en: "Strongly disagree" },
  { fr: "Plutôt pas d'accord", en: "Somewhat disagree" },
  { fr: "Ni d'accord, ni pas d'accord", en: "Neither agree nor disagree" },
  { fr: "Plutôt d'accord", en: "Somewhat agree" },
  { fr: "Tout à fait d'accord", en: "Strongly agree" },
];

const agree = { minLabel: AGREE[0], maxLabel: AGREE[4], labels: AGREE };

const statement = (fr: string, en: string): L => ({ fr: `« ${fr} »`, en: `“${en}”` });

/* 🌍 Environnement 1 */
export const env1: Question = {
  id: "s_env_1",
  type: "likert",
  short: { fr: "2 h d'IA par jour = impact négligeable", en: "2 h of AI a day = negligible impact" },
  expected: "disagree",
  dimension: "env",
  image: "phone",
  prompt: statement(
    "Utiliser une IA de pointe (par exemple ChatGPT, Gemini ou Claude) pendant 2 heures par jour a un impact écologique négligeable.",
    "Using a cutting-edge AI (for example ChatGPT, Gemini or Claude) for 2 hours a day has a negligible ecological impact.",
  ),
  ...agree,
};

/* 🌍 Environnement 2 */
export const env2: Question = {
  id: "s_env_2",
  type: "likert",
  short: { fr: "Les centres de données ont un fort impact", en: "Data centres have a major impact" },
  expected: "agree",
  dimension: "env",
  image: "cooling",
  prompt: statement(
    "L'électricité et l'eau consommées par les centres de données (serveurs, refroidissement) qui font fonctionner l'IA ont un impact négatif très important sur l'environnement.",
    "The electricity and water consumed by the data centres (servers, cooling) that run AI have a very significant negative impact on the environment.",
  ),
  ...agree,
};

/* 👥 Société 1 */
export const soc1: Question = {
  id: "s_soc_1",
  type: "likert",
  short: { fr: "L'IA est plus objective qu'un humain", en: "AI is more objective than a human" },
  expected: "disagree",
  dimension: "soc",
  image: "interview",
  prompt: statement(
    "Un algorithme d'IA est par nature plus objectif, neutre et équitable qu'un être humain pour prendre des décisions (recrutement, tri de candidatures, évaluation).",
    "An AI algorithm is by nature more objective, neutral and fair than a human being at making decisions (hiring, screening applications, evaluation).",
  ),
  ...agree,
};

/* 👥 Société 2 */
export const soc2: Question = {
  id: "s_soc_2",
  type: "likert",
  short: { fr: "Mes prompts restent privés", en: "My prompts stay private" },
  expected: "disagree",
  dimension: "soc",
  image: "padlock",
  prompt: statement(
    "Les informations confidentielles ou personnelles que j'écris dans un prompt d'IA (données de santé, documents d'entreprise, messages privés) restent privées et ne servent pas à réentraîner le modèle.",
    "The confidential or personal information I type into an AI prompt (health data, company documents, private messages) stays private and is not used to retrain the model.",
  ),
  ...agree,
};

/* 💰 Économie 1 */
export const eco1: Question = {
  id: "s_eco_1",
  type: "likert",
  short: { fr: "Une PME peut entraîner son propre modèle", en: "An SME can train its own model" },
  expected: "disagree",
  dimension: "eco",
  image: "money",
  prompt: statement(
    "L'entraînement d'une IA de pointe, comparable à ChatGPT ou Gemini, est aujourd'hui assez abordable pour permettre à une petite ou moyenne entreprise de développer son propre modèle.",
    "Training a cutting-edge AI, comparable to ChatGPT or Gemini, is now affordable enough for a small or medium-sized business to develop its own model.",
  ),
  ...agree,
};

/* 💰 Économie 2 */
export const eco2: Question = {
  id: "s_eco_2",
  type: "likert",
  short: { fr: "Mon emploi sera remplacé d'ici 5 ans", en: "My job will be replaced within 5 years" },
  expected: "disagree",
  dimension: "eco",
  image: "workers",
  prompt: statement(
    "Mon emploi, ou celui que je vise, risque d'être entièrement remplacé par une IA d'ici 5\u00a0ans.",
    "My job, or the one I am aiming for, is at risk of being entirely replaced by AI within 5 years.",
  ),
  ...agree,
};

/** Questions reposées dans le sondage « après ». */
export const REPEATED: Question[] = [env1, env2, soc1, soc2, eco1, eco2];

export const surveyPre: Question[] = [...REPEATED];
