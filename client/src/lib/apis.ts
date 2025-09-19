export interface ApiResponseConfig {
  urlField: string;
  thumbnailField?: string;
}

export interface Api {
  name: string;
  baseURL: string;
  categories: string[];
  responseConfig: ApiResponseConfig;
  specialHandling?: 'nekos.moe';
}

export const APIS: Api[] = [
  // Existing APIs
  {
    name: 'nsfw_api',
    baseURL: 'https://api.n-sfw.com/nsfw/',
    categories: [
      "anal", "ass", "blowjob", "breeding", "buttplug", "cages",
      "ecchi", "feet", "fo", "gif", "hentai", "legs",
      "masturbation", "milf", "neko", "paizuri", "petgirls",
      "pierced", "selfie", "smothering", "socks", "vagina", "yuri"
    ],
    responseConfig: { urlField: 'url_japan' }
  },
  {
    name: 'waifu_pics_api',
    baseURL: 'https://api.waifu.pics/nsfw/',
    categories: ["waifu", "neko", "blowjob"],
    responseConfig: { urlField: 'url' }
  },
  {
    name: 'nekos_moe_api',
    baseURL: 'https://nekos.moe/api/v1/random/image',
    categories: [], // This API doesn't have categories in the same way
    responseConfig: { urlField: 'id' },
    specialHandling: 'nekos.moe', // Special flag for unique URL construction
  },
  // New Want.cat APIs
  {
    name: 'want_cat_api',
    baseURL: 'https://api.want.cat/api/',
    categories: [
      'Waifus', 'asshentai', 'bonitas', 'cosplay', 'gif',
      'interracial', 'memes', 'nekonsfw', 'realegirls',
      'realpfp', 'pussy', 'realboobs'
    ],
    responseConfig: { urlField: 'url' }
  },
  {
    name: 'real_want_cat_api',
    baseURL: 'https://real.want.cat/api/',
    categories: [
      'videos', 'gifs', 'cosplay', 'ass', 'lesbian',
      'transgender', 'bbc'
    ],
    responseConfig: { urlField: 'url' }
  },
  {
    name: 'reddit_want_cat_api',
    baseURL: 'https://reddit.want.cat/api/v3/', // Using v3 for more posts
    categories: [
      // These are just examples, the user will use the search input
      'nsfw', 'gonewild', 'asiansgonewild', 'realgirls'
    ],
    responseConfig: { urlField: 'mediaUrl', thumbnailField: 'thumbnail' }
  }
];

// CATEGORY_MAP defines the merging of categories from different APIs
// The key is the display name in the UI, and the value is a list of raw category names from the APIs
export const CATEGORY_MAP: { [key: string]: string[] } = {
  'Anal': ['anal'],
  'Ass': ['ass'],
  'Blowjob': ['blowjob'],
  'BBC': ['bbc'],
  'Bonitas': ['bonitas'],
  'Breeding': ['breeding'],
  'Buttplug': ['buttplug'],
  'Cages': ['cages'],
  'Cosplay': ['cosplay'],
  'Ecchi': ['ecchi'],
  'Feet': ['feet'],
  'Fo': ['fo'],
  'GIFs': ['gif', 'gifs'],
  'Hentai': ['hentai', 'asshentai'],
  'Interracial': ['interracial'],
  'Legs': ['legs'],
  'Lesbian': ['lesbian', 'yuri'],
  'Masturbation': ['masturbation'],
  'Memes': ['memes'],
  'MILF': ['milf'],
  'Neko': ['neko', 'nekonsfw'],
  'Paizuri': ['paizuri'],
  'Petgirls': ['petgirls'],
  'Pierced': ['pierced'],
  'Pussy': ['pussy', 'vagina'],
  'Real Boobs': ['realboobs'],
  'Real E-girls': ['realegirls'],
  'Real PFP': ['realpfp'],
  'Selfie': ['selfie'],
  'Smothering': ['smothering'],
  'Socks': ['socks'],
  'Transgender': ['transgender'],
  'Videos': ['videos'],
  'Waifus': ['Waifus', 'waifu'],
  // Reddit categories are handled by search, but we can have some popular ones here
  'r/nsfw': ['nsfw'],
  'r/gonewild': ['gonewild'],
  'r/asiansgonewild': ['asiansgonewild'],
  'r/realgirls': ['realgirls'],
};

// Returns the list of categories to display in the dropdown
export const getDisplayCategories = () => Object.keys(CATEGORY_MAP).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

// Finds all (api, category) pairs that match a given display category
export const findApiAndCategoryForDisplayCategory = (displayCategory: string) => {
  const apiCategories = CATEGORY_MAP[displayCategory];
  if (!apiCategories) return [];

  const result: { api: Api, category: string }[] = [];

  for (const api of APIS) {
    for (const apiCat of api.categories) {
      // Case-insensitive comparison for merging
      if (apiCategories.map(c => c.toLowerCase()).includes(apiCat.toLowerCase())) {
        result.push({ api, category: apiCat });
      }
    }
  }
  return result;
};
