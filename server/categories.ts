import hmtai from "hmtai";
import HMfull from "hmfull";

const NSFW_CATEGORIES_HMTAI = [
  "anal", "ass", "bdsm", "cum", "classic", "creampie", "manga", "femdom", "hentai", "incest", "masturbation", "public", "ero", "orgy", "elves", "yuri", "pantsu", "glasses", "cuckold", "blowjob", "boobjob", "footjob", "handjob", "boobs", "thighs", "pussy", "ahegao", "uniform", "gangbang", "tentacles", "gif", "nsfwNeko", "nsfwMobileWallpaper", "zettaiRyouiki",
];

const NSFW_CATEGORIES_HMFULL = {
  HMtai: ["anal", "ass", "bdsm", "cum", "classic", "creampie", "manga", "femdom", "hentai", "incest", "masturbation", "public", "ero", "orgy", "elves", "yuri", "pantsu", "glasses", "cuckold", "blowjob", "boobjob", "footjob", "handjob", "boobs", "thighs", "pussy", "ahegao", "uniform", "gangbang", "tentacles", "gif", "nsfwNeko", "nsfwMobileWallpaper", "zettaiRyouiki"],
  Nekos: ["nekogif", "wallpaper"],
  NekoBot: ["hentai", "hass", "boobs", "paizuri", "yuri", "thigh", "lewdneko", "midriff", "tentacle", "anal", "hneko", "wallpaper"],
  NekoLove: ["nekolewd"],
};

const allCategories = new Set([
  ...NSFW_CATEGORIES_HMTAI,
  ...NSFW_CATEGORIES_HMFULL.Nekos,
  ...NSFW_CATEGORIES_HMFULL.NekoBot.map(c => c === 'hass' ? 'ass' : c),
  ...NSFW_CATEGORIES_HMFULL.NekoLove,
]);

export const mergedCategories = Array.from(allCategories).sort();

export const apiMapping: { [key: string]: { api: string; source: string; }[] } = {};

for (const category of mergedCategories) {
  apiMapping[category] = [];

  if (NSFW_CATEGORIES_HMTAI.includes(category)) {
    apiMapping[category].push({ api: "hmtai", source: "hmtai" });
  }

  if (NSFW_CATEGORIES_HMFULL.HMtai.includes(category)) {
    apiMapping[category].push({ api: "hmfull", source: "HMtai" });
  }
  if (NSFW_CATEGORIES_HMFULL.Nekos.includes(category)) {
    apiMapping[category].push({ api: "hmfull", source: "Nekos" });
  }
  if (NSFW_CATEGORIES_HMFULL.NekoBot.includes(category) || (category === 'ass' && NSFW_CATEGORIES_HMFULL.NekoBot.includes('hass'))) {
    apiMapping[category].push({ api: "hmfull", source: "NekoBot" });
  }
  if (NSFW_CATEGORIES_HMFULL.NekoLove.includes(category)) {
    apiMapping[category].push({ api: "hmfull", source: "NekoLove" });
  }
}

export async function fetchImage(api: string, source: string, category: string) {
    let imageUrl: string | undefined;
    const correctedCategory = category === 'ass' && source === 'NekoBot' ? 'hass' : category;

    try {
        if (api === "hmtai") {
            imageUrl = await (hmtai.nsfw as any)[correctedCategory]();
        } else if (api === "hmfull") {
            imageUrl = await (HMfull as any)[source].nsfw[correctedCategory]();
        }
    } catch (error) {
        console.error(`Error fetching from ${api} - ${source} - ${correctedCategory}:`, error);
        return null;
    }


  if (typeof imageUrl === 'object' && imageUrl !== null && 'url' in imageUrl) {
    return (imageUrl as { url: string }).url;
  }
  return imageUrl;
}
