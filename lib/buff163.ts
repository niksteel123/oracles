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

  // Buff163 public search page
  const buffUrl = `https://buff.163.com/goods/market/search?game=csgo&search=${encodeURIComponent(searchTerm)}`;
  
  try {
    // Start Apify actor run
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~web-scraper/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startUrls: [{ url: buffUrl }],
          waitFor: 3000,
          pageFunction: `
            async function pageFunction(context) {
              const { page } = context;
              
              // Wait for page to load
              await page.waitForTimeout(3000);
              
              // Extract prices from Buff163 page
              const items = await page.evaluate(() => {
                const results = [];
                
                // Buff163 uses data attributes and specific classes
                const rows = Array.from(document.querySelectorAll('tr[data-good-id], .market-list-item, [data-good-id]'));
                
                rows.forEach(row => {
                  try {
                    const nameEl = row.querySelector('a[href*="/goods/"], .name, [class*="name"]');
                    const priceEl = row.querySelector('.price, [class*="price"], .sell_price, [data-price]');
                    
                    if (nameEl && priceEl) {
                      const name = nameEl.textContent?.trim() || '';
                      const priceText = priceEl.textContent?.trim() || '';
                      
                      // Extract price number (CNY format like "¥1,234.56" or "1234.56")
                      const priceMatch = priceText.match(/[\\d,]+(?:\\.[\\d]+)?/) || priceText.match(/\\d+/);
                      
                      if (priceMatch && name) {
                        const priceCNY = parseFloat(priceMatch[0].replace(/,/g, ''));
                        if (priceCNY > 0) {
                          results.push({
                            name: name,
                            priceCNY: priceCNY,
                            priceText: priceText
                          });
                        }
                      }
                    }
                  } catch (e) {
                    // Skip invalid rows
                  }
                });
                
                return results;
              });
              
              return items;
            }
          `
        })
      }
    );

    if (!runResponse.ok) {
      const errorText = await runResponse.text();
      throw new Error(`Apify actor start failed: ${runResponse.status} - ${errorText}`);
    }

    const runData = await runResponse.json() as any;
    const runId = runData.data?.id;

    if (!runId) {
      throw new Error('Failed to get Apify run ID');
    }

    // Wait for run to complete and get dataset
    let attempts = 0;
    let datasetItems: any[] = [];

    while (attempts < 30) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        {
          headers: {
            'Authorization': `Bearer ${apifyToken}`
          }
        }
      );

      const status = await statusResponse.json() as any;
      
      if (status.data?.status === 'SUCCEEDED') {
        // Get dataset items
        const datasetResponse = await fetch(
          `https://api.apify.com/v2/datasets/${status.data.defaultDatasetId}/items`,
          {
            headers: {
              'Authorization': `Bearer ${apifyToken}`
            }
          }
        );
        
        const dataset = await datasetResponse.json() as any;
        datasetItems = dataset.items || dataset.data?.items || [];
        break;
      } else if (status.data?.status === 'FAILED' || status.data?.status === 'ABORTED') {
        throw new Error(`Apify run failed: ${status.data.status}`);
      }
      
      attempts++;
    }

    if (datasetItems.length === 0) {
      throw new Error(`No items found in Apify dataset for: ${searchTerm}`);
    }

    // Extract and convert prices
    const prices = datasetItems
      .flatMap((item: any) => {
        const items = item.items || (Array.isArray(item) ? item : [item]);
        return items.map((i: any) => {
          const priceCNY = i.priceCNY || parseFloat(i.priceText?.replace(/[^0-9.]/g, '') || '0');
          // Convert CNY to USD (rate ~7.1)
          const priceUSD = priceCNY / 7.1;
          return priceUSD;
        });
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

    const firstItem = datasetItems[0]?.items?.[0] || datasetItems[0] || {};

    return {
      price: Math.round(medianPrice * 100) / 100,
      name: firstItem.name || product.name,
      wear: product.variant || 'Unknown',
      listingCount: prices.length
    };

  } catch (error) {
    throw new Error(`Buff163 scraping failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
