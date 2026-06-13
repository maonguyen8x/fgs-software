/** Minimal YouTube IFrame API types for hero background playback. */
export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getPlayerState: () => number;
  getCurrentTime?: () => number;
  getDuration?: () => number;
  destroy: () => void;
}

export interface YouTubePlayerOptions {
  /** Required when creating a new player; omit when wrapping an existing iframe. */
  videoId?: string;
  width?: string | number;
  height?: string | number;
  host?: string;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: { target: YouTubePlayer }) => void;
    onStateChange?: (event: { data: number; target: YouTubePlayer }) => void;
  };
}

export interface YouTubeIframeAPI {
  Player: new (element: HTMLElement | string, options: YouTubePlayerOptions) => YouTubePlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YouTubeIframeAPI;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loadPromise: Promise<YouTubeIframeAPI> | null = null;
const readyWaiters: Array<(api: YouTubeIframeAPI) => void> = [];
const readyRejecters: Array<(error: Error) => void> = [];

function resolveReady(api: YouTubeIframeAPI) {
  readyWaiters.splice(0).forEach((resolve) => resolve(api));
}

function rejectReady(error: Error) {
  readyRejecters.splice(0).forEach((reject) => reject(error));
  loadPromise = null;
}

export function loadYouTubeIframeApi(): Promise<YouTubeIframeAPI> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API is client-only"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      readyWaiters.push(resolve);
      readyRejecters.push(reject);

      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT?.Player) {
          resolveReady(window.YT);
        } else {
          rejectReady(new Error("YouTube IFrame API failed to initialize"));
        }
      };

      const existing = document.querySelector('script[src*="youtube.com/iframe_api"]');
      if (existing) return;

      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => rejectReady(new Error("YouTube IFrame API script failed to load"));
      document.head.appendChild(script);
    });
  }

  return loadPromise;
}

const heroPlayers = new Set<YouTubePlayer>();

export function registerHeroYouTubePlayer(player: YouTubePlayer): () => void {
  heroPlayers.add(player);
  return () => heroPlayers.delete(player);
}

export function resumeHeroYouTubePlayers(): void {
  for (const player of heroPlayers) {
    try {
      const state = player.getPlayerState();
      if (state !== 1 && state !== 3) {
        player.mute();
        player.playVideo();
      }
    } catch {
      /* player may be destroyed */
    }
  }
}
