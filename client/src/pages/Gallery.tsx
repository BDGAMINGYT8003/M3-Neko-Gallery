import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { History, Search } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import GalleryGrid from '../components/GalleryGrid';
import { handleDownload as downloadImage } from '../lib/download';
import FullscreenViewer from '../components/FullscreenViewer';
import { useToast } from '@/hooks/use-toast';
import { APIS, findApiAndCategoryForDisplayCategory, Api } from '../lib/apis';

export interface GalleryImage {
  url: string;
  apiSource: string;
  category: string | null;
  width?: number;
  height?: number;
  thumbnail?: string;
  postUrl?: string;
}

const ITEMS_PER_PAGE = 10;

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const allApiCategoryPairs = APIS.flatMap(api => {
  if (api.name === 'nekos_moe_api') {
    return [{ api, category: null }];
  }
  return api.categories.map(category => ({ api, category }));
});

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [subreddit, setSubreddit] = useState('');
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const loadingRef = useRef(false);
  const { toast } = useToast();

  const fetchImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newImages: GalleryImage[] = [];
      const requests: Promise<GalleryImage | null>[] = [];

      if (subreddit) {
        // Subreddit search mode
        const redditApi = APIS.find(api => api.name === 'reddit_want_cat_api');
        if (redditApi) {
          for (let i = 0; i < ITEMS_PER_PAGE; i++) {
            requests.push(fetchImageFromApi(redditApi, subreddit));
          }
        }
      } else if (!selectedCategory) {
        // "All Categories" mode
        for (let i = 0; i < ITEMS_PER_PAGE; i++) {
          const { api, category } = getRandomElement(allApiCategoryPairs);
          requests.push(fetchImageFromApi(api, category));
        }
      } else {
        // Category selected mode
        const compatiblePairs = findApiAndCategoryForDisplayCategory(selectedCategory);
        if (compatiblePairs.length > 0) {
          for (let i = 0; i < ITEMS_PER_PAGE; i++) {
            const { api, category } = getRandomElement(compatiblePairs);
            requests.push(fetchImageFromApi(api, category));
          }
        }
      }

      const settledImages = await Promise.allSettled(requests);
      settledImages.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          newImages.push(result.value);
        }
      });

      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [selectedCategory, subreddit, toast]);

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory, subreddit, fetchImages]);

  async function fetchImageFromApi(api: Api, category: string | null): Promise<GalleryImage | null> {
    let endpoint = api.baseURL;
    if (api.name !== 'nekos_moe_api' && category) {
      endpoint += category;
    }

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`Error fetching from ${api.name} (${endpoint}): ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      let imageUrl = '';
      let thumbnail: string | undefined = undefined;
      let postUrl: string | undefined = undefined;

      if (api.specialHandling === 'nekos.moe') {
        if (data.images?.[0]?.id) {
          imageUrl = `https://nekos.moe/image/${data.images[0].id}.jpg`;
        }
      } else {
        imageUrl = data[api.responseConfig.urlField];
        if (api.responseConfig.thumbnailField) {
          thumbnail = data[api.responseConfig.thumbnailField];
        }
        if (data.postUrl) {
            postUrl = data.postUrl;
        }
      }

      if (imageUrl) {
        return { url: imageUrl, apiSource: api.name, category, thumbnail, postUrl };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching from ${api.name} (${endpoint}):`, error);
      return null;
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem('subreddit-search') as HTMLInputElement;
    setSubreddit(input.value);
    setSelectedCategory(null); // Clear category when searching
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <Card className="mb-8 bg-card border shadow-lg">
        <CardContent className="p-6 relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center whitespace-nowrap">
            Neko Gallery
          </h1>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <CategorySelect
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => {
                setSelectedCategory(category);
                setSubreddit(''); // Clear search when selecting category
              }}
            />
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                name="subreddit-search"
                type="text"
                placeholder="Search Reddit (e.g., aww)"
                className="w-[180px] md:w-[240px]"
              />
              <Button type="submit" size="icon" variant="ghost">
                <Search />
              </Button>
            </form>
            <Button asChild variant="ghost" size="icon">
              <Link to="/history">
                <History />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <GalleryGrid
        images={images}
        loading={loading}
        onDownload={handleDownload}
        downloadingIndex={downloadingIndex}
        onImageFullscreen={(image) => {
          const index = images.findIndex(img => img.url === image.url);
          setFullscreenIndex(index);
        }}
        onLoadMore={fetchImages}
      />

      <FullscreenViewer
        open={fullscreenIndex !== null}
        image={fullscreenIndex !== null ? images[fullscreenIndex] : null}
        onClose={() => setFullscreenIndex(null)}
        onPrev={() => {
          if (fullscreenIndex !== null) {
            const newIndex = (fullscreenIndex - 1 + images.length) % images.length;
            setFullscreenIndex(newIndex);
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        }}
        onNext={() => {
          if (fullscreenIndex !== null) {
            const newIndex = (fullscreenIndex + 1) % images.length;
            setFullscreenIndex(newIndex);
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        }}
      />
    </div>
  );
}