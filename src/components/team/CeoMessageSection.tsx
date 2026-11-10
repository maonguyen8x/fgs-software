import { UploadImage } from "@/components/ui/UploadImage";

interface CeoMessageSectionProps {
  sectionTitle: string;
  bubbleTitle: string;
  message: string;
  name: string;
  role: string;
  signature: string;
  imageUrl?: string | null;
  imageAlt: string;
  imageZoom?: number;
  imagePosX?: number;
  imagePosY?: number;
}

export function CeoMessageSection({
  sectionTitle,
  bubbleTitle,
  message,
  name,
  role,
  signature,
  imageUrl,
  imageAlt,
  imageZoom = 1,
  imagePosX = 50,
  imagePosY = 20,
}: CeoMessageSectionProps) {
  return (
    <section id="ceo-message" className="scroll-mt-28 px-4 py-[15px]">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-4 text-center text-2xl font-bold text-heading md:text-3xl">{sectionTitle}</h2>

        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_280px] md:gap-10">
          <div className="order-2 md:order-1">
            <div className="relative">
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-blue-600 bg-white md:-right-3 md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:border-l-0 md:border-t-2 md:border-r-2 md:border-b-0 dark:bg-slate-900"
              />
              <div className="rounded-3xl border-2 border-blue-600 bg-white p-6 shadow-lg shadow-blue-600/5 md:p-8 dark:bg-slate-900">
                <p className="mb-3 text-lg font-bold text-blue-600 md:text-xl">{bubbleTitle}</p>
                <p className="text-[15px] leading-relaxed text-slate-700 md:text-base dark:text-slate-300">
                  &ldquo;{message}&rdquo;
                </p>
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="text-base font-semibold text-heading">{name}</p>
                  <p className="text-sm text-muted-theme">{role}</p>
                  <p className="mt-2 font-serif text-2xl italic text-blue-700 dark:text-blue-400">{signature}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[280px] md:order-2">
            {imageUrl ? (
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                <UploadImage
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                  style={{
                    objectPosition: `${imagePosX}% ${imagePosY}%`,
                    transform: `scale(${imageZoom})`,
                    transformOrigin: `${imagePosX}% ${imagePosY}%`,
                  }}
                  sizes="280px"
                />
              </div>
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded-3xl bg-gradient-to-br from-blue-100 to-blue-200 text-4xl font-bold text-blue-700">
                MN
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}