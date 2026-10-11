import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * True once React has hydrated in the browser.
 *
 * Checker forms keep their submit buttons disabled until then, so that a
 * click before JavaScript loads can never fall back to a normal form
 * submission (which would put the pasted text into the page URL).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
