import { useState, useRef, useEffect } from 'react';
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
}

export default function ImageCard({ image, onDownload, isDownloading, onFullscreen }: ImageCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Track when the image becomes visible
  const isVisible = useIntersection(cardRef, {
    threshold: 0.1, // Image needs to be at least 10% visible
    rootMargin: '0px',
  });

  // Add to history when image becomes visible for the first time
  useEffect(() => {
    if (isVisible && !hasBeenViewed && !isLoading) {
      setHasBeenViewed(true);
      addImageToHistory(image).catch(error => {
        console.error('Failed to add image to history:', error);
      });
    }
  }, [isVisible, hasBeenViewed, isLoading, image]);

  return (
    <motion.div
      ref={cardRef}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
      }}
      className="relative"
    >
      <Card className="group overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full">
            {isLoading && (
              <div
                className="absolute inset-0 bg-muted animate-pulse"
                style={{
                  backgroundImage: image.thumbnail ? `url(${image.thumbnail})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            <img
              src={(image.thumbnail && !image.url.endsWith('.gif')) ? image.thumbnail : image.url}
              alt="Artwork"
              className={`w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              loading="lazy"
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
                setIsLoading(false);
                // If a thumbnail was loaded, replace it with the full image now
                if (image.thumbnail && img.src === image.thumbnail) {
                  const fullImage = new Image();
                  fullImage.src = image.url;
                  fullImage.onload = () => {
                    img.src = fullImage.src;
                  };
                }
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
              >
                <Expand className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
