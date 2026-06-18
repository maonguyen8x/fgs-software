"use client";

import { useState } from "react";
import { UploadImage } from "@/components/ui/UploadImage";
import { ImageLightbox } from "@/components/works/ImageLightbox";
import { Maximize2 } from "lucide-react";

interface WorkDetailGalleryProps {
  images: string[];
  title: string;
}

export function WorkDetailGallery({ images, title }: WorkDetailGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) return null;

  const [primary, ...rest] = images;

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Primary Image */}
        <div
          onClick={() => handleImageClick(0)}
          className="group relative cursor-pointer overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/80 dark:bg-slate-900 transition-all duration-300 hover:ring-primary-400/50 dark:hover:ring-primary-600/50"
        >
          <div className="flex items-center justify-center p-3">
            <UploadImage
              src={primary}
              alt={title}
              width={1600}
              height={1200}
              priority
              className="h-auto max-h-[min(70vh,720px)] w-full object-contain transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>

          {/* Hover Overlay with Icon */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
            <div className="flex items-center justify-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 opacity-0 transition-all duration-300 group-hover:opacity-100">
              <Maximize2 className="h-4 w-4" />
              <span>Xem chi tiết</span>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
            {rest.map((src, index) => (
              <div
                key={`${src}-${index}`}
                onClick={() => handleImageClick(index + 1)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-white p-2 ring-1 ring-slate-200/80 dark:bg-slate-900 transition-all duration-300 hover:ring-primary-400/50 dark:hover:ring-primary-600/50"
              >
                <div className="flex items-center justify-center">
                  <UploadImage
                    src={src}
                    alt={`${title} ${index + 2}`}
                    width={1200}
                    height={900}
                    className="h-auto max-h-80 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 420px"
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <Maximize2 className="h-5 w-5 text-slate-900" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <ImageLightbox
        images={images}
        initialIndex={selectedIndex}
        title={title}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
