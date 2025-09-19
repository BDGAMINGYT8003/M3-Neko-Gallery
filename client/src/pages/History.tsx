
import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getHistory, clearHistory } from '../lib/historyDB';
import type { GalleryImage } from './Gallery';
import GalleryGrid from '../components/GalleryGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import FullscreenViewer from '../components/FullscreenViewer';
import { handleDownload as downloadImage } from '../lib/download';
import { useToast } from '@/hooks/use-toast';

export default function History() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const loadHistory = async () => {
    const historyImages = await getHistory();
    setImages(historyImages);
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleClearHistory = async () => {
    try {
      await clearHistory();
      setImages([]);
      toast({
        title: 'History Cleared',
        description: 'All viewing history has been successfully deleted.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear history. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = (imageUrl: string) => {
    const index = images.findIndex(img => img.url === imageUrl);
    setDownloadingIndex(index);
    try {
      downloadImage(imageUrl);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingIndex(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="mb-8 bg-card border shadow-lg">
        <CardContent className="p-6 relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
            History
          </h1>
          <div className="flex justify-center items-center gap-4">
            <Button asChild variant="outline" size="default">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-[425px]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg font-semibold">Clear History</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    Are you sure you want to delete all viewing history? This action cannot be undone and will permanently remove all saved image history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearHistory}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

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
          </div>
        )
      )}

      <FullscreenViewer
        open={fullscreenIndex !== null}
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
