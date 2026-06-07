import { resolveWorkVideo } from "@/lib/video-embed";

interface WorkVideoPlayerProps {
  work: { videoUrl?: string | null; videoSource?: string | null };
  title: string;
}

export function WorkVideoPlayer({ work, title }: WorkVideoPlayerProps) {
  const video = resolveWorkVideo(work);
  if (!video) return null;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black ring-1 ring-slate-200/80">
      {video.source === "upload" ? (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video src={video.embedUrl} controls playsInline className="h-full w-full object-contain" />
      ) : (
        <iframe
          src={video.embedUrl}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
