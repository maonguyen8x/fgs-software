/** Hero background video timing — brand title shows near end of each loop. */

export const HERO_VIDEO_NEAR_END_EVENT = "fgs-hero-video-near-end";
export const HERO_VIDEO_LOOP_EVENT = "fgs-hero-video-loop";

/** Seconds before video ends to reveal the brand sequence. */
export const HERO_BRAND_TRIGGER_BEFORE_END_SEC = 7;

export function dispatchHeroVideoNearEnd(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HERO_VIDEO_NEAR_END_EVENT));
}

export function dispatchHeroVideoLoopReset(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(HERO_VIDEO_LOOP_EVENT));
}

export function onHeroVideoNearEnd(listener: () => void): () => void {
  window.addEventListener(HERO_VIDEO_NEAR_END_EVENT, listener);
  return () => window.removeEventListener(HERO_VIDEO_NEAR_END_EVENT, listener);
}

export function onHeroVideoLoopReset(listener: () => void): () => void {
  window.addEventListener(HERO_VIDEO_LOOP_EVENT, listener);
  return () => window.removeEventListener(HERO_VIDEO_LOOP_EVENT, listener);
}
