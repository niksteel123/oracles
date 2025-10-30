/**
 * Utility functions for product ID conversion and validation
 */

/**
 * Convert productId to CSGOFloat search term
 * Example: "butterfly-gamma-fn" -> "Butterfly Knife Gamma Doppler"
 */
export function productIdToSearchTerm(productId: string): string {
  // Remove wear suffixes
  let term = productId
    .replace(/-fn$/i, '')
    .replace(/-mw$/i, '')
    .replace(/-ft$/i, '')
    .replace(/-ww$/i, '')
    .replace(/-bs$/i, '')
    .replace(/-fn-stit$/i, '')
    .replace(/-mw-stit$/i, '')
    .replace(/-ft-stit$/i, '');

  // Replace hyphens with spaces and capitalize words
  term = term
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  // Common CS2 name mappings
  const mappings: Record<string, string> = {
    'Butterfly': '★ Butterfly Knife',
    'Karambit': '★ Karambit',
    'Talon': '★ Talon Knife',
    'M9': '★ M9 Bayonet',
    'Skeleton': '★ Skeleton Knife',
    'Ursus': '★ Ursus Knife',
    'Stiletto': '★ Stiletto Knife',
    'Classic': '★ Classic Knife',
    'AWP': 'AWP',
    'AK': 'AK-47',
    'AK47': 'AK-47',
    'M4': 'M4A4',
    'M4A1S': 'M4A1-S',
    'M4A1-S': 'M4A1-S',
    'Glock': 'Glock-18',
    'Deagle': 'Desert Eagle',
    'USP': 'USP-S',
    'USP-S': 'USP-S',
    'P250': 'P250',
    'Five Seven': 'Five-SeveN',
    'Tec9': 'Tec-9',
    'Tec 9': 'Tec-9'
  };

  // Apply mappings
  for (const [key, value] of Object.entries(mappings)) {
    if (term.startsWith(key + ' ') || term === key) {
      term = term.replace(key, value);
      break;
    }
  }

  // Add pattern name mappings
  term = term
    .replace(/Gamma Doppler/gi, 'Gamma Doppler')
    .replace(/Tiger Tooth/gi, 'Tiger Tooth')
    .replace(/Crimson Web/gi, 'Crimson Web')
    .replace(/Case Hardened/gi, 'Case Hardened')
    .replace(/Doppler Phase 2/gi, 'Doppler Phase 2')
    .replace(/Fade/gi, 'Fade')
    .replace(/Marble Fade/gi, 'Marble Fade')
    .replace(/Slaughter/gi, 'Slaughter')
    .replace(/Dragon Lore/gi, 'Dragon Lore')
    .replace(/Fire Serpent/gi, 'Fire Serpent')
    .replace(/Howl/gi, 'Howl')
    .replace(/Gungnir/gi, 'Gungnir')
    .replace(/Wild Lotus/gi, 'Wild Lotus')
    .replace(/Poseidon/gi, 'Poseidon')
    .replace(/Gold Arabesque/gi, 'Gold Arabesque')
    .replace(/The Prince/gi, 'The Prince')
    .replace(/Welcome To Jungle/gi, 'Welcome to the Jungle')
    .replace(/X Ray/gi, 'X-Ray')
    .replace(/Asiimov/gi, 'Asiimov')
    .replace(/Vulcan/gi, 'Vulcan')
    .replace(/Despair/gi, 'Despair')
    .replace(/Medusa/gi, 'Medusa')
    .replace(/Neon Rider/gi, 'Neon Rider')
    .replace(/Blaze/gi, 'Blaze')
    .replace(/Kill Confirmed/gi, 'Kill Confirmed')
    .replace(/Whiteout/gi, 'Whiteout')
    .replace(/Angry Mob/gi, 'Angry Mob')
    .replace(/Water Elemental/gi, 'Water Elemental')
    .replace(/Orion/gi, 'Orion')
    .replace(/Nuclear Threat/gi, 'Nuclear Threat');

  return term;
}

/**
 * Normalize wear condition names
 */
export function normalizeWear(wear: string): string {
  const wearMap: Record<string, string> = {
    'factory new': 'Factory New',
    'fn': 'Factory New',
    'minimal wear': 'Minimal Wear',
    'mw': 'Minimal Wear',
    'field-tested': 'Field-Tested',
    'ft': 'Field-Tested',
    'well-worn': 'Well-Worn',
    'ww': 'Well-Worn',
    'battle-scarred': 'Battle-Scarred',
    'bs': 'Battle-Scarred'
  };

  const normalized = wear.toLowerCase().trim();
  return wearMap[normalized] || wear;
}

/**
 * Extract wear condition from productId
 */
export function extractWearFromProductId(productId: string): string | undefined {
  if (productId.endsWith('-fn')) return 'Factory New';
  if (productId.endsWith('-mw')) return 'Minimal Wear';
  if (productId.endsWith('-ft')) return 'Field-Tested';
  if (productId.endsWith('-ww')) return 'Well-Worn';
  if (productId.endsWith('-bs')) return 'Battle-Scarred';
  return undefined;
}

