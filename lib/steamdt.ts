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
 * Fetch price from SteamDT by scraping via Apify
 * SteamDT doesn't require auth for viewing prices
 */
export async function fetchSteamDTPrice(productId: string): Promise<PriceData> {
  const apifyToken = process.env.APIFY_TOKEN;
  if (!apifyToken) {
    throw new Error('APIFY_TOKEN environment variable not set');
  }

  const product = getProductById(productId);
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const searchTerm = productIdToSearchTerm(productId);

  // SteamDT market search page
  const steamdtUrl = `https://steamdt.com/en/mkt?keyword=${encodeURIComponent(searchTerm)}`;
  
  try {
    // Start Apify actor run to scrape SteamDT
    const runResponse = await fetch(
      `https://api.apify.com/v2/acts/apify~web-scraper/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apifyToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          startUrls: [{ url: steamdtUrl }],
          waitFor: 3000,
          pageFunction: `
            async function pageFunction(context) {
              const { page } = context;
              
              // Wait for page to load
              await page.waitForTimeout(3000);
              
              // Extract prices from SteamDT page
              const items = await page.evaluate(() => {
                const results = [];
                
                // Try to find price elements on SteamDT market page
                // Look for price cells in tables or price spans
                const priceSelectors = [
                  '.price',
                  '[class*="price"]',
                  '[data-price]',
                  'td:has-text("$")',
                  '.text-color-primary',
                  '.el-table__body td'
                ];
                
                for (const selector of priceSelectors) {
                  const elements = document.querySelectorAll(selector);
                  elements.forEach(el => {
                    const text = el.textContent?.trim() || '';
                    // Extract price (format like "$123.45" or "123.45 USD")
                    const priceMatch = text.match(/\\$?([\\d,]+(?:\\.[\\d]+)?)/);
                    if (priceMatch) {
                      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
                      if (price > 0) {
                        // Try to find associated item name
                        const row = el.closest('tr') || el.parentElement;
                        const nameEl = row?.querySelector('a, .name, [class*="name"], td:first-child');
                        const name = nameEl?.textContent?.trim() || '';
                        
                        results.push({
                          name: name,
                          price: price,
                          priceText: text
                        });
                      }
                    }
                  });
                  
                  if (results.length > 0) break;
                }
                
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

    // Extract and process prices
    const prices = datasetItems
      .flatMap((item: any) => {
        const items = item.items || (Array.isArray(item) ? item : [item]);
        return items
          .map((i: any) => i.price)
          .filter((p: number) => p > 0 && !isNaN(p));
      })
      .filter((p: number) => p > 0 && !isNaN(p))
      .sort((a: number, b: number) => a - b);

    if (prices.length === 0) {
      throw new Error('No valid prices found in SteamDT response');
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
    throw new Error(`SteamDT scraping failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
