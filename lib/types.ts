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

type Base = {
  /** Identifiant stable : ne jamais le changer une fois le site en ligne (sinon les stats sont cassées). */
  id: string;
  prompt: L;
  help?: L;
};

/** Champs affichés après la réponse, uniquement dans le quiz. */
export type QuizExtras = {
  explanation?: L;
  source?: { label: string; url: string };
};

export type SingleQ = Base & QuizExtras & { type: "single"; options: Option[]; correct?: string };
export type MultiQ = Base & QuizExtras & { type: "multi"; options: Option[]; correct?: string[] };
export type TrueFalseQ = Base & QuizExtras & { type: "true_false"; correct?: boolean };
export type ABQ = Base &
  QuizExtras & { type: "ab"; a: Option; b: Option; correct?: "a" | "b" };
/** Échelle d'accord 1-5 (sondages uniquement). */
export type LikertQ = Base & { type: "likert"; minLabel: L; maxLabel: L };
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
