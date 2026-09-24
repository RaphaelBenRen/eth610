"use client";

import { AB } from "./AB";
import { Estimate } from "./Estimate";
import { Gauge } from "./Gauge";
import { Likert } from "./Likert";
import { Multi } from "./Multi";
import { Ranking } from "./Ranking";
import type { QProps } from "./shared";
import { Single } from "./Single";
import { TrueFalse } from "./TrueFalse";

/** Affiche le bon composant selon le type de question. */
export function QuestionView(props: QProps) {
  const { q } = props;
  switch (q.type) {
    case "single":
      return <Single {...props} q={q} />;
    case "multi":
      return <Multi {...props} q={q} />;
    case "true_false":
      return <TrueFalse {...props} q={q} />;
    case "ab":
      return <AB {...props} q={q} />;
    case "likert":
      return <Likert {...props} q={q} />;
    case "gauge":
      return <Gauge {...props} q={q} />;
    case "estimate":
      return <Estimate {...props} q={q} />;
    case "ranking":
      return <Ranking {...props} q={q} />;
  }
}
