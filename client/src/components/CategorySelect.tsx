import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIES = [
  "anal", "ass", "blowjob", "boobs", "breeding", "buttplug", "cages",
  "ecchi", "ero", "feet", "fo", "gif", "gonewild", "hentai", "legs",
  "masturbation", "milf", "neko", "oral", "paizuri", "petgirls",
  "pierced", "pussy", "selfie", "smothering", "socks", "tentacle", "thigh",
  "vagina", "yuri", "4k"
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