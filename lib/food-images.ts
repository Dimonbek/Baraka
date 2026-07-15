/**
 * Taom nomi bo'yicha mos rasm takliflari.
 *
 * Sotuvchi rasm yuklamaydi — taom nomini yozadi, biz esa 3-4 ta mos rasm
 * taklif qilamiz (Unsplash CDN'dan). Barcha URL'lar oldindan tekshirilgan (200).
 * Sotuvchi o'ziga yoqqanini tanlaydi — shuning uchun ba'zi takliflar taxminiy
 * bo'lsa ham muammo emas.
 */

const U = (id: string) => `https://images.unsplash.com/${id}?w=600&q=80`;

// Tekshirilgan Unsplash rasm ID'lari bo'yicha "havzalar" (pools).
const POOLS = {
  osh: [
    "photo-1633945274405-b6c8069047b0",
    "photo-1596797038530-2c107229654b",
    "photo-1642821373181-696a54913e93",
    "photo-1585032226651-759b368d7246",
  ],
  somsa: [
    "photo-1601050690597-df0568f70950",
    "photo-1509440159596-0249088772ff",
    "photo-1608039755401-742074f0548d",
    "photo-1476718406336-bb5a9690ee2a",
  ],
  kabob: [
    "photo-1529193591184-b1d58069ecdd",
    "photo-1555939594-58d7cb561ad1",
    "photo-1544025162-d76694265947",
    "photo-1598103442097-8b74394b95c6",
  ],
  manti: [
    "photo-1563245372-f21724e3856d",
    "photo-1534422298391-e4f8c172dddb",
    "photo-1596797038530-2c107229654b",
    "photo-1633945274405-b6c8069047b0",
  ],
  shorva: [
    "photo-1547592166-23ac45744acd",
    "photo-1604909052743-94e838986d24",
    "photo-1550547660-d9450f859349",
  ],
  lagman: [
    "photo-1547592180-85f173990554",
    "photo-1621996346565-e3dbc646d9a9",
    "photo-1604909052743-94e838986d24",
  ],
  non: [
    "photo-1509440159596-0249088772ff",
    "photo-1549931319-a545dcf3bc73",
  ],
  burger: [
    "photo-1568901346375-23c9450c58cd",
    "photo-1565299624946-b28f40a0ae38",
    "photo-1571091718767-18b5b1457add",
  ],
  pizza: [
    "photo-1513104890138-7c749659a591",
    "photo-1610970881699-44a5587cabec",
    "photo-1626804475297-41608ea09aeb",
  ],
  fastfud: [
    "photo-1568901346375-23c9450c58cd",
    "photo-1513104890138-7c749659a591",
    "photo-1573080496219-bb080dd4f877",
    "photo-1528735602780-2552fd46c7af",
  ],
  salat: [
    "photo-1512621776951-a57141f2eefd",
    "photo-1606491956689-2ea866880c84",
  ],
  tort: [
    "photo-1578985545062-69928b1d9587",
    "photo-1495147466023-ac5c588e2e94",
  ],
  shirinlik: [
    "photo-1578985545062-69928b1d9587",
    "photo-1551024601-bec78aea704b",
    "photo-1497034825429-c343d7c6a68f",
    "photo-1495147466023-ac5c588e2e94",
  ],
  muzqaymoq: [
    "photo-1497034825429-c343d7c6a68f",
    "photo-1567620905732-2d1ec7ab7445",
  ],
  ichimlik: [
    "photo-1544787219-7f47ccb76574",
    "photo-1509042239860-f550ce710b93",
  ],
  sushi: [
    "photo-1579871494447-9811cf80d66c",
  ],
  // Umumiy — nom hech nimaga mos kelmasa aralash taomlar.
  generic: [
    "photo-1633945274405-b6c8069047b0",
    "photo-1568901346375-23c9450c58cd",
    "photo-1512621776951-a57141f2eefd",
    "photo-1578985545062-69928b1d9587",
    "photo-1547592180-85f173990554",
    "photo-1552539618-7eec9b4d1796",
  ],
} satisfies Record<string, string[]>;

type PoolKey = keyof typeof POOLS;

// Nom ichidagi kalit so'z (kichik harf) -> havza. Birinchi moslik yutadi.
const KEYWORDS: [string[], PoolKey][] = [
  [["osh", "palov", "plov", "pilaf", "o'sh"], "osh"],
  [["somsa", "samsa", "samosa"], "somsa"],
  [["kabob", "kabab", "kebab", "shashlik", "shashlyk", "shishlik", "jaz", "tandir", "grill", "jarkop", "jarqop"], "kabob"],
  [["manti", "mantı", "chuchvara", "dumpling", "pelmen", "hinkal"], "manti"],
  [["shorva", "sho'rva", "shurva", "shurpa", "mastava", "sup", "soup", "moshxo'rda", "moshxurda"], "shorva"],
  [["lagman", "lag'mon", "lagmon", "norin", "makaron", "pasta", "spagetti", "noodle", "ugra"], "lagman"],
  [["non", "patir", "lepyoshka", "bread", "obi non"], "non"],
  [["burger", "gamburger", "hamburger", "cheeseburger"], "burger"],
  [["pizza", "pitsa"], "pizza"],
  [["fri", "fries", "xot-dog", "hot dog", "hotdog", "sendvich", "sandwich", "shaurma", "shawarma", "shaverma", "lavash", "doner", "döner", "nugget", "naggets", "strips", "club"], "fastfud"],
  [["salat", "salad", "achchiq-chuchuk", "achchiq", "vinegret", "sezar", "caesar"], "salat"],
  [["tort", "kek", "cake", "pirog", "cheesecake"], "tort"],
  [["shirin", "desert", "dessert", "pirojni", "donut", "ponchik", "chak-chak", "chakchak", "halva", "holva", "pahlava", "pashmak", "napoleon", "medovik", "ekler", "maffin", "muffin"], "shirinlik"],
  [["muzqaymoq", "morojni", "morojniy", "ice cream", "plombir", "sundae"], "muzqaymoq"],
  [["choy", "choi", "tea", "kofe", "coffee", "kapuchino", "latte", "sharbat", "juice", "sok", "kola", "cola", "gazak", "suv", "ichimlik", "kompot", "smuzi", "smoothie", "milkshake", "koktel"], "ichimlik"],
  [["sushi", "rol", "roll", "filadelfiya"], "sushi"],
];

// Kategoriya (lib/types CATEGORIES id) -> havza (nom mos kelmaganda).
const CATEGORY_POOL: Record<string, PoolKey> = {
  "Milliy taomlar": "osh",
  "Fast-fud": "fastfud",
  Shirinliklar: "shirinlik",
  Salatlar: "salat",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[`'']/g, "'")
    .trim();
}

/**
 * Taom nomi (va ixtiyoriy kategoriya) bo'yicha rasm URL'lari qaytaradi.
 * Har doim kamida bir nechta variant (generic fallback bilan).
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
      if (words.some((w) => n.includes(w))) {
        pool = POOLS[key];
        break;
      }
    }
  }

  if (!pool && category && CATEGORY_POOL[category]) {
    pool = POOLS[CATEGORY_POOL[category]];
  }

  if (!pool) pool = POOLS.generic;

  // Havza kichik bo'lsa generic bilan to'ldiramiz (takrorsiz).
  const ids = [...new Set([...pool, ...POOLS.generic])].slice(0, count);
  return ids.map(U);
}
