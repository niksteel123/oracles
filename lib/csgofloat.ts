import { productIdToSearchTerm, extractWearFromProductId } from './utils';
import { getProductById } from './products';

export interface CSGOFloatListing {
  name: string;
  wear?: string;
  price: number;
  currency: string;
  image?: string;
  float_value?: number;
  pattern_index?: number;
}

export interface CSGOFloatResponse {
  items: CSGOFloatListing[];
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
 * Fetch price from CSGOFloat API
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

  // Build API URL
  const url = new URL('https://csgofloat.com/api/v1/listings');
  url.searchParams.set('name', searchTerm);
  url.searchParams.set('limit', '20'); // Get more listings for better median

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('CSGOFloat API authentication failed. Check your API key.');
    }
    if (response.status === 429) {
      throw new Error('CSGOFloat API rate limit exceeded.');
    }
    throw new Error(`CSGOFloat API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as CSGOFloatResponse;

  if (!data.items || data.items.length === 0) {
    throw new Error(`No listings found for: ${searchTerm}`);
  }

  // Filter by wear condition if specified
  let filteredItems = data.items;
  if (wearCondition) {
    filteredItems = data.items.filter(item => {
      if (!item.wear) return false;
      const normalized = item.wear.toLowerCase();
      return normalized.includes(wearCondition.toLowerCase().replace('-', ' '));
    });

    // If no exact wear match, use all items but note it
    if (filteredItems.length === 0) {
      filteredItems = data.items;
    }
  }

  // Calculate median price
  const prices = filteredItems
    .map(item => item.price)
    .filter(p => p > 0)
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    throw new Error('No valid prices found');
  }

  const medianIndex = Math.floor(prices.length / 2);
  const medianPrice = prices.length % 2 === 0
    ? (prices[medianIndex - 1] + prices[medianIndex]) / 2
    : prices[medianIndex];

  // Get representative item (one with median price or closest)
  const representativeItem = filteredItems.find(item => 
    Math.abs(item.price - medianPrice) < 0.01
  ) || filteredItems[Math.floor(filteredItems.length / 2)];

  return {
    price: medianPrice,
    name: representativeItem.name || product.name,
    wear: representativeItem.wear || wearCondition || 'Unknown',
    image: representativeItem.image,
    float: representativeItem.float_value,
    pattern: representativeItem.pattern_index,
    listingCount: filteredItems.length
  };
}

