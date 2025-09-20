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

export interface GalleryImage {
  url: string;
  apiSource: string;
  category: string | null;
  width?: number;
  height?: number;
}

const ITEMS_PER_PAGE = 10;

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

        if (!selectedCategory) {
          const apiSources = ['nsfw_api', 'waifu_pics_api', 'nekos_moe_api', 'nekobot_api', 'waifu_im_api'];
          apiSource = apiSources[Math.floor(Math.random() * apiSources.length)];

          if (apiSource === 'waifu_pics_api') {
            const waifuCategories = ["waifu", "neko", "blowjob"];
            category = `waifu_${waifuCategories[Math.floor(Math.random() * waifuCategories.length)]}`;
          } else if (apiSource === 'nsfw_api') {
            const nsfwCategories = [
              "anal", "ass", "blowjob", "breeding", "buttplug", "cages",
              "ecchi", "feet", "fo", "gif", "hentai", "legs",
              "masturbation", "milf", "neko", "paizuri", "petgirls",
              "pierced", "selfie", "smothering", "socks", "vagina", "yuri"
            ];
            category = nsfwCategories[Math.floor(Math.random() * nsfwCategories.length)];
          } else if (apiSource === 'nekobot_api') {
            const nekobotCategories = [
              "tentacle", "4k", "anal", "blowjob", "ass", "feet", "paizuri", 
              "pussy", "boobs", "thigh", "hentai", "gonewild"
            ];
            category = nekobotCategories[Math.floor(Math.random() * nekobotCategories.length)];
          } else if (apiSource === 'waifu_im_api') {
            const waifuImCategories = [
              "paizuri", "ecchi", "oral", "milf", "hentai", "ass", "ero"
            ];
            category = waifuImCategories[Math.floor(Math.random() * waifuImCategories.length)];
          }
        } else {
          // Determine which APIs support the selected category
          const availableApis = getApisForCategory(selectedCategory);
          apiSource = availableApis[Math.floor(Math.random() * availableApis.length)];
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

  // Function to determine which APIs support a given category
  const getApisForCategory = (category: string): string[] => {
    const categoryMap: { [key: string]: string[] } = {
      'anal': ['nsfw_api', 'nekobot_api'],
      'ass': ['nsfw_api', 'nekobot_api', 'waifu_im_api'],
      'blowjob': ['nsfw_api', 'waifu_pics_api', 'nekobot_api'],
      'boobs': ['nekobot_api'],
      'ecchi': ['nsfw_api', 'waifu_im_api'],
      'feet': ['nsfw_api', 'nekobot_api'],
      'gif': ['nsfw_api'],
      'gonewild': ['nekobot_api'],
      'hentai': ['nsfw_api', 'nekobot_api', 'waifu_im_api'],
      'milf': ['nsfw_api', 'waifu_im_api'],
      'neko': ['nsfw_api', 'waifu_pics_api'],
      'oral': ['waifu_im_api'],
      'paizuri': ['nsfw_api', 'nekobot_api', 'waifu_im_api'],
      'pussy': ['nekobot_api'],
      'tentacle': ['nekobot_api'],
      'thigh': ['nekobot_api'],
      'ero': ['waifu_im_api'],
      '4k': ['nekobot_api'],
      // Legacy categories
      'breeding': ['nsfw_api'],
      'buttplug': ['nsfw_api'],
      'cages': ['nsfw_api'],
      'fo': ['nsfw_api'],
      'legs': ['nsfw_api'],
      'masturbation': ['nsfw_api'],
      'petgirls': ['nsfw_api'],
      'pierced': ['nsfw_api'],
      'selfie': ['nsfw_api'],
      'smothering': ['nsfw_api'],
      'socks': ['nsfw_api'],
      'vagina': ['nsfw_api'],
      'yuri': ['nsfw_api']
    };
    
    return categoryMap[category] || ['nsfw_api'];
  };

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory, fetchImages]);

  async function fetchImageFromApi(apiSource: string, category: string | null): Promise<GalleryImage | null> {
    const apiEndpoints = {
      nsfw_api: 'https://api.n-sfw.com/nsfw/',
      waifu_pics_api: 'https://api.waifu.pics/nsfw/',
      nekos_moe_api: 'https://nekos.moe/api/v1/random/image',
      nekobot_api: 'https://nekobot.xyz/api/image',
      waifu_im_api: 'https://api.waifu.im/search'
    };

    let endpoint = '';
    
    if (apiSource === 'nekobot_api') {
      // Map merged categories to nekobot types
      const nekobotTypeMap: { [key: string]: string } = {
        'anal': 'hentai_anal',
        'ass': 'hass',
        'hentai': 'hentai',
        'paizuri': 'paizuri',
        'boobs': 'hboobs',
        'thigh': 'hthigh',
        'feet': 'feet',
        'blowjob': 'blowjob',
        'pussy': 'pussy',
        'tentacle': 'tentacle',
        '4k': '4k',
        'gonewild': 'gonewild'
      };
      const nekobotType = nekobotTypeMap[category || ''] || category;
      endpoint = `${apiEndpoints.nekobot_api}?type=${nekobotType}`;
    } else if (apiSource === 'waifu_im_api') {
      // Map merged categories to waifu.im tags
      const waifuImTagMap: { [key: string]: string } = {
        'ass': 'ass',
        'hentai': 'hentai',
        'paizuri': 'paizuri',
        'ecchi': 'ecchi',
        'oral': 'oral',
        'milf': 'milf',
        'ero': 'ero'
      };
      const tag = waifuImTagMap[category || ''] || category;
      endpoint = `${apiEndpoints.waifu_im_api}?is_nsfw=true&included_tags=${tag}`;
    } else if (category?.startsWith('waifu_')) {
      endpoint = `${apiEndpoints.waifu_pics_api}${category.replace('waifu_', '')}`;
    } else if (category && apiSource !== 'nekos_moe_api') {
      endpoint = `${apiEndpoints[apiSource as keyof typeof apiEndpoints]}${category}`;
    } else {
      endpoint = apiEndpoints[apiSource as keyof typeof apiEndpoints];
    }

    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = await response.json();
    let imageUrl = '';

    if (apiSource === 'waifu_pics_api') {
      imageUrl = data.url;
    } else if (apiSource === 'nekos_moe_api' && data.images?.[0]) {
      imageUrl = `https://nekos.moe/image/${data.images[0].id}.jpg`;
    } else if (apiSource === 'nekobot_api') {
      imageUrl = data.message;
    } else if (apiSource === 'waifu_im_api' && data.images?.[0]) {
      imageUrl = data.images[0].url;
    } else {
      imageUrl = data.url_japan;
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
            // Note: navigator.vibrate is not supported on iOS.
            if ('vibrate' in navigator) navigator.vibrate(20);
          }
        }}
      />
    </div>
  );
}