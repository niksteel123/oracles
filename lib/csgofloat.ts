import { productIdToSearchTerm, extractWearFromProductId } from './utils';
import { getProductById } from './products';

export interface CSGOFloatListing {
  item: {
    market_hash_name: string;
    wear_name: string;
    icon_url?: string;
    float_value?: number;
    paint_seed?: number;
  };
  price: number; // Price in cents
  id: string;
}

export interface PriceData {
  price: number;
  name: string;
  wear: string;
  image?: string;
  float?: number;
  pattern?: number;
  listingCount: number;
}

/**
 * Fetch price from CSFloat API
 */
export async function fetchCSGOFloatPrice(productId: string): Promise<PriceData> {
  const apiKey = process.env.CSGOFLOAT_API_KEY;
  if (!apiKey) {
    throw new Error('CSGOFLOAT_API_KEY environment variable not set');
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Convert productId to search term
  const searchTerm = productIdToSearchTerm(productId);
  const wearCondition = extractWearFromProductId(productId);

  // Build API URL - CSFloat API uses csfloat.com (not csgofloat.com)
  const url = new URL('https://csfloat.com/api/v1/listings');
  url.searchParams.set('market_hash_name', searchTerm);
  url.searchParams.set('limit', '50'); // Max is 50

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': apiKey, // CSFloat uses API key directly, not Bearer token
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('CSFloat API authentication failed. Check your API key.');
    }
    if (response.status === 403) {
      throw new Error('CSFloat API access forbidden. Check your API key permissions.');
    }
    if (response.status === 429) {
      throw new Error('CSFloat API rate limit exceeded.');
    }
    throw new Error(`CSFloat API error: ${response.status} ${response.statusText}`);
  }

  // CSFloat API returns array directly
  const data = await response.json() as CSGOFloatListing[];

  if (!data || data.length === 0) {
    throw new Error(`No listings found for: ${searchTerm}`);
  }

  // Filter by wear condition if specified
  let filteredItems = data;
  if (wearCondition) {
    filteredItems = data.filter((listing: CSGOFloatListing) => {
      const listingWear = listing.item.wear_name?.toLowerCase() || '';
      const targetWear = wearCondition.toLowerCase().replace('-', ' ');
      return listingWear.includes(targetWear) || targetWear.includes(listingWear);
    });

    // If no exact wear match, use all items but note it
    if (filteredItems.length === 0) {
      filteredItems = data;
    }
  }

  // Calculate median price (CSFloat returns price in cents, convert to dollars)
  const prices = filteredItems
    .map((item: CSGOFloatListing) => item.price / 100) // Convert cents to dollars
    .filter((p: number) => p > 0)
    .sort((a: number, b: number) => a - b);

  if (prices.length === 0) {
    throw new Error('No valid prices found');
  }

  const medianIndex = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0
    ? (prices[medianIndex - 1] + prices[medianIndex]) / 2
    : prices[medianIndex];

  // Get representative item (one with median price or closest)
  const representativeItem = filteredItems.find((item: CSGOFloatListing) => 
    Math.abs((item.price / 100) - medianPrice) < 0.01
  ) || filteredItems[Math.floor(filteredItems.length / 2)];

  return {
    price: medianPrice,
    name: representativeItem.item.market_hash_name || product.name,
    wear: representativeItem.item.wear_name || wearCondition || 'Unknown',
    image: representativeItem.item.icon_url ? `https://steamcommunity-a.akamaihd.net/economy/image/${representativeItem.item.icon_url}` : undefined,
    float: representativeItem.item.float_value,
    pattern: representativeItem.item.paint_seed,
    listingCount: filteredItems.length
  };
}
