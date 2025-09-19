import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { triggerHapticFeedback } from '../lib/haptics';
import type { GalleryImage } from '../pages/Gallery';

interface FullscreenViewerProps {
  image: GalleryImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  open: boolean;
  images: GalleryImage[];
}

export default function FullscreenViewer({ image, onClose, onPrev, onNext, open, images }: FullscreenViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && image) {
      const currentIndex = images.findIndex(img => img.url === image.url);
      if (currentIndex !== -1) {
        // Preload next and previous images
        const nextIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        const nextImage = images[nextIndex];
        const prevImage = images[prevIndex];
        if (nextImage) {
          new Image().src = nextImage.url;
        }
        if (prevImage) {
          new Image().src = prevImage.url;
        }
      }
    }
  }, [open, image, images]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onClose]);

  useEffect(() => {
    if (open && viewerRef.current) {
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else if (!open && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [open, image]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        onPrev();
      } else if (event.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrev, onNext]);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number; }; }) => {
    if (info.offset.x > 100) {
      onPrev();
    } else if (info.offset.x < -100) {
      onNext();
    }
  };

  const handleShare = async () => {
    if (!image) return;
    triggerHapticFeedback();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this image!',
          text: 'I found this image in the Neko Gallery.',
          url: image.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(image.url);
        alert('Image URL copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  if (!open || !image) {
    return null;
  }

  return (
    <div ref={viewerRef} className="bg-black flex items-center justify-center">
      <motion.img
        key={image.url}
        src={image.url}
        alt="Fullscreen Artwork"
        className="max-h-screen max-w-screen object-contain"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      />
      <div className="absolute top-8 right-8 flex gap-4">
        <button
          className="text-white/50 hover:text-white"
          onClick={handleShare}
          aria-label="Share image"
        >
          <Share2 size={40} />
        </button>
        <button
          className="text-white/50 hover:text-white"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              onClose();
            }
          }}
          aria-label="Close viewer"
        >
          <X size={40} />
        </button>
      </div>
    </div>
  );
}
