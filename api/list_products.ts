import { PRODUCTS } from '../lib/products';
import { ListProductsResponse, Product } from '../types/mcp';

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

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query')?.toLowerCase() || '';
    const category = searchParams.get('category') || '';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let filtered: Product[] = [...PRODUCTS];

    // Filter by search query
    if (query) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.productId.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category) {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }

    const total = filtered.length;
    
    // Paginate
    const paginated = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    // Format response with optional currentPrice
    const products: Product[] = paginated.map(p => ({
      ...p,
      // Remove currentPrice as it should be fetched fresh, not cached
    }));

    const response: ListProductsResponse = {
      products,
      total,
      hasMore
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
    console.error('Error in list_products:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      }),
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

