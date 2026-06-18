"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { UploadImage } from "@/components/ui/UploadImage";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({
  images,
  initialIndex,
  title,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Normalize index
  const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));

  const goToPrevious = useCallback(() => {
    if (safeIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex(safeIndex - 1);
      setTimeout(() => setIsTransitioning(false), 50);
    }
  }, [safeIndex]);

  const goToNext = useCallback(() => {
    if (safeIndex < images.length - 1) {
      setIsTransitioning(true);
      setCurrentIndex(safeIndex + 1);
      setTimeout(() => setIsTransitioning(false), 50);
    }
  }, [safeIndex, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goToPrevious();
          break;
        case "ArrowRight":
          e.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, goToPrevious, goToNext]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    if (touchStart === null) return;

    const distance = touchStart - e.changedTouches[0].clientX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };

  if (!isOpen) return null;

  const currentImage = images[safeIndex];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Content */}
        <div
          className="relative flex h-full w-full flex-col max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-2rem)] max-w-5xl animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Main Image */}
          <div className="relative flex h-full items-center justify-center">
            <div className="relative w-full overflow-hidden" style={{ maxHeight: "calc(100vh - 140px)" }}>
              <UploadImage
                key={`lightbox-${safeIndex}`}
                src={currentImage}
                alt={`${title} ${safeIndex + 1}`}
                width={1920}
                height={1440}
                className={`h-auto w-full object-contain transition-opacity duration-200 ${
                  isTransitioning ? "opacity-75" : "opacity-100"
                }`}
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 active:scale-95"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              {/* Previous */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                disabled={safeIndex === 0}
                className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 md:left-4 md:h-14 md:w-14"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" strokeWidth={2} />
              </button>

              {/* Next */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                disabled={safeIndex === images.length - 1}
                className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 md:right-4 md:h-14 md:w-14"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" strokeWidth={2} />
              </button>
            </>
          )}

          {/* Counter and Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              {/* Image Counter */}
              <div className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                {safeIndex + 1} / {images.length}
              </div>

              {/* Dot Indicators */}
              <div className="flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTransitioning(true);
                      setCurrentIndex(index);
                      setTimeout(() => setIsTransitioning(false), 50);
                    }}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === safeIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
