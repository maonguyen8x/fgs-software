"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speedMs?: number;
  startDelayMs?: number;
}

export function TypewriterText({
  text,
  className,
  speedMs = 58,
  startDelayMs = 500,
}: TypewriterTextProps) {
  const [visible, setVisible] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
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
  }, [text, speedMs, startDelayMs]);

  return (
    <p className={cn("min-h-[1.5em]", className)} aria-label={text}>
      <span>{visible}</span>
      {!done && (
        <span
          className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary-500 align-middle"
          style={{ height: "1em" }}
          aria-hidden
        />
      )}
    </p>
  );
}
