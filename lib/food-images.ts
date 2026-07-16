/**
 * Taom nomi bo'yicha ANIQ rasm takliflari.
 *
 * Rasmlar Wikimedia Commons'dan (to'g'ri nomlangan) yuklab olinib, o'zimizda
 * (public/food/) saqlanadi — aniq, ishonchli, rate-limitsiz.
 * Ushbu fayl _gen_food_images.py orqali generatsiya qilinadi.
 *
 * Sotuvchi o'z rasmini ham yuklashi mumkin (add-dish-sheet).
 */

// Aniq taom havzalari (lokal /food/ yo'llari)
const POOLS: Record<string, string[]> = {
  osh: ["/food/osh-1.jpg", "/food/osh-2.jpg", "/food/osh-3.jpg", "/food/osh-4.jpg"],
  somsa: ["/food/somsa-1.jpg", "/food/somsa-2.jpg", "/food/somsa-3.jpg", "/food/somsa-4.jpg"],
  lagman: ["/food/lagman-1.jpg", "/food/lagman-2.jpg", "/food/lagman-3.jpg", "/food/lagman-4.jpg"],
  manti: ["/food/manti-1.jpg", "/food/manti-2.jpg", "/food/manti-3.jpg", "/food/manti-4.jpg"],
  kabob: ["/food/kabob-1.jpg", "/food/kabob-2.jpg", "/food/kabob-3.jpg", "/food/kabob-4.jpg"],
  chuchvara: ["/food/chuchvara-1.jpg", "/food/chuchvara-2.jpg", "/food/chuchvara-3.jpg", "/food/chuchvara-4.jpg"],
  non: ["/food/non-1.jpg", "/food/non-2.jpg", "/food/non-3.jpg", "/food/non-4.jpg"],
  shorva: ["/food/shorva-1.jpg", "/food/shorva-2.jpg", "/food/shorva-3.jpg", "/food/shorva-4.jpg"],
  lavash: ["/food/lavash-1.jpg", "/food/lavash-2.jpg", "/food/lavash-3.jpg", "/food/lavash-4.jpg"],
  hotdog: ["/food/hotdog-1.jpg", "/food/hotdog-2.jpg", "/food/hotdog-3.jpg", "/food/hotdog-4.jpg"],
  burger: ["/food/burger-1.jpg", "/food/burger-2.jpg", "/food/burger-3.jpg", "/food/burger-4.jpg"],
  pizza: ["/food/pizza-1.jpg", "/food/pizza-2.jpg", "/food/pizza-3.jpg", "/food/pizza-4.jpg"],
  fri: ["/food/fri-1.jpg", "/food/fri-2.jpg", "/food/fri-3.jpg", "/food/fri-4.jpg"],
  salat: ["/food/salat-1.jpg", "/food/salat-2.jpg", "/food/salat-3.jpg", "/food/salat-4.jpg"],
  tort: ["/food/tort-1.jpg", "/food/tort-2.jpg", "/food/tort-3.jpg", "/food/tort-4.jpg"],
  muzqaymoq: ["/food/muzqaymoq-1.jpg", "/food/muzqaymoq-2.jpg", "/food/muzqaymoq-3.jpg", "/food/muzqaymoq-4.jpg"],
  choy: ["/food/choy-1.jpg", "/food/choy-2.jpg", "/food/choy-3.jpg", "/food/choy-4.jpg"],
  kofe: ["/food/kofe-1.jpg", "/food/kofe-2.jpg", "/food/kofe-3.jpg", "/food/kofe-4.jpg"],
  sendvich: ["/food/sendvich-1.jpg", "/food/sendvich-2.jpg", "/food/sendvich-3.jpg", "/food/sendvich-4.jpg"],
  sushi: ["/food/sushi-1.jpg", "/food/sushi-2.jpg", "/food/sushi-3.jpg", "/food/sushi-4.jpg"],
  shirinlik: ["/food/shirinlik-1.jpg", "/food/shirinlik-2.jpg", "/food/shirinlik-3.jpg", "/food/shirinlik-4.jpg"],
  salat2: ["/food/salat2-1.jpg", "/food/salat2-2.jpg", "/food/salat2-3.jpg", "/food/salat2-4.jpg"],
};

// Kategoriya aralashmalari (nom mos kelmaganda — kategoriya bo'yicha)
const CATEGORY_MIX: Record<string, string[]> = {
  "Milliy taomlar": ["/food/osh-1.jpg", "/food/somsa-1.jpg", "/food/lagman-1.jpg", "/food/manti-1.jpg"],
  "Fast-fud": ["/food/burger-1.jpg", "/food/pizza-1.jpg", "/food/hotdog-1.jpg", "/food/lavash-1.jpg"],
  Shirinliklar: ["/food/tort-1.jpg", "/food/muzqaymoq-1.jpg", "/food/shirinlik-1.jpg"],
  Salatlar: ["/food/salat-1.jpg", "/food/salat2-1.jpg"],
};

const GENERIC: string[] = ["/food/osh-1.jpg", "/food/burger-1.jpg", "/food/salat-1.jpg", "/food/tort-1.jpg"];

// Nom ichidagi kalit so'z (kichik harf) -> POOLS kaliti. Birinchi moslik yutadi.
const KEYWORDS: [string[], string][] = [
  [["osh", "palov", "plov", "pilaf", "o'sh"], "osh"],
  [["somsa", "samsa", "samosa"], "somsa"],
  [["lagman", "lag'mon", "lagmon", "norin", "ugra"], "lagman"],
  [["manti", "mantı"], "manti"],
  [["chuchvara", "pelmen", "dumpling"], "chuchvara"],
  [["kabob", "kabab", "kebab", "shashlik", "shashlyk", "shishlik", "jaz", "tandir", "grill", "jarkop"], "kabob"],
  [["shorva", "sho'rva", "shurva", "shurpa", "mastava", "sup", "soup", "moshxo'rda"], "shorva"],
  [["non", "patir", "lepyoshka", "bread", "obi non"], "non"],
  [["lavash", "shaurma", "shawarma", "shaverma", "doner", "döner"], "lavash"],
  [["hot dog", "hotdog", "xot-dog", "xotdog", "sosiska"], "hotdog"],
  [["burger", "gamburger", "hamburger", "cheeseburger"], "burger"],
  [["pizza", "pitsa"], "pizza"],
  [["fri", "fries", "kartoshka fri", "free"], "fri"],
  [["sendvich", "sandwich", "club"], "sendvich"],
  [["salat", "salad", "achchiq-chuchuk", "achchiq", "achuchuk", "vinegret"], "salat"],
  [["sezar", "caesar"], "salat2"],
  [["tort", "kek", "cake", "pirog", "cheesecake", "napoleon", "medovik"], "tort"],
  [["muzqaymoq", "morojni", "morojniy", "ice cream", "plombir", "sundae"], "muzqaymoq"],
  [["shirin", "desert", "dessert", "pirojni", "donut", "ponchik", "chak-chak", "halva", "holva", "pahlava", "baklava", "ekler", "maffin", "muffin"], "shirinlik"],
  [["sushi", "rol", "roll", "filadelfiya"], "sushi"],
  [["choy", "choi", "tea", "kompot"], "choy"],
  [["kofe", "coffee", "kapuchino", "latte", "americano", "espresso"], "kofe"],
];

// Kategoriya (lib/types CATEGORIES id) -> POOLS kaliti (aniq bitta taom fallback)
const CATEGORY_POOL: Record<string, string> = {
  "Milliy taomlar": "osh",
  "Fast-fud": "burger",
  Shirinliklar: "tort",
  Salatlar: "salat",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[`'\u2018\u2019]/g, "'").trim();
}

/**
 * Taom nomi (va ixtiyoriy kategoriya) bo'yicha aniq rasm yo'llari qaytaradi.
 */
export function suggestImages(
  name: string,
  category?: string | null,
  count = 4,
): string[] {
  const n = normalize(name);
  let pool: string[] | null = null;

  if (n) {
    for (const [words, key] of KEYWORDS) {
      if (words.some((w) => n.includes(w)) && POOLS[key]?.length) {
        pool = POOLS[key];
        break;
      }
    }
  }

  // Nom mos kelmasa — kategoriya aralashmasi
  if (!pool && category && CATEGORY_MIX[category]?.length) {
    pool = CATEGORY_MIX[category];
  }
  // Yoki kategoriyaning aniq taomi
  if (!pool && category && CATEGORY_POOL[category] && POOLS[CATEGORY_POOL[category]]?.length) {
    pool = POOLS[CATEGORY_POOL[category]];
  }
  if (!pool || pool.length === 0) pool = GENERIC;

  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of [...pool, ...GENERIC]) {
    if (!seen.has(u)) {
      seen.add(u);
      out.push(u);
    }
    if (out.length >= count) break;
  }
  return out;
}
