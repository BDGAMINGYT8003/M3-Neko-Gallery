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
  category: string | null;
  width?: number;
  height?: number;
}

const ITEMS_PER_PAGE = 10;
const CATEGORIES = [
  "tentacle", "fourk", "hentai_anal", "hkitsune", "gonewild", "blowjob", "ass", "hmidriff",
  "hthigh", "hyuri", "feet", "lewdneko", "paizuri", "paizuri2", "pussy", "hboobs", "hass2",
  "thigh", "pgif", "hentai2", "boobs", "anal", "ecchi", "oral", "milf", "hentai", "hass", "ero"
];

const nekoapi = "https://nekobot.xyz/api/image";
const nekoslife = "https://nekos.life/api/v2/img";
const waifuim = "https://api.waifu.im/search?is_nsfw=true";

const apiMap: { [key: string]: string } = {
  ero: `${waifuim}&included_tags=ero`,
  hass: `${waifuim}&included_tags=ass`,
  hentai: `${waifuim}&included_tags=hentai`,
  milf: `${waifuim}&included_tags=milf`,
  oral: `${waifuim}&included_tags=oral`,
  paizuri: `${waifuim}&included_tags=paizuri`,
  ecchi: `${waifuim}&included_tags=ecchi`,
  anal: `${nekoapi}?type=anal`,
  neko: `${nekoslife}/neko`,
  boobs: `${nekoapi}?type=boobs`,
  wallpaper: `${nekoslife}/wallpaper`,
  ngif: `${nekoslife}/ngif`,
  tickle: `${nekoslife}/tickle`,
  feed: `${nekoslife}/feed`,
  gecg: `${nekoslife}/gecg`,
  gasm: `${nekoslife}/gasm`,
  slap: `${nekoslife}/slap`,
  avatar: `${nekoslife}/avatar`,
  waifu: `${nekoslife}/waifu`,
  pat: `${nekoslife}/pat`,
  spank: `${nekoslife}/spank`,
  fox_girl: `${nekoslife}/fox_girl`,
  smug: `${nekoslife}/smug`,
  goose: `${nekoslife}/goose`,
  woof: `${nekoslife}/woof`,
  cosplay: `${nekoapi}?type=cosplay`,
  hentai2: `${nekoapi}?type=hentai`,
  pgif: `${nekoapi}?type=pgif`,
  swimsuit: `${nekoapi}?type=swimsuit`,
  thigh: `${nekoapi}?type=thigh`,
  hass2: `${nekoapi}?type=hass`,
  hboobs: `${nekoapi}?type=hboobs`,
  pussy: `${nekoapi}?type=pussy`,
  paizuri2: `${nekoapi}?type=paizuri`,
  pantsu: `${nekoapi}?type=pantsu`,
  lewdneko: `${nekoapi}?type=lewdneko`,
  feet: `${nekoapi}?type=feet`,
  hyuri: `${nekoapi}?type=hyuri`,
  hthigh: `${nekoapi}?type=hthigh`,
  hmidriff: `${nekoapi}?type=hmidriff`,
  ass: `${nekoapi}?type=ass`,
  nakadashi: `${nekoapi}?type=nakadashi`,
  blowjob: `${nekoapi}?type=blowjob`,
  gonewild: `${nekoapi}?type=gonewild`,
  hkitsune: `${nekoapi}?type=hkitsune`,
  tentacle: `${nekoapi}?type=tentacle`,
  fourk: `${nekoapi}?type=4k`,
  kanna: `${nekoapi}?type=kanna`,
  hentai_anal: `${nekoapi}?type=hentai_anal`,
  food: `${nekoapi}?type=food`,
  neko2: `${nekoapi}?type=neko`,
  holo: `${nekoapi}?type=holo`,
  pee: `${nekoapi}?type=pee`,
  kemonomimi: `${nekoapi}?type=kemonomimi`,
  coffee: `${nekoapi}?type=coffee`,
  yaoi: `${nekoapi}?type=yaoi`,
  futa: `${nekoapi}?type=futa`,
  gah: `${nekoapi}?type=gah`,
};

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const loadingRef = useRef(false);
  const { toast } = useToast();

  const fetch = useCallback(async (category: string): Promise<GalleryImage | null> => {
    const apiUrl = apiMap[category];
    if (!apiUrl) {
      console.error(`Category "${category}" does not exist`);
      return null;
    }

    try {
      const response = await window.fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const url = data.message || data.url || (data.images && data.images[0] && data.images[0].url);

      if (url) {
        return { url, category };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching image for category ${category}:`, error);
      return null;
    }
  }, []);

  const fetchImages = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const newImages: GalleryImage[] = [];
      const promises: Promise<GalleryImage | null>[] = [];

      for (let i = 0; i < ITEMS_PER_PAGE; i++) {
        let category = selectedCategory;
        if (!category) {
          category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        }
        promises.push(fetch(category));
      }

      const results = await Promise.all(promises);
      results.forEach(result => {
        if (result) {
          newImages.push(result);
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
  }, [selectedCategory, fetch, toast]);

  useEffect(() => {
    setImages([]);
    fetchImages();
  }, [selectedCategory, fetchImages]);

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