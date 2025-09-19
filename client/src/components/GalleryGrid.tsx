import { useEffect, useRef } from 'react';
import ImageCard from './ImageCard';
import LoadingPlaceholder from './LoadingPlaceholder';
import type { GalleryImage } from '../pages/Gallery';
import { motion } from 'framer-motion';
import { useIntersection } from '@/hooks/use-intersection';

interface GalleryGridProps {
  images: GalleryImage[];
  loading: boolean;
  onDownload: (imageUrl: string) => void;
  downloadingIndex: number | null;
  onImageFullscreen: (image: GalleryImage) => void;
  onLoadMore: () => void;
  onLastVisibleIndexChange: (index: number) => void;
}

export default function GalleryGrid({
  images,
  loading,
  onDownload,
  downloadingIndex,
  onImageFullscreen,
  onLoadMore,
  onLastVisibleIndexChange,
}: GalleryGridProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isIntersecting = useIntersection(endRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  useEffect(() => {
    if (isIntersecting && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, loading, onLoadMore]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { activeElement } = document;
      const currentIndex = cardRefs.current.findIndex(ref => ref === activeElement);

      if (currentIndex === -1) return;

      let nextIndex = -1;
      const columns = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;

      if (event.key === 'ArrowRight') {
        nextIndex = Math.min(currentIndex + 1, images.length - 1);
      } else if (event.key === 'ArrowLeft') {
        nextIndex = Math.max(currentIndex - 1, 0);
      } else if (event.key === 'ArrowDown') {
        nextIndex = Math.min(currentIndex + columns, images.length - 1);
      } else if (event.key === 'ArrowUp') {
        nextIndex = Math.max(currentIndex - columns, 0);
      }

      if (nextIndex !== -1) {
        cardRefs.current[nextIndex]?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length]);

  return (
    <>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="show"
      >
        {images.map((image, index) => (
          <ImageCard
            key={`${image.url}-${index}`}
            ref={el => cardRefs.current[index] = el}
            image={image}
            onDownload={() => onDownload(image.url)}
            isDownloading={downloadingIndex === index}
            onFullscreen={() => onImageFullscreen(image)}
            onVisible={() => onLastVisibleIndexChange(index)}
          />
        ))}

        {loading && (
          Array.from({ length: 8 }).map((_, index) => (
            <LoadingPlaceholder key={`skeleton-${index}`} />
          ))
        )}
      </motion.div>
      <div ref={endRef} className="h-4" />
    </>
  );
}
