"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/**
 * false pendant le rendu serveur et l'hydratation, true ensuite.
 * Permet de lire sessionStorage à l'initialisation d'un état sans décalage d'hydratation :
 * on n'affiche ce qui en dépend qu'une fois `true`.
 */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export const isBrowser = typeof window !== "undefined";
