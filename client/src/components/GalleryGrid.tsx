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
}

export default function GalleryGrid({
  images,
  loading,
  onDownload,
  downloadingIndex,
  onImageFullscreen,
  onLoadMore,
}: GalleryGridProps) {
  const endRef = useRef<HTMLDivElement>(null);
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
            image={image}
            onDownload={() => onDownload(image.url)}
            isDownloading={downloadingIndex === index}
            onFullscreen={() => onImageFullscreen(image)}
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
