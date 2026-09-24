import type { Question } from "@/lib/types";

/* Questions « bateau » pour tester chaque type de question sur la page /demo. */
const tq = (n: number) => ({ fr: `Test quiz ${n} : question de démonstration ?`, en: `Test quiz ${n}: demo question?` });
const ts = (n: number) => ({ fr: `Test sondage ${n} : question de démonstration ?`, en: `Test survey ${n}: demo question?` });
const opt = (id: string, fr: string, en = fr) => ({ id, label: { fr, en } });
const expl = { fr: "Explication de test : ici s'affichera l'explication de la bonne réponse.", en: "Test explanation: the explanation of the right answer will appear here." };
const source = { label: "Source de test", url: "https://www.etsmtl.ca/" };

export const demoQuestions: { label: string; quiz: boolean; q: Question }[] = [
  { label: "QCM (single)", quiz: true, q: { id: "d1", type: "single", prompt: tq(1), options: [opt("a", "Réponse A", "Answer A"), opt("b", "Réponse B", "Answer B"), opt("c", "Réponse C", "Answer C"), opt("d", "Réponse D", "Answer D")], correct: "c", explanation: expl, source } },
  { label: "Choix multiples (multi)", quiz: true, q: { id: "d2", type: "multi", prompt: tq(2), options: [opt("a", "Option 1"), opt("b", "Option 2"), opt("c", "Option 3"), opt("d", "Option 4")], correct: ["a", "c"], explanation: expl, source } },
  { label: "Vrai / Faux", quiz: true, q: { id: "d3", type: "true_false", prompt: tq(3), correct: true, explanation: expl, source } },
  { label: "Comparaison A ou B", quiz: true, q: { id: "d4", type: "ab", prompt: tq(4), a: { id: "a", emoji: "🅰️", label: { fr: "Choix A", en: "Option A" } }, b: { id: "b", emoji: "🅱️", label: { fr: "Choix B", en: "Option B" } }, correct: "a", explanation: expl, source } },
  { label: "Jauge 0-100", quiz: true, q: { id: "d5", type: "gauge", prompt: tq(5), unit: "%", correct: 70, explanation: expl, source } },
  { label: "Estimation (échelle log)", quiz: true, q: { id: "d6", type: "estimate", prompt: tq(6), min: 1, max: 100_000, unit: { fr: "litres", en: "litres" }, correct: 2000, comparison: { fr: "≈ comparaison parlante de test", en: "≈ test comparison" }, explanation: expl, source } },
  { label: "Classement (glisser-déposer)", quiz: true, q: { id: "d7", type: "ranking", prompt: tq(7), items: [opt("c", "Élément C", "Item C"), opt("a", "Élément A", "Item A"), opt("d", "Élément D", "Item D"), opt("b", "Élément B", "Item B")], correct: ["a", "b", "c", "d"], topLabel: { fr: "En haut", en: "Top" }, bottomLabel: { fr: "En bas", en: "Bottom" }, explanation: expl, source } },
  { label: "Échelle d'accord 1-5 (sondage)", quiz: false, q: { id: "d8", type: "likert", prompt: ts(1), minLabel: { fr: "Pas du tout d'accord", en: "Strongly disagree" }, maxLabel: { fr: "Tout à fait d'accord", en: "Strongly agree" } } },
  { label: "Jauge d'opinion (sondage)", quiz: false, q: { id: "d9", type: "gauge", prompt: ts(2), minLabel: { fr: "Pas du tout", en: "Not at all" }, maxLabel: { fr: "Énormément", en: "A lot" } } },
];
