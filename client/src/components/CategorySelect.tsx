import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  "ero", "hass", "hentai", "milf", "oral", "paizuri", "ecchi", "anal", "neko", "boobs",
  "wallpaper", "ngif", "tickle", "feed", "gecg", "gasm", "slap", "avatar", "waifu", "pat",
  "spank", "fox_girl", "smug", "goose", "woof", "cosplay", "hentai2", "pgif", "swimsuit",
  "thigh", "hass2", "hboobs", "pussy", "paizuri2", "pantsu", "lewdneko", "feet", "hyuri",
  "hthigh", "hmidriff", "ass", "nakadashi", "blowjob", "gonewild", "hkitsune", "tentacle",
  "fourk", "kanna", "hentai_anal", "food", "neko2", "holo", "pee", "kemonomimi", "coffee",
  "yaoi", "futa", "gah"
];

interface CategorySelectProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategorySelect({ selectedCategory, onCategoryChange }: CategorySelectProps) {
  const formatCategoryName = (category: string) => {
    let name = category.charAt(0).toUpperCase() + category.slice(1);
    if (category === "hboobs") name = "Hentai Boobs";
    if (category === "hass") name = "Hentai Ass";
    if (category === "hthigh") name = "Hentai Thigh";
    if (category === "hmidriff") name = "Hentai Midriff";
    if (category === "fourk") name = "4K";
    if (category === "fox_girl") name = "Fox Girl";
    if (category === "hentai_anal") name = "Hentai Anal";
    if (category === "kemonomimi") name = "Kemonomimi";
    if (category === "ngif") name = "NSFW GIF";
    if (category === "pgif") name = "Porn GIF";
    return name;
  };

  return (
    <Select
      value={selectedCategory || 'all'}
      onValueChange={(value) => onCategoryChange(value === 'all' ? null : value)}
    >
      <SelectTrigger className="w-[180px] md:w-[240px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {CATEGORIES.map((category) => (
          <SelectItem key={category} value={category}>
            {formatCategoryName(category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}