"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronRight, Loader2, RefreshCw, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const THUMB_SIZE = 40;
const TRACK_HEIGHT = 44;

type PuzzleMode = "slice" | "flip";

interface PuzzleChallenge {
  challengeToken: string;
  mode: PuzzleMode;
  imageUrl: string;
  targetRatio: number;
  pieceY: number;
  pieceSize: number;
  width: number;
  height: number;
  maxTravel: number;
}

interface PuzzleCaptchaProps {
  variant?: "inline" | "modal";
  labels: {
    title: string;
    hint: string;
    flipHint?: string;
    drag: string;
    flipDrag?: string;
    verifying: string;
    success: string;
    failed: string;
    refresh: string;
  };
  onVerified: (passToken: string) => void;
  onReset: () => void;
}

type PuzzleStatus = "idle" | "verifying" | "success" | "error";

function bgStyle(url: string, scale: number, width: number, height: number, offsetX = 0, offsetY = 0) {
  const w = width * scale;
  const h = height * scale;
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${w}px ${h}px`,
    backgroundPosition: `${-offsetX * scale}px ${-offsetY * scale}px`,
    backgroundRepeat: "no-repeat" as const,
  };
}

function flipScaleX(sliderRatio: number, targetRatio: number): number {
  if (targetRatio <= 0) return 1;
  const progress = Math.min(1, sliderRatio / targetRatio);
  return -1 + 2 * progress;
}

export function PuzzleCaptcha({ variant = "inline", labels, onVerified, onReset }: PuzzleCaptchaProps) {
  const [challenge, setChallenge] = useState<PuzzleChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [sliderRatio, setSliderRatio] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>("idle");
  const [dragging, setDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const isFlip = challenge?.mode === "flip";
  const activeHint = isFlip ? (labels.flipHint ?? labels.hint) : labels.hint;
  const activeDrag = isFlip ? (labels.flipDrag ?? labels.drag) : labels.drag;

  const loadChallenge = useCallback(async () => {
    setLoading(true);
    setStatus("idle");
    setSliderRatio(0);
    onReset();
    try {
      const res = await fetch("/api/admin/auth/puzzle");
      if (!res.ok) throw new Error("load failed");
      const data = (await res.json()) as PuzzleChallenge;
      setChallenge({ ...data, mode: data.mode ?? "slice" });
    } catch {
      setChallenge(null);
    } finally {
      setLoading(false);
    }
  }, [onReset]);

  useEffect(() => {
    void loadChallenge();
  }, [loadChallenge]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !challenge) return;

    const updateScale = () => {
      const w = frame.clientWidth;
      setScale(w > 0 ? w / challenge.width : 1);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [challenge]);

  const verifyRatio = async (ratio: number) => {
    if (!challenge || status === "success" || status === "verifying") return;
    setStatus("verifying");
    try {
      const res = await fetch("/api/admin/auth/puzzle/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken: challenge.challengeToken, sliderRatio: ratio }),
      });
      if (!res.ok) {
        setStatus("error");
        window.setTimeout(() => void loadChallenge(), 1200);
        return;
      }
      const data = (await res.json()) as { passToken: string };
      setStatus("success");
      onVerified(data.passToken);
    } catch {
      setStatus("error");
      window.setTimeout(() => void loadChallenge(), 1200);
    }
  };

  const ratioFromClientX = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const travel = Math.max(1, rect.width - THUMB_SIZE);
    const offset = Math.min(travel, Math.max(0, clientX - rect.left - THUMB_SIZE / 2));
    return offset / travel;
  };

  const setSliderFromClientX = (clientX: number) => {
    const ratio = ratioFromClientX(clientX);
    setSliderRatio(ratio);
    return ratio;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!challenge || status === "success" || loading) return;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setSliderFromClientX(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setSliderFromClientX(e.clientX);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    const ratio = setSliderFromClientX(e.clientX);
    void verifyRatio(ratio);
  };

  const thumbOffset =
    trackRef.current ? sliderRatio * Math.max(1, trackRef.current.clientWidth - THUMB_SIZE) : 0;

  const pieceLeftPx = challenge ? sliderRatio * challenge.maxTravel * scale : 0;
  const holeLeftPx = challenge ? challenge.targetRatio * challenge.maxTravel * scale : 0;
  const pieceSizePx = challenge ? challenge.pieceSize * scale : 0;

  const wrapperClass =
    variant === "modal"
      ? "space-y-2.5"
      : "space-y-2.5 rounded-xl border border-slate-200/90 bg-slate-50/90 p-3 dark:border-slate-600 dark:bg-slate-800/50";

  return (
    <div className={wrapperClass}>
      {variant === "inline" && (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{labels.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{activeHint}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadChallenge()}
            className="cursor-pointer rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200/80 dark:hover:bg-slate-700"
            title={labels.refresh}
            aria-label={labels.refresh}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      )}

      {variant === "modal" && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">{activeHint}</p>
          <button
            type="button"
            onClick={() => void loadChallenge()}
            className="cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            title={labels.refresh}
            aria-label={labels.refresh}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      )}

      <div
        ref={frameRef}
        className="relative w-full overflow-hidden rounded-xl border border-slate-200/90 bg-slate-800 shadow-inner dark:border-slate-600"
        style={{ aspectRatio: `${challenge?.width ?? 320} / ${challenge?.height ?? 180}` }}
      >
        {loading || !challenge ? (
          <div className="flex h-full min-h-[160px] items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : isFlip ? (
          <>
            <div
              className="absolute inset-0 transition-transform duration-75"
              style={{
                ...bgStyle(challenge.imageUrl, scale, challenge.width, challenge.height),
                transform: `scaleX(${flipScaleX(sliderRatio, challenge.targetRatio)})`,
              }}
            />
            <div className="pointer-events-none absolute inset-0 bg-black/10" />
            {status === "success" && (
              <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            {status === "error" && (
              <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                <XCircle className="h-5 w-5" />
              </div>
            )}
          </>
        ) : (
          <>
            <div
              className="absolute inset-0"
              style={bgStyle(challenge.imageUrl, scale, challenge.width, challenge.height)}
            />
            <div className="absolute inset-0 bg-black/15" />
            <div
              className="absolute border-2 border-dashed border-white/95 bg-black/35"
              style={{
                left: holeLeftPx,
                top: challenge.pieceY * scale,
                width: pieceSizePx,
                height: pieceSizePx,
              }}
            />
            <div
              className={cn(
                "absolute border-2 border-white shadow-xl",
                status === "success" && "ring-2 ring-emerald-400",
                status === "error" && "ring-2 ring-red-400"
              )}
              style={{
                left: pieceLeftPx,
                top: challenge.pieceY * scale,
                width: pieceSizePx,
                height: pieceSizePx,
                ...bgStyle(
                  challenge.imageUrl,
                  scale,
                  challenge.width,
                  challenge.height,
                  sliderRatio * challenge.maxTravel,
                  challenge.pieceY
                ),
              }}
            />
            {status === "success" && (
              <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
            {status === "error" && (
              <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
                <XCircle className="h-5 w-5" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{activeDrag}</p>
        <div
          ref={trackRef}
          className={cn(
            "relative select-none rounded-full bg-slate-200/90 dark:bg-slate-700/90",
            status === "success" && "ring-2 ring-emerald-400/50",
            status === "error" && "ring-2 ring-red-400/50",
            (loading || status === "success") && "pointer-events-none opacity-80"
          )}
          style={{ height: TRACK_HEIGHT }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-75",
              status === "success" ? "bg-emerald-500/30" : status === "error" ? "bg-red-500/30" : "bg-primary-500/25"
            )}
            style={{ width: thumbOffset + THUMB_SIZE }}
          />
          <div
            className={cn(
              "absolute top-0 z-10 flex items-center justify-center rounded-full shadow-md transition-[left] duration-75",
              dragging ? "cursor-grabbing scale-[1.03]" : "cursor-grab",
              status === "success"
                ? "bg-emerald-500 text-white"
                : status === "error"
                  ? "bg-red-500 text-white"
                  : "border border-white/80 bg-white text-primary-600 dark:bg-slate-50"
            )}
            style={{ left: thumbOffset, width: THUMB_SIZE, height: THUMB_SIZE }}
          >
            {status === "verifying" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : status === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : status === "error" ? (
              <XCircle className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            )}
          </div>
        </div>
        <p
          className={cn(
            "min-h-[1rem] text-xs",
            status === "success" && "font-medium text-emerald-600 dark:text-emerald-400",
            status === "error" && "font-medium text-red-600 dark:text-red-400",
            status === "verifying" && "text-slate-500"
          )}
        >
          {status === "success"
            ? labels.success
            : status === "error"
              ? labels.failed
              : status === "verifying"
                ? labels.verifying
                : ""}
        </p>
      </div>
    </div>
  );
}
