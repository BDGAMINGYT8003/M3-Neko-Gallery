import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import CategorySelect from '../components/CategorySelect';
import GalleryGrid from '../components/GalleryGrid';
import { handleDownload as downloadImage } from '../lib/download';
import FullscreenViewer from '../components/FullscreenViewer';
import { useToast } from '@/hooks/use-toast';
import hmtai from 'hmtai';
import HMfull from 'hmfull';

export interface GalleryImage {
  url: string;
  apiSource: string;
  category: string | null;
  width?: number;
  height?: number;
}

const ITEMS_PER_PAGE = 10;

// API Category Lists
const nsfwApiCategories = [
  "anal", "ass", "blowjob", "breeding", "buttplug", "cages", "ecchi", "feet", "fo", "gif", "hentai", "legs",
  "masturbation", "milf", "neko", "paizuri", "petgirls", "pierced", "selfie", "smothering", "socks", "vagina", "yuri"
];
const waifuPicsCategories = ["waifu", "neko", "blowjob"];
const hmtaiCategories = [
    'anal', 'ass', 'bdsm', 'cum', 'classic', 'creampie', 'manga', 'femdom', 'hentai', 'incest', 'masturbation', 'public', 'ero',
    'orgy', 'elves', 'yuri', 'pantsu', 'glasses', 'cuckold', 'blowjob', 'boobjob', 'footjob', 'handjob', 'boobs', 'thighs',
    'pussy', 'ahegao', 'uniform', 'gangbang', 'tentacles', 'gif', 'nsfwNeko', 'nsfwMobileWallpaper', 'zettaiRyouiki'
];

const hmfullNekosCategories = ['nekogif', 'wallpaper'];
const hmfullNekoBotCategories = ['hentai', 'ass', 'boobs', 'paizuri', 'yuri', 'thighs', 'lewdneko', 'midriff', 'tentacles', 'anal', 'hneko', 'wallpaper'];
const hmfullNekoLoveCategories = ['nekolewd'];
const hmfullHmtaiCategories = hmtaiCategories;

const hmfullAllCategories = [...new Set([...hmfullHmtaiCategories, ...hmfullNekosCategories, ...hmfullNekoBotCategories, ...hmfullNekoLoveCategories])];

const hmtaiClient = new hmtai();

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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

      for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        let apiSource: string;
        let category = selectedCategory;

        if (selectedCategory) {
            const supportedApis = [];
            if (nsfwApiCategories.includes(selectedCategory)) supportedApis.push('nsfw_api');
            if (waifuPicsCategories.includes(selectedCategory)) supportedApis.push('waifu_pics_api');
            if (hmtaiCategories.includes(selectedCategory)) supportedApis.push('hmtai_api');
            if (hmfullAllCategories.includes(selectedCategory)) supportedApis.push('hmfull_api');

            if (supportedApis.length > 0) {
                apiSource = supportedApis[Math.floor(Math.random() * supportedApis.length)];
            } else {
                apiSource = 'nsfw_api';
            }
        } else {
            const apiSources = ['nsfw_api', 'waifu_pics_api', 'nekos_moe_api', 'hmtai_api', 'hmfull_api'];
            apiSource = apiSources[Math.floor(Math.random() * apiSources.length)];

            if (apiSource === 'waifu_pics_api') {
              category = `waifu_${waifuPicsCategories[Math.floor(Math.random() * waifuPicsCategories.length)]}`;
            } else if (apiSource === 'nsfw_api') {
              category = nsfwApiCategories[Math.floor(Math.random() * nsfwApiCategories.length)];
            } else if (apiSource === 'hmtai_api') {
              category = hmtaiCategories[Math.floor(Math.random() * hmtaiCategories.length)];
            } else if (apiSource === 'hmfull_api') {
              category = hmfullAllCategories[Math.floor(Math.random() * hmfullAllCategories.length)];
            }
        }

        if (apiSource === 'waifu_pics_api' && category && !category.startsWith('waifu_')) {
            category = `waifu_${category}`;
        }

        try {
          const imageData = await fetchImageFromApi(apiSource, category);
          if (imageData) {
            newImages.push(imageData);
          }
        } catch (error) {
          console.error('Error fetching image:', error);
          continue;
        }
      }

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
  }, [selectedCategory]);

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory, fetchImages]);

  async function fetchImageFromApi(apiSource: string, category: string | null): Promise<GalleryImage | null> {
    let imageUrl = '';

    try {
        if (apiSource === 'hmtai_api' && category && hmtaiCategories.includes(category)) {
            imageUrl = await (hmtaiClient.nsfw as any)[category]();
        } else if (apiSource === 'hmfull_api' && category && hmfullAllCategories.includes(category)) {
            let endpoint = category;
            if (category === 'ass') endpoint = 'hass';
            if (category === 'thighs') endpoint = 'thigh';
            if (category === 'tentacles') endpoint = 'tentacle';

            const possibleLibraries: (keyof typeof HMfull)[] = [];
            if (hmfullHmtaiCategories.includes(category)) possibleLibraries.push('HMtai');
            if (hmfullNekosCategories.includes(category)) possibleLibraries.push('Nekos');
            if (hmfullNekoBotCategories.includes(category)) possibleLibraries.push('NekoBot');
            if (hmfullNekoLoveCategories.includes(category)) possibleLibraries.push('NekoLove');

            if (possibleLibraries.length > 0) {
                const libraryName = possibleLibraries[Math.floor(Math.random() * possibleLibraries.length)];
                const library = HMfull[libraryName] as any;
                if (library && typeof library.nsfw[endpoint] === 'function') {
                    const result = await library.nsfw[endpoint]();
                    imageUrl = result.url;
                }
            }
        } else {
            const apiEndpoints = {
              nsfw_api: 'https://api.n-sfw.com/nsfw/',
              waifu_pics_api: 'https://api.waifu.pics/nsfw/',
              nekos_moe_api: 'https://nekos.moe/api/v1/random/image'
            };

            const endpoint = category?.startsWith('waifu_')
              ? `${apiEndpoints.waifu_pics_api}${category.replace('waifu_', '')}`
              : category
                ? `${apiEndpoints[apiSource as keyof typeof apiEndpoints]}${category}`
                : apiEndpoints[apiSource as keyof typeof apiEndpoints];

            const response = await fetch(endpoint);
            if (!response.ok) return null;

            const data = await response.json();

            if (apiSource === 'waifu_pics_api') {
              imageUrl = data.url;
            } else if (apiSource === 'nekos_moe_api' && data.images?.[0]) {
              imageUrl = `https://nekos.moe/image/${data.images[0].id}.${data.images[0].ext}`;
            } else if (apiSource === 'nsfw_api') {
              imageUrl = data.url_japan;
            }
        }
    } catch (error) {
        console.error(`Error fetching from ${apiSource} with category ${category}:`, error);
        return null;
    }

    return imageUrl ? { url: imageUrl, apiSource, category } : null;
  }

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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center whitespace-nowrap">
            Neko Gallery
          </h1>
          <div className="flex justify-center items-center gap-4">
            <CategorySelect
              selectedCategory={selectedCategory}
              onCategoryChange={(category) => setSelectedCategory(category)}
            />
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