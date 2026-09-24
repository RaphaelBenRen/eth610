import type { Question } from "@/lib/types";
import { REPEATED } from "./survey-pre";

/*
 * Sondage 2 (« après ») : mêmes questions (mêmes `id`) que dans le sondage 1,
 * pour la comparaison avant/après par répondant.
 * On peut ajouter ici des questions propres au sondage 2 (avec un nouvel id).
 */
export const surveyPost: Question[] = [...REPEATED];
