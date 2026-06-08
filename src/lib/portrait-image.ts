/** Head + upper-body portrait (3:4) — team members & leadership cards. */
export const TEAM_PORTRAIT_ASPECT = 3 / 4;
export const TEAM_PORTRAIT_OUTPUT_WIDTH = 720;
export const TEAM_PORTRAIT_OUTPUT_HEIGHT = Math.round(TEAM_PORTRAIT_OUTPUT_WIDTH / TEAM_PORTRAIT_ASPECT);

/**
 * Full-bleed 3:4 frame — same ratio as Admin crop so the portrait is not re-cropped.
 * object-cover in a matching box shows the full uploaded frame (head + upper body).
 */
export const TEAM_PORTRAIT_CARD_FRAME_CLASS =
  "relative w-full shrink-0 overflow-hidden bg-slate-100 aspect-[3/4] dark:bg-slate-800";

export const TEAM_PORTRAIT_CARD_IMAGE_CLASS =
  "object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]";

/** Detail page hero — same 3:4 ratio, capped width on large screens. */
export const TEAM_PORTRAIT_DETAIL_FRAME_CLASS =
  "relative w-full max-w-[min(100%,320px)] overflow-hidden rounded-2xl bg-slate-100 aspect-[3/4] dark:bg-slate-800";

export const TEAM_PORTRAIT_DETAIL_IMAGE_CLASS = "object-cover object-center";
