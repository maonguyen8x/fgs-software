import Image from "next/image";

interface TeamPageHeroProps {
  imageUrl?: string | null;
}

export function TeamPageHero({ imageUrl }: TeamPageHeroProps) {
  const src = imageUrl?.trim();
  const isLocal = src?.startsWith("/");

  return (
    <section className="team-page-hero relative w-full overflow-hidden" aria-hidden>
      <div className="relative min-h-[200px] w-full md:min-h-[280px] lg:min-h-[320px]">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized={isLocal}
          />
        ) : (
          <div
            className="absolute inset-0 bg-linear-to-br from-primary-600/90 via-sky-600/75 to-indigo-700/85 dark:from-primary-900 dark:via-slate-800 dark:to-indigo-950"
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-slate-900/30 via-slate-900/10 to-white/95 dark:to-slate-950/95" />
      </div>
    </section>
  );
}
