import { useState, useRef, useEffect, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Expand } from 'lucide-react';
import type { GalleryImage } from '../pages/Gallery';
import { useIntersection } from '@/hooks/use-intersection';
import { addImageToHistory } from '../lib/historyDB';

interface ImageCardProps {
  image: GalleryImage;
  onDownload: (imageUrl: string) => void;
  isDownloading: boolean;
  onFullscreen: () => void;
  onVisible: () => void;
}

const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(({ image, onDownload, isDownloading, onFullscreen, onVisible }, ref) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  
  // Track when the image becomes visible
  const isVisible = useIntersection(ref, {
    threshold: 0.1, // Image needs to be at least 10% visible
    rootMargin: '0px',
  });

  // Add to history when image becomes visible for the first time
  useEffect(() => {
    if (isVisible && !hasBeenViewed && !isLoading) {
      setHasBeenViewed(true);
      onVisible();
      addImageToHistory(image).catch(error => {
        console.error('Failed to add image to history:', error);
      });
    }
  }, [isVisible, hasBeenViewed, isLoading, image, onVisible]);

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className="relative"
      tabIndex={0}
    >
      <Card className="group overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full">
            {isLoading && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image.url})`, filter: 'blur(20px)' }}
            />
            <motion.img
              src={image.url}
              alt="Artwork"
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                setIsLoading(false);
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(image.url);
                }}
                disabled={isDownloading}
                aria-label="Download image"
              >
                <Download className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onFullscreen();
                }}
                aria-label="View image in fullscreen"
              >
                <Expand className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ImageCard;
