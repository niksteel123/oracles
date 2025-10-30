import { productIdToSearchTerm } from './utils';
import { getProductById } from './products';

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
 * Fetch price from Apify actor (fallback method)
 * Uses buff163-market-scraper or similar CS2 scraping actor
 */
export async function fetchApifyPrice(productId: string): Promise<PriceData> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    throw new Error('APIFY_TOKEN environment variable not set');
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const searchTerm = productIdToSearchTerm(productId);

  // Try common CS2 scraping actors
  // Note: User will need to specify which actor to use
  const actorId = process.env.APIFY_ACTOR_ID || 'buff163-market-scraper';

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/run-sync`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          searchTerm: searchTerm,
          limit: 20
        })
      }
    );

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Apify API authentication failed. Check your API token.');
      }
      if (response.status === 429) {
        throw new Error('Apify API rate limit exceeded.');
      }
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as any;

    // Parse Apify actor results
    // Structure depends on the actor, but typically has items array
    const items = result.data?.items || result.items || (Array.isArray(result.data) ? result.data : []);

    if (!items || items.length === 0) {
      throw new Error(`No listings found for: ${searchTerm}`);
    }

    // Extract prices and calculate median
    const prices = items
      .map((item: any) => {
        // Handle different price formats from Apify actors
        const price = item.price || item.priceUSD || item.usd || parseFloat(item.priceStr?.replace(/[^0-9.]/g, '') || '0');
        return price;
      })
      .filter((p: number) => p > 0)
      .sort((a: number, b: number) => a - b);

    if (prices.length === 0) {
      throw new Error('No valid prices found in Apify results');
    }

    const medianIndex = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 === 0
      ? (prices[medianIndex - 1] + prices[medianIndex]) / 2
      : prices[medianIndex];

    // Get representative item
    const representativeItem = items.find((item: any) => {
      const price = item.price || item.priceUSD || item.usd || parseFloat(item.priceStr?.replace(/[^0-9.]/g, '') || '0');
      return Math.abs(price - medianPrice) < 0.01;
    }) || items[Math.floor(items.length / 2)];

    return {
      price: medianPrice,
      name: representativeItem.name || representativeItem.itemName || product.name,
      wear: representativeItem.wear || representativeItem.condition || 'Unknown',
      image: representativeItem.image || representativeItem.imageUrl,
      float: representativeItem.float || representativeItem.floatValue,
      pattern: representativeItem.pattern || representativeItem.patternIndex,
      listingCount: items.length
    };

  } catch (error) {
    if (error instanceof Error && error.message.includes('authentication')) {
      throw error;
    }
    // If actor not found or other error, provide helpful message
    throw new Error(`Apify actor "${actorId}" failed: ${error instanceof Error ? error.message : String(error)}. Ensure the actor ID is correct and the actor supports CS2 skin data.`);
  }
}

