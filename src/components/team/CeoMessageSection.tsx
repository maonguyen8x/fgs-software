import { UploadImage } from "@/components/ui/UploadImage";
import { NewsArticleContent } from "@/components/news/NewsArticleContent";

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
    <section
      id="ceo-message"
      className="relative isolate scroll-mt-28 overflow-hidden px-4 pt-8 pb-0 md:px-8 md:pt-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_18%_40%,rgba(59,130,246,0.12),transparent_48%),radial-gradient(ellipse_at_82%_60%,rgba(99,102,241,0.09),transparent_42%)]"
      />
      <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/80 bg-white/55 p-4 shadow-[0_24px_70px_rgba(30,64,175,0.08)] backdrop-blur-xl md:p-8">
        <h2 className="mb-4 text-center text-2xl font-bold text-heading md:text-3xl">{sectionTitle}</h2>

        <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_300px] md:gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
          <div className="order-2 md:order-1">
            <div className="relative">
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rotate-45 border-l-2 border-t-2 border-blue-600 bg-white md:-right-3 md:left-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:border-l-0 md:border-t-2 md:border-r-2 md:border-b-0 dark:bg-slate-900"
              />
              <div className="rounded-3xl border-2 border-blue-600/90 bg-white/95 p-6 shadow-[0_18px_48px_rgba(37,99,235,0.10)] md:p-8 dark:bg-slate-900/95">
                <p className="mb-3 text-lg font-bold text-blue-600 md:text-xl">{bubbleTitle}</p>
                <blockquote className="relative border-l-2 border-blue-100 pl-4">
                  <span aria-hidden="true" className="absolute -left-2 -top-3 font-serif text-3xl leading-none text-blue-300">
                    &ldquo;
                  </span>
                  <NewsArticleContent
                    content={message}
                    className="!mt-0 !text-[15px] !leading-relaxed !text-slate-700 md:!text-base dark:!text-slate-300 [&>p]:!mt-0 [&>p+p]:!mt-3"
                  />
                  <span aria-hidden="true" className="absolute -bottom-3 right-1 font-serif text-3xl leading-none text-blue-300">
                    &rdquo;
                  </span>
                </blockquote>
                <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <p className="text-base font-semibold text-heading">{name}</p>
                  <NewsArticleContent
                    content={role}
                    className="!mt-1 !text-sm !leading-relaxed !text-slate-500 dark:!text-slate-400 [&>p]:!mt-0"
                  />
                  <p className="mt-2 font-serif text-2xl italic text-blue-700 dark:text-blue-400">{signature}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 mx-auto w-full max-w-[280px] md:order-2 md:max-w-none">
            {imageUrl ? (
              <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/80 shadow-[0_18px_44px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/5">
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