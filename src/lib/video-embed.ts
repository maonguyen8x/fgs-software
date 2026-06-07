export type VideoSource = "upload" | "youtube" | "dailymotion";

export interface ParsedVideoEmbed {
  source: VideoSource;
  videoId: string;
  embedUrl: string;
  watchUrl: string;
}

export function parseVideoUrl(raw: string): ParsedVideoEmbed | null {
  const url = raw.trim();
  if (!url) return null;

  const youtubeMatch =
    url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/i) ??
    url.match(/^([\w-]{11})$/);
  if (youtubeMatch?.[1]) {
    const videoId = youtubeMatch[1];
    return {
      source: "youtube",
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  const dailymotionMatch =
    url.match(/dailymotion\.com\/video\/([\w]+)/i) ?? url.match(/dai\.ly\/([\w]+)/i);
  if (dailymotionMatch?.[1]) {
    const videoId = dailymotionMatch[1];
    return {
      source: "dailymotion",
      videoId,
      embedUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      watchUrl: `https://www.dailymotion.com/video/${videoId}`,
    };
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/uploads/")) {
    return {
      source: "upload",
      videoId: url,
      embedUrl: url,
      watchUrl: url,
    };
  }

  return null;
}

export function resolveWorkVideo(work: {
  videoUrl?: string | null;
  videoSource?: string | null;
}): ParsedVideoEmbed | null {
  if (!work.videoUrl?.trim()) return null;
  if (work.videoSource === "upload") {
    return {
      source: "upload",
      videoId: work.videoUrl,
      embedUrl: work.videoUrl,
      watchUrl: work.videoUrl,
    };
  }
  return parseVideoUrl(work.videoUrl);
}
