"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMounted } from "@/hooks/use-mounted";

type TypewriterAs = "span" | "p" | "div";

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** Use span inside headings (h1) — never nest <p> in <h1> */
  as?: TypewriterAs;
  speedMs?: number;
  startDelayMs?: number;
}

export function TypewriterText({
  text,
  className,
  as: Tag = "span",
  speedMs = 58,
  startDelayMs = 500,
}: TypewriterTextProps) {
  const mounted = useMounted();
  const [visible, setVisible] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    setVisible("");
    setDone(false);
    let index = 0;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const startId = setTimeout(() => {
      intervalId = setInterval(() => {
        index += 1;
        setVisible(text.slice(0, index));
        if (index >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
        }
      }, speedMs);
    }, startDelayMs);

    return () => {
      clearTimeout(startId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [mounted, text, speedMs, startDelayMs]);

  if (!mounted) {
    return (
      <Tag className={cn("block min-h-[1.5em]", className)} suppressHydrationWarning>
        {text}
      </Tag>
    );
  }

  return (
    <Tag className={cn("block min-h-[1.5em]", className)} aria-label={text}>
      <span>{visible}</span>
      {!done && (
        <span
          className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary-500 align-middle"
          style={{ height: "1em" }}
          aria-hidden
        />
      )}
    </Tag>
  );
}
