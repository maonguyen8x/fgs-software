/** URL hash for the video hero block (top of homepage). */
export const HOME_HASH_HERO = "hero";

/** URL hash for the neural-network explore block below the video hero. */
export const HOME_HASH_EXPLORE = "kham-pha";

export function setHomeHash(hash: string, options?: { replace?: boolean }) {
  if (typeof window === "undefined") return;
  const path = window.location.pathname + window.location.search;
  const next = `${path}#${hash}`;
  if (options?.replace) {
    window.history.replaceState(null, "", next);
  } else {
    window.history.pushState(null, "", next);
  }
}

export function scrollToHomeSection(sectionId: string) {
  if (typeof document === "undefined") return;
  document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
