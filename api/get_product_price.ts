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
    // Generate placeholder price data for demo purposes
    // TODO: Integrate with a price source that works from Vercel (CSFloat blocks, Apify needs custom actor)
    
    // Use productId to generate a consistent price for demo
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const basePrice = 100 + (hash % 5000); // Range: $100-$5100
    const priceVariance = 0.85 + (hash % 30) / 100; // 85%-115% variance
    
    const price = Math.round(basePrice * priceVariance * 100) / 100;

    // Build response with required fields
    const response: ProductPrice = {
      productId,
      price,
      unit: 'USD',
      timestamp: new Date().toISOString(),
      schemaVersion: '1.0',
      name: product.name,
      variant: product.variant,
      source: {
        provider: 'Demo',
        method: 'demo',
        sampleSize: 1
      },
      attributes: [
        {
          trait_type: 'Condition',
          value: product.variant || 'Unknown',
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

