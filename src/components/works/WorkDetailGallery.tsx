import Image from "next/image";

interface WorkDetailGalleryProps {
  images: string[];
  title: string;
}

export function WorkDetailGallery({ images, title }: WorkDetailGalleryProps) {
  if (images.length === 0) return null;

  const [primary, ...rest] = images;

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        <Image
          src={primary}
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 896px"
          unoptimized={primary.startsWith("/uploads/")}
        />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
          {rest.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/80 dark:bg-slate-800 dark:ring-slate-700"
            >
              <Image
                src={src}
                alt={`${title} ${index + 2}`}
                fill
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 280px"
                unoptimized={src.startsWith("/uploads/")}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
