import { getProductById } from './products';
import { productIdToSearchTerm } from './utils';

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
 * Fetch price from Steam Community Market API
 * Public endpoint - no auth required
 */
export async function fetchSteamPrice(productId: string): Promise<PriceData> {
  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  // Convert productId to Steam market hash name
  const searchTerm = productIdToSearchTerm(productId);
  
  // Steam Community Market API endpoint
  // appid=730 is CS2, currency=1 is USD
  const url = new URL('https://steamcommunity.com/market/priceoverview/');
  url.searchParams.set('appid', '730'); // CS2
  url.searchParams.set('currency', '1'); // USD
  url.searchParams.set('market_hash_name', searchTerm);

  const response = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; MCP-Server/1.0)',
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Steam API rate limit exceeded.');
    }
    throw new Error(`Steam API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    success: boolean;
    lowest_price?: string;
    volume?: string;
    median_price?: string;
  };

  if (!data.success) {
    throw new Error(`Steam API returned success=false for: ${searchTerm}`);
  }

  // Parse price - Steam returns prices like "$1,234.56 USD"
  const priceString = data.median_price || data.lowest_price || '0';
  const priceMatch = priceString.match(/[\d,]+\.?\d*/);
  
  if (!priceMatch) {
    throw new Error(`Could not parse price from Steam response: ${priceString}`);
  }

  const price = parseFloat(priceMatch[0].replace(/,/g, ''));

  if (isNaN(price) || price <= 0) {
    throw new Error(`Invalid price parsed: ${price}`);
  }

  // Parse volume if available
  const volume = data.volume ? parseInt(data.volume.replace(/,/g, '')) : 0;

  return {
    price,
    name: product.name,
    wear: product.variant || 'Unknown',
    listingCount: volume || 1
  };
}

