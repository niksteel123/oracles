import { fetchCSGOFloatPrice } from '../lib/csgofloat';
import { fetchApifyPrice } from '../lib/apify';
import { getProductById } from '../lib/products';
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
    // Try CSGOFloat first, fall back to Apify
    let priceData;
    let sourceMethod: 'api' | 'scrape' = 'api';
    let provider = 'CSGOFloat';

    try {
      priceData = await fetchCSGOFloatPrice(productId);
      provider = 'CSGOFloat';
      sourceMethod = 'api';
    } catch (csgoError) {
      // Fall back to Apify
      console.warn(`CSGOFloat failed for ${productId}, trying Apify:`, csgoError);
      try {
        priceData = await fetchApifyPrice(productId);
        provider = 'Apify';
        sourceMethod = 'scrape';
      } catch (apifyError) {
        // Both failed
        throw new Error(
          `Both price sources failed. CSGOFloat: ${csgoError instanceof Error ? csgoError.message : String(csgoError)}. Apify: ${apifyError instanceof Error ? apifyError.message : String(apifyError)}`
        );
      }
    }

    // Validate price
    if (!priceData.price || priceData.price <= 0) {
      throw new Error('Invalid price returned from source');
    }

    // Build response with required fields
    const response: ProductPrice = {
      productId,
      price: priceData.price,
      unit: 'USD',
      timestamp: new Date().toISOString(),
      schemaVersion: '1.0',
      name: priceData.name || product.name,
      variant: priceData.wear || product.variant,
      imageUrl: priceData.image || product.imageUrl,
      source: {
        provider,
        marketplace: provider === 'CSGOFloat' ? 'CSGOFloat Market' : 'Buff163 (via Apify)',
        method: sourceMethod,
        sampleSize: priceData.listingCount
      }
    };

    // Add attributes if available
    if (priceData.float !== undefined || priceData.pattern !== undefined) {
      response.attributes = [];
      
      if (priceData.wear) {
        response.attributes.push({
          trait_type: 'Condition',
          value: priceData.wear,
          display_type: 'string'
        });
      }

      if (priceData.float !== undefined) {
        response.attributes.push({
          trait_type: 'Float',
          value: priceData.float,
          display_type: 'number'
        });
      }

      if (priceData.pattern !== undefined) {
        response.attributes.push({
          trait_type: 'Pattern',
          value: priceData.pattern,
          display_type: 'number'
        });
      }
    }

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

