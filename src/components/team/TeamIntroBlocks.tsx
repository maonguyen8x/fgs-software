"use client";

import { useTranslations } from "next-intl";
import { TypewriterText } from "@/components/team/TypewriterText";

const BLOCK_KEYS = ["intro_block_1", "intro_block_2", "intro_block_3"] as const;

export function TeamIntroBlocks({ copy }: { copy?: string[] }) {
  const t = useTranslations("team");

  return (
    <section className="team-flow-section">
      <div className="team-page-inner">
        <div className="flex flex-col gap-4 md:gap-5">
          {BLOCK_KEYS.map((key, index) => {
            const text = copy ? copy[index] : t(key);
            if (!text) return null;
            return (
            <article key={key} className="team-page-panel px-6 py-5 md:px-8 md:py-6">
              <TypewriterText text={text} delayMs={index * 400} />
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
