"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  className?: string;
  /** Stagger start in ms when block enters view */
  delayMs?: number;
  speedMs?: number;
}

export function TypewriterText({
  text,
  className,
  delayMs = 0,
  speedMs = 28,
}: TypewriterTextProps) {
  const [length, setLength] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setLength(0);
    setStarted(false);
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (length >= text.length) return;

    const timer = window.setTimeout(() => {
      setLength((n) => Math.min(n + 1, text.length));
    }, length === 0 ? delayMs : speedMs);

    return () => window.clearTimeout(timer);
  }, [started, length, text, delayMs, speedMs]);

  const done = length >= text.length;

  return (
    <p
      ref={ref}
      className={cn(
        "text-left text-lg font-bold leading-relaxed text-primary-600 md:text-xl md:leading-relaxed dark:text-primary-500",
        className
      )}
      aria-label={text}
    >
      <span>{text.slice(0, length)}</span>
      {!done && (
        <span className="ml-0.5 inline-block w-[2px] animate-pulse bg-primary-500 align-middle" aria-hidden>
          &nbsp;
        </span>
      )}
    </p>
  );
}
