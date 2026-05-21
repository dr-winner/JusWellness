import { Product } from "./types";

const CLOUD = "dqcejwbxk";
const img = (id: string) =>
  `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,w_600/jus-wellness/products/${id}`;

// Placeholder gradient SVG while awaiting real product photos
const placeholder = (color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:${color};stop-opacity:0.8"/><stop offset="100%" style="stop-color:#1a3a2a;stop-opacity:1"/></linearGradient></defs><rect fill="url(#g)" width="600" height="600" rx="24"/><text x="300" y="310" font-family="system-ui" font-size="28" fill="white" text-anchor="middle" opacity="0.7">Jus Wellness</text></svg>`)}`;

const placeholders: Record<string, string> = {
  juice: placeholder("#2d6a4f"),
  coconut: placeholder("#b08d57"),
  mashke: placeholder("#7b2d8b"),
  shot: placeholder("#d4a017"),
};

const juiceSizes = [
  { label: "250ml", ml: 250, price: 13 },
  { label: "350ml", ml: 350, price: 20 },
  { label: "500ml", ml: 500, price: 25 },
  { label: "5 Litre", ml: 5000, price: 280 },
];

export const products: Product[] = [
  // === JUICES ===
  {
    id: "better-off-red",
    name: "Better Off Red",
    description:
      "A bold, earthy blend that gets your blood pumping. Beetroot power meets tropical zing.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Beetroot", "Watermelon", "Lemon", "Ginger", "Pineapple"],
    benefits: ["Iron Boost", "Heart Health", "Energy"],
    inStock: true,
    badge: "Best Seller",
  },
  {
    id: "takes-two-to-mango",
    name: "Takes Two to Mango",
    description:
      "Pure mango goodness — sweet, thick, and irresistible. No mix, no dilution, just mango.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Mango"],
    benefits: ["Vitamin A", "Antioxidants", "Skin Glow"],
    inStock: true,
  },
  {
    id: "beach-body",
    name: "Beach Body",
    description:
      "Light, refreshing, and hydrating. The perfect post-workout cool-down.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Watermelon", "Mint"],
    benefits: ["Hydration", "Cooling", "Low Calorie"],
    inStock: true,
    badge: "Refreshing",
  },
  {
    id: "sun-kissed",
    name: "Sun Kissed",
    description:
      "Golden tropical vibes with a carrot kick. Tastes like sunshine in a bottle.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Carrot"],
    benefits: ["Vitamin A", "Vision Health", "Immune Support"],
    inStock: true,
  },
  {
    id: "lil-miss-sunshine",
    name: "Lil Miss Sunshine",
    description:
      "Classic orange juice, freshly squeezed. Simple, pure, and packed with vitamin C.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Orange"],
    benefits: ["Vitamin C", "Immune Boost", "Energy"],
    inStock: true,
  },
  {
    id: "take-me-higher",
    name: "Take Me Higher",
    description:
      "A rich, creamy Ghanaian superfood blend. Tiger nut meets dates and prekese for deep nutrition.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Tiger Nut", "Dates", "Prekese", "Ginger"],
    benefits: ["Aphrodisiac", "Energy", "Gut Health"],
    inStock: true,
    badge: "Local Fave",
  },
  {
    id: "heart-of-gold",
    name: "Heart of Gold",
    description:
      "Citrus meets spice — orange and pineapple lifted by a ginger punch.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Orange", "Pineapple", "Ginger"],
    benefits: ["Vitamin C", "Digestion", "Anti-inflammatory"],
    inStock: true,
  },
  {
    id: "ms-fit",
    name: "Ms Fit",
    description:
      "Light and clean — pineapple sweetness balanced by cool cucumber and mint. Your gym buddy.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Cucumber", "Mint"],
    benefits: ["Low Calorie", "Hydration", "Detox"],
    inStock: true,
    badge: "Fitness Pick",
  },
  {
    id: "lovers-rock",
    name: "Lover's Rock",
    description:
      "Creamy, warming, and indulgent. Tiger nuts and coconut with a ginger hug. A natural aphrodisiac.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Tiger Nuts", "Dates", "Coconut", "Ginger"],
    benefits: ["Aphrodisiac", "Energy", "Protein"],
    inStock: true,
    badge: "Popular",
  },
  {
    id: "ginga-yourself",
    name: "Ginga Yourself",
    description:
      "Pineapple sweetness with a fiery ginger kick. Wakes you up better than coffee.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Ginger"],
    benefits: ["Anti-inflammatory", "Metabolism", "Digestion"],
    inStock: true,
  },
  {
    id: "citrus-kick",
    name: "Citrus Kick",
    description:
      "A zesty powerhouse — orange, lemon, carrot, and ginger for maximum immunity.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Orange", "Lemon", "Carrot", "Ginger"],
    benefits: ["Immune Boost", "Vitamin C", "Anti-inflammatory"],
    inStock: true,
  },
  {
    id: "the-joy",
    name: "The Joy",
    description:
      "Tropical euphoria — pineapple meets passion fruit for a tangy-sweet explosion.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Passion Fruit"],
    benefits: ["Mood Boost", "Vitamin C", "Antioxidants"],
    inStock: true,
    badge: "New",
  },
  {
    id: "rise-and-shine",
    name: "Rise & Shine",
    description:
      "Start your morning right — pineapple, ginger, and coconut. Energizing and tropical.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Ginger", "Coconut"],
    benefits: ["Energy", "Hydration", "Metabolism"],
    inStock: true,
  },
  {
    id: "pineapple-of-my-eye",
    name: "Pineapple of My Eye",
    description:
      "Pure pineapple. Nothing else. Just the queen of tropical fruits, freshly pressed.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple"],
    benefits: ["Bromelain", "Digestion", "Vitamin C"],
    inStock: true,
  },
  {
    id: "real-good",
    name: "Real Good",
    description:
      "Pineapple, ginger, and beetroot — a triple threat for energy and detox.",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Pineapple", "Ginger", "Beetroot"],
    benefits: ["Detox", "Iron Boost", "Energy"],
    inStock: true,
  },
  {
    id: "somethings-brewing",
    name: "Something's Brewing?",
    description:
      "Our mystery blend — a surprise flavour that changes weekly. Ask us what's in it today!",
    sizes: juiceSizes,
    image: placeholders.juice,
    category: "juice",
    ingredients: ["Mystery Blend"],
    benefits: ["Surprise", "Limited Edition"],
    inStock: true,
    badge: "Mystery",
  },

  // === COCONUT PRODUCTS ===
  {
    id: "coconut-water",
    name: "Coconut Water",
    description:
      "Pure coconut water — no additions, no sugar. Nature's perfect electrolyte drink.",
    sizes: [{ label: "500ml", ml: 500, price: 25 }],
    image: placeholders.coconut,
    category: "coconut",
    ingredients: ["Coconut Water"],
    benefits: ["Hydration", "Electrolytes", "Natural"],
    inStock: true,
  },
  {
    id: "coconut-chia",
    name: "Coconut with Chia Seeds",
    description:
      "Hydrating coconut water supercharged with chia seeds for extra fibre and omega-3.",
    sizes: [
      { label: "250ml", ml: 250, price: 15 },
      { label: "500ml", ml: 500, price: 30 },
      { label: "5 Litre", ml: 5000, price: 280 },
    ],
    image: placeholders.coconut,
    category: "coconut",
    ingredients: ["Coconut Water", "Chia Seeds"],
    benefits: ["Omega-3", "Fibre", "Hydration"],
    inStock: true,
    badge: "Superfood",
  },
  {
    id: "coconut-mint-lime",
    name: "Coconut with Mint & Lime",
    description:
      "A refreshing twist on coconut water — mint and lime take it to another level.",
    sizes: [
      { label: "250ml", ml: 250, price: 15 },
      { label: "500ml", ml: 500, price: 30 },
      { label: "5 Litre", ml: 5000, price: 280 },
    ],
    image: placeholders.coconut,
    category: "coconut",
    ingredients: ["Coconut Water", "Mint", "Lime"],
    benefits: ["Cooling", "Hydration", "Digestion"],
    inStock: true,
  },

  // === MASHKE (Blended) ===
  {
    id: "bougie-mashke",
    name: "Bougie Mashke",
    description:
      "Our signature blended drink — thick, creamy, and packed with flavour. A premium treat.",
    sizes: [{ label: "500ml", ml: 500, price: 25 }],
    image: placeholders.mashke,
    category: "mashke",
    ingredients: ["Premium Blend"],
    benefits: ["Filling", "Energy", "Indulgent"],
    inStock: true,
    badge: "Premium",
  },

  // === SHOTS ===
  {
    id: "ginger-shot",
    name: "Ginger Shot",
    description:
      "A fiery immune-boosting shot. Ginger, turmeric, black pepper, orange, and lemon — one sip, maximum impact.",
    sizes: [{ label: "60ml", ml: 60, price: 15 }],
    image: placeholders.shot,
    category: "shot",
    ingredients: ["Ginger", "Turmeric", "Black Pepper", "Orange", "Lemon"],
    benefits: ["Immune Boost", "Anti-inflammatory", "Metabolism"],
    inStock: true,
    badge: "Popular",
  },
  {
    id: "de-bloat-shot",
    name: "De-bloat Shot",
    description:
      "Feeling heavy? This shot flattens and soothes. Celery, cucumber, ginger, and lemon.",
    sizes: [{ label: "60ml", ml: 60, price: 15 }],
    image: placeholders.shot,
    category: "shot",
    ingredients: ["Celery", "Cucumber", "Ginger", "Lemon"],
    benefits: ["De-bloat", "Digestion", "Gut Health"],
    inStock: true,
  },
  {
    id: "gut-health-shot",
    name: "Gut Health Shot",
    description:
      "Heal your gut from the inside. Apple, ginger, lemon, and honey for a happy tummy.",
    sizes: [{ label: "60ml", ml: 60, price: 15 }],
    image: placeholders.shot,
    category: "shot",
    ingredients: ["Apple", "Ginger", "Lemon", "Honey"],
    benefits: ["Gut Health", "Probiotics", "Soothing"],
    inStock: true,
  },
];

export const categories = [
  { id: "all", name: "All Products" },
  { id: "juice", name: "Fresh Juices" },
  { id: "coconut", name: "Coconut" },
  { id: "mashke", name: "Mashke" },
  { id: "shot", name: "Wellness Shots" },
];
