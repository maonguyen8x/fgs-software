/** Parse YouTube watch, embed, shorts, and youtu.be URLs. */
export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;

      const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
      if (embedMatch?.[1]) return embedMatch[1];

      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch?.[1]) return shortsMatch[1];
    }
  } catch {
    return null;
  }

  return null;
}

export function isYouTubeUrl(url: string): boolean {
  return parseYouTubeVideoId(url) !== null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Background embed params — no playlist (avoids prev/next UI), loop handled via IFrame API.
 */
export function getYouTubeBackgroundPlayerVars(origin?: string): Record<string, string | number> {
  const vars: Record<string, string | number> = {
    autoplay: 1,
    mute: 1,
    controls: 0,
    rel: 0,
    modestbranding: 1,
    playsinline: 1,
    disablekb: 1,
    iv_load_policy: 3,
    fs: 0,
    cc_load_policy: 0,
    enablejsapi: 1,
    autohide: 1,
    start: 0,
    /** Reduces on-screen overlays where still supported */
    showinfo: 0,
  };
  if (origin) {
    vars.origin = origin;
    vars.widget_referrer = origin;
  }
  return vars;
}

/** Background embed: autoplay, muted, no controls/branding UI. */
export function buildYouTubeBackgroundEmbedUrl(videoId: string, origin?: string): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(getYouTubeBackgroundPlayerVars(origin))) {
    params.set(key, String(value));
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}
