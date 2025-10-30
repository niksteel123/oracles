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
 * Fetch price from Buff163 by scraping via Apify
 */
export async function fetchBuff163Price(productId: string): Promise<PriceData> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    throw new Error('APIFY_TOKEN environment variable not set');
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const searchTerm = productIdToSearchTerm(productId);

  // Buff163 search API endpoint
  // Use Apify's Web Scraper to fetch from Buff163
  const buffUrl = `https://buff.163.com/api/market/goods?game=csgo&page_num=1&search=${encodeURIComponent(searchTerm)}&use_suggestion=0&_=`;
  
  try {
    // Use Apify's web scraper actor to fetch Buff163 data
    const response = await fetch(
      'https://api.apify.com/v2/acts/apify~web-scraper/runs/sync',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startUrls: [{ url: buffUrl }],
          waitFor: 2000,
          pageFunction: `
            async function pageFunction(context) {
              const { page, request } = context;
              await page.waitForSelector('pre', { timeout: 5000 });
              const jsonText = await page.$eval('pre', el => el.textContent);
              return JSON.parse(jsonText);
            }
          `
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as any;
    
    // Parse Buff163 API response
    // Buff163 returns: { code: "OK", data: { items: [...], total_count: ... } }
    const data = result.data?.dataset?.items?.[0]?.data || result;
    
    if (!data || (data.code && data.code !== 'OK')) {
      throw new Error(`Buff163 API returned error: ${data?.code || 'Unknown'}`);
    }

    const items = data.data?.items || [];
    
    if (!items || items.length === 0) {
      throw new Error(`No listings found for: ${searchTerm}`);
    }

    // Extract prices from Buff163 response
    const prices = items
      .map((item: any) => {
        // Buff163 price is in CNY, convert to USD (rough conversion)
        const priceCNY = parseFloat(item.price || item.sell_min_price || '0');
        const priceUSD = priceCNY / 7.2; // Approximate CNY to USD conversion
        return priceUSD;
      })
      .filter((p: number) => p > 0 && !isNaN(p))
      .sort((a: number, b: number) => a - b);

    if (prices.length === 0) {
      throw new Error('No valid prices found in Buff163 response');
    }

    const medianIndex = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 === 0
      ? (prices[medianIndex - 1] + prices[medianIndex]) / 2
      : prices[medianIndex];

    const firstItem = items[0];

    return {
      price: Math.round(medianPrice * 100) / 100,
      name: firstItem.market_hash_name || firstItem.name || product.name,
      wear: firstItem.tags?.exterior?.localized_name || product.variant || 'Unknown',
      image: firstItem.goods_info?.icon_url || firstItem.icon_url,
      listingCount: items.length
    };

  } catch (error) {
    throw new Error(`Buff163 scraping failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

