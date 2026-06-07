import { UploadImage } from "@/components/ui/UploadImage";

interface WorkDetailGalleryProps {
  images: string[];
  title: string;
}

export function WorkDetailGallery({ images, title }: WorkDetailGalleryProps) {
  if (images.length === 0) return null;

  const [primary, ...rest] = images;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center overflow-hidden rounded-xl bg-white p-3 ring-1 ring-slate-200/80 dark:bg-slate-900">
        <UploadImage
          src={primary}
          alt={title}
          width={1600}
          height={1200}
          priority
          className="h-auto max-h-[min(70vh,720px)] w-full object-contain"
          sizes="(max-width: 1024px) 100vw, 896px"
        />
      </div>
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
          {rest.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="flex items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-slate-200/80 dark:bg-slate-900"
            >
              <UploadImage
                src={src}
                alt={`${title} ${index + 2}`}
                width={1200}
                height={900}
                className="h-auto max-h-80 w-full object-contain"
                sizes="(max-width: 640px) 100vw, 420px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
