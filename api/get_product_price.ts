import { getProductById } from '../lib/products';
import { fetchBuff163Price } from '../lib/buff163';
import { ProductPrice, ErrorResponse } from '../types/mcp';

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    const errorResponse: ErrorResponse = {
      error: 'productId required',
      schemaVersion: '1.0'
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  // Validate product exists in catalog
  const product = getProductById(productId);
  if (!product) {
    const errorResponse: ErrorResponse = {
      error: 'Product not found',
      productId,
      schemaVersion: '1.0'
    };
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  try {
    // Fetch real price from Buff163 via Apify scraping
    const priceData = await fetchBuff163Price(productId);

    // Build response with required fields
    const response: ProductPrice = {
      productId,
      price: priceData.price,
      unit: 'USD',
      timestamp: new Date().toISOString(),
      schemaVersion: '1.0',
      name: priceData.name || product.name,
      variant: priceData.wear || product.variant,
      imageUrl: priceData.image,
      source: {
        provider: 'Buff163',
        marketplace: 'Buff163',
        method: 'scrape',
        sampleSize: priceData.listingCount || 1
      },
      attributes: [
        {
          trait_type: 'Condition',
          value: priceData.wear || product.variant || 'Unknown',
          display_type: 'string'
        }
      ]
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    console.error(`Error fetching price for ${productId}:`, error);
    
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch price',
      productId,
      message: error instanceof Error ? error.message : String(error),
      schemaVersion: '1.0'
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

