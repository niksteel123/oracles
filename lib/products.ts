import { Product } from '../types/mcp';

/**
 * Curated CS2 Skins Product Catalog
 * Product IDs are stable and URL-safe
 */

export const PRODUCTS: Product[] = [
  // Tier 1: High-Value Knives
  {
    productId: "butterfly-gamma-fn",
    name: "★ Butterfly Knife | Gamma Doppler",
    category: "Knives",
    tags: ["butterfly", "gamma", "doppler", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "karambit-fade-mw",
    name: "★ Karambit | Fade",
    category: "Knives",
    tags: ["karambit", "fade", "minimal-wear", "knife"],
    variant: "Minimal Wear"
  },
  {
    productId: "talon-tiger-fn",
    name: "★ Talon Knife | Tiger Tooth",
    category: "Knives",
    tags: ["talon", "tiger-tooth", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "m9-crimson-mw",
    name: "★ M9 Bayonet | Crimson Web",
    category: "Knives",
    tags: ["m9", "bayonet", "crimson-web", "minimal-wear", "knife"],
    variant: "Minimal Wear"
  },
  {
    productId: "butterfly-case-fn",
    name: "★ Butterfly Knife | Case Hardened",
    category: "Knives",
    tags: ["butterfly", "case-hardened", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "karambit-doppler-fn",
    name: "★ Karambit | Doppler Phase 2",
    category: "Knives",
    tags: ["karambit", "doppler", "phase-2", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "skeleton-fade-fn",
    name: "★ Skeleton Knife | Fade",
    category: "Knives",
    tags: ["skeleton", "fade", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "ursus-marble-fn",
    name: "★ Ursus Knife | Marble Fade",
    category: "Knives",
    tags: ["ursus", "marble-fade", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "stiletto-slaughter-fn",
    name: "★ Stiletto Knife | Slaughter",
    category: "Knives",
    tags: ["stiletto", "slaughter", "factory-new", "knife"],
    variant: "Factory New"
  },
  {
    productId: "classic-fade-fn",
    name: "★ Classic Knife | Fade",
    category: "Knives",
    tags: ["classic", "fade", "factory-new", "knife"],
    variant: "Factory New"
  },

  // Tier 2: Popular Rifles
  {
    productId: "awp-dragon-lore-fn",
    name: "AWP | Dragon Lore",
    category: "Rifles",
    tags: ["awp", "dragon-lore", "factory-new", "sniper"],
    variant: "Factory New"
  },
  {
    productId: "ak-fire-serpent-ft",
    name: "AK-47 | Fire Serpent",
    category: "Rifles",
    tags: ["ak47", "fire-serpent", "field-tested", "rifle"],
    variant: "Field-Tested"
  },
  {
    productId: "m4-howl-mw",
    name: "M4A4 | Howl",
    category: "Rifles",
    tags: ["m4a4", "howl", "minimal-wear", "rifle"],
    variant: "Minimal Wear"
  },
  {
    productId: "awp-gungnir-fn",
    name: "AWP | Gungnir",
    category: "Rifles",
    tags: ["awp", "gungnir", "factory-new", "sniper"],
    variant: "Factory New"
  },
  {
    productId: "ak-wild-lotus-fn",
    name: "AK-47 | Wild Lotus",
    category: "Rifles",
    tags: ["ak47", "wild-lotus", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "m4-poseidon-fn",
    name: "M4A4 | Poseidon",
    category: "Rifles",
    tags: ["m4a4", "poseidon", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "ak-gold-arabesque-fn",
    name: "AK-47 | Gold Arabesque",
    category: "Rifles",
    tags: ["ak47", "gold-arabesque", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "awp-prince-fn",
    name: "AWP | The Prince",
    category: "Rifles",
    tags: ["awp", "prince", "factory-new", "sniper"],
    variant: "Factory New"
  },
  {
    productId: "m4a1-jungle-mw",
    name: "M4A1-S | Welcome to the Jungle",
    category: "Rifles",
    tags: ["m4a1s", "welcome-to-jungle", "minimal-wear", "rifle"],
    variant: "Minimal Wear"
  },
  {
    productId: "ak-xray-fn",
    name: "AK-47 | X-Ray",
    category: "Rifles",
    tags: ["ak47", "x-ray", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "awp-asiimov-fn",
    name: "AWP | Asiimov",
    category: "Rifles",
    tags: ["awp", "asiimov", "factory-new", "sniper"],
    variant: "Factory New"
  },
  {
    productId: "ak-vulcan-fn",
    name: "AK-47 | Vulcan",
    category: "Rifles",
    tags: ["ak47", "vulcan", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "m4-despair-fn",
    name: "M4A4 | Despair",
    category: "Rifles",
    tags: ["m4a4", "despair", "factory-new", "rifle"],
    variant: "Factory New"
  },
  {
    productId: "awp-medusa-fn",
    name: "AWP | Medusa",
    category: "Rifles",
    tags: ["awp", "medusa", "factory-new", "sniper"],
    variant: "Factory New"
  },
  {
    productId: "ak-neon-rider-fn",
    name: "AK-47 | Neon Rider",
    category: "Rifles",
    tags: ["ak47", "neon-rider", "factory-new", "rifle"],
    variant: "Factory New"
  },

  // Tier 3: Popular Pistols
  {
    productId: "glock-fade-fn",
    name: "Glock-18 | Fade",
    category: "Pistols",
    tags: ["glock", "fade", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "deagle-blaze-fn",
    name: "Desert Eagle | Blaze",
    category: "Pistols",
    tags: ["desert-eagle", "blaze", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "usp-kill-confirmed-mw",
    name: "USP-S | Kill Confirmed",
    category: "Pistols",
    tags: ["usp-s", "kill-confirmed", "minimal-wear", "pistol"],
    variant: "Minimal Wear"
  },
  {
    productId: "p250-whiteout-fn",
    name: "P250 | Whiteout",
    category: "Pistols",
    tags: ["p250", "whiteout", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "five-seven-angry-mob-fn",
    name: "Five-SeveN | Angry Mob",
    category: "Pistols",
    tags: ["five-seven", "angry-mob", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "glock-water-elemental-fn",
    name: "Glock-18 | Water Elemental",
    category: "Pistols",
    tags: ["glock", "water-elemental", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "deagle-crimson-fn",
    name: "Desert Eagle | Crimson Web",
    category: "Pistols",
    tags: ["desert-eagle", "crimson-web", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "usp-orion-fn",
    name: "USP-S | Orion",
    category: "Pistols",
    tags: ["usp-s", "orion", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "p250-asimov-fn",
    name: "P250 | Asiimov",
    category: "Pistols",
    tags: ["p250", "asiimov", "factory-new", "pistol"],
    variant: "Factory New"
  },
  {
    productId: "tec9-nuclear-fn",
    name: "Tec-9 | Nuclear Threat",
    category: "Pistols",
    tags: ["tec9", "nuclear-threat", "factory-new", "pistol"],
    variant: "Factory New"
  }
];

/**
 * Get product by productId
 */
export function getProductById(productId: string): Product | undefined {
  return PRODUCTS.find(p => p.productId === productId);
}

/**
 * Get all product IDs
 */
export function getAllProductIds(): string[] {
  return PRODUCTS.map(p => p.productId);
}

