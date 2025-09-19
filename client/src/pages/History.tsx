import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getHistory } from '../lib/historyDB';
import type { GalleryImage } from './Gallery';
import GalleryGrid from '../components/GalleryGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FullscreenViewer from '../components/FullscreenViewer';
import { handleDownload as downloadImage } from '../lib/download';

export default function History() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadHistory() {
      const historyImages = await getHistory();
      setImages(historyImages);
      setLoading(false);
    }
    loadHistory();
  }, []);

  const handleDownload = (imageUrl: string) => {
    const index = images.findIndex(img => img.url === imageUrl);
    setDownloadingIndex(index);
    try {
      downloadImage(imageUrl);
    } catch (error) {
      // In a real app, you'd show a toast notification here
      console.error('Failed to download image', error);
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="flex items-center mb-8">
        <Button asChild variant="ghost" size="icon">
          <Link to="/">
            <ArrowLeft />
          </Link>
        </Button>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold ml-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Recently Viewed
        </h1>
      </div>

      {images.length > 0 ? (
        <GalleryGrid
          images={images}
          loading={loading}
          onDownload={handleDownload}
          downloadingIndex={downloadingIndex}
          onImageFullscreen={(image) => {
            const index = images.findIndex(img => img.url === image.url);
            setFullscreenIndex(index);
          }}
          onLoadMore={() => {}} // No infinite scroll on history page
        />
      ) : (
        !loading && (
          <div className="text-center text-muted-foreground mt-16">
            <p className="text-xl">No recently viewed images.</p>
            <p>Go back to the gallery and view some images to see them here.</p>
            <Button asChild className="mt-4">
              <Link to="/">Back to Gallery</Link>
            </Button>
          </div>
        )
      )}

      <FullscreenViewer
        image={fullscreenIndex !== null ? images[fullscreenIndex] : null}
        onClose={() => setFullscreenIndex(null)}
        onPrev={() => {
          if (fullscreenIndex !== null) {
            setFullscreenIndex((fullscreenIndex - 1 + images.length) % images.length);
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        }}
        onNext={() => {
          if (fullscreenIndex !== null) {
            setFullscreenIndex((fullscreenIndex + 1) % images.length);
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        }}
      />
    </div>
  );
}
