export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

export const isLocale = (v: string): v is Locale =>
  (LOCALES as readonly string[]).includes(v);

/** Texte bilingue. */
export type L = Record<Locale, string>;

export type Phase = "pre" | "quiz" | "post";
export const PHASES: Phase[] = ["pre", "quiz", "post"];

export type Option = { id: string; label: L; emoji?: string };

export type Dimension = "env" | "soc" | "eco";

type Base = {
  /** Identifiant stable : ne jamais le changer une fois le site en ligne (sinon les stats sont cassées). */
  id: string;
  prompt: L;
  help?: L;
  /** Thème affiché en étiquette : environnement, société, économie. */
  dimension?: Dimension;
  /** Photo d'illustration : nom du fichier dans public/images (sans .jpg), crédit dans content/image-credits.ts. */
  image?: string;
  /** Libellé court pour les graphiques du dashboard. */
  short?: L;
};

export type Source = { label: string; url: string };

/** Champs affichés après la réponse, uniquement dans le quiz. */
export type QuizExtras = {
  explanation?: L;
  /** Une ou plusieurs sources affichées sous l'explication. */
  source?: Source | Source[];
};

export type SingleQ = Base & QuizExtras & { type: "single"; options: Option[]; correct?: string };
export type MultiQ = Base & QuizExtras & { type: "multi"; options: Option[]; correct?: string[] };
export type TrueFalseQ = Base & QuizExtras & { type: "true_false"; correct?: boolean };
export type ABQ = Base &
  QuizExtras & { type: "ab"; a: Option; b: Option; correct?: "a" | "b" };
/**
 * Échelle d'accord 1-5 (sondages uniquement). Niveau 1 = désaccord total, 5 = accord total.
 * Si `labels` est fourni (5 libellés, du niveau 1 au niveau 5), chaque option est affichée en toutes lettres,
 * du désaccord à l'accord ; sinon, 5 pastilles avec `minLabel` / `maxLabel` aux extrémités.
 */
export type LikertQ = Base & {
  type: "likert";
  minLabel: L;
  maxLabel: L;
  labels?: L[];
  /**
   * Évolution attendue après le quiz (sondage répété) : « agree » = l'accord devrait augmenter,
   * « disagree » = il devrait baisser. Sert au dashboard pour indiquer si l'avis a bougé « dans le sens attendu ».
   */
  expected?: "agree" | "disagree";
};
/** Jauge linéaire (par défaut 0-100). */
export type GaugeQ = Base &
  QuizExtras & {
    type: "gauge";
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    minLabel?: L;
    maxLabel?: L;
    correct?: number;
    /** Écart à partir duquel le score tombe à 0 (défaut : 25 % de l'amplitude). */
    tolerance?: number;
  };
/** Estimation d'un chiffre sur un curseur logarithmique. */
export type EstimateQ = Base &
  QuizExtras & {
    type: "estimate";
    min: number;
    max: number;
    unit: L;
    correct?: number;
    /** Comparaison parlante affichée avec la bonne réponse. */
    comparison?: L;
  };
export type RankingQ = Base &
  QuizExtras & {
    type: "ranking";
    items: Option[];
    /** Ordre correct (ids), du premier au dernier. */
    correct?: string[];
    topLabel?: L;
    bottomLabel?: L;
  };

export type Question =
  | SingleQ
  | MultiQ
  | TrueFalseQ
  | ABQ
  | LikertQ
  | GaugeQ
  | EstimateQ
  | RankingQ;

export type QuestionType = Question["type"];

export type AnswerValue =
  | { choice: string }
  | { choices: string[] }
  | { level: number }
  | { value: number }
  | { order: string[] };
