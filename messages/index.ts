import type { Locale } from "@/lib/types";
import { en } from "./en";
import { fr, type Dict } from "./fr";

export type { Dict };

const dicts: Record<Locale, Dict> = { fr, en };

export const getDict = (l: Locale): Dict => dicts[l];
