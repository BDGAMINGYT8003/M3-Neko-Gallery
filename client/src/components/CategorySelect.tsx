import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  "ahegao", "anal", "ass", "bdsm", "blowjob", "boobjob", "boobs", "breeding",
  "buttplug", "cages", "classic", "creampie", "cuckold", "cum", "ecchi",
  "elves", "ero", "feet", "femdom", "fo", "footjob", "gangbang", "gif",
  "glasses", "handjob", "hentai", "hneko", "incest", "legs", "lewdneko",
  "manga", "masturbation", "midriff", "milf", "neko", "nekogif", "nekolewd",
  "nsfwNeko", "nsfwMobileWallpaper", "orgy", "paizuri", "pantsu", "petgirls",
  "pierced", "public", "pussy", "selfie", "smothering", "socks", "tentacles",
  "thighs", "uniform", "vagina", "wallpaper", "yuri", "zettaiRyouiki"
];

interface CategorySelectProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export default function CategorySelect({ selectedCategory, onCategoryChange }: CategorySelectProps) {
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
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}