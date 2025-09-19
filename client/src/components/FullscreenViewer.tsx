import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { GalleryImage } from '../pages/Gallery';
import { addImageToHistory } from '../lib/historyDB';

interface FullscreenViewerProps {
  image: GalleryImage | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  open: boolean;
}

export default function FullscreenViewer({ image, onClose, onPrev, onNext, open }: FullscreenViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);

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
      if (image) {
        addImageToHistory(image);
      }
    } else if (!open && document.fullscreenElement) {
      document.exitFullscreen();
    }
  }, [open, image]);

  const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number; }; }) => {
    if (info.offset.x > 100) {
      onPrev();
    } else if (info.offset.x < -100) {
      onNext();
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
      <button
        className="absolute top-8 right-8 text-white/50 hover:text-white"
        onClick={() => document.exitFullscreen()}
      >
        <X size={40} />
      </button>
    </div>
  );
}
