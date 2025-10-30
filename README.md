# CS2 Skins MCP - Price Oracle for Nerve Markets

A Model Context Protocol (MCP) server that provides real-time CS2 (Counter-Strike 2) skin prices for Nerve prediction markets. This is a stateless HTTP service that fetches fresh prices on-demand.

## Overview

This MCP implements the **MCP Developer Guide** specification with two endpoints:
- `/list_products` - Browse available CS2 skins
- `/get_product_price` - Get current price for a specific skin

**Key Principle:** This MCP is completely stateless. It doesn't cache data, manage refresh schedules, or track users. Nerve handles all caching (every 2 hours).

## Features

- 50+ curated CS2 skins (knives, rifles, pistols)
- Real-time price fetching from CSGOFloat API
- Apify fallback for redundancy
- Median price calculation from multiple listings
- Full MCP v1.0 schema compliance
- Vercel Edge Functions for global CDN performance

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Vercel account (free tier works)
- CSGOFloat API key (get from [csgofloat.com/api](https://csgofloat.com/api))
- Apify token (optional, for fallback)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd oracles

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
# CSGOFLOAT_API_KEY=your_key_here
# APIFY_TOKEN=your_token_here
```

### Local Development

```bash
# Start Vercel dev server
npm run dev

# Test endpoints
curl "http://localhost:3000/list_products"
curl "http://localhost:3000/list_products?query=butterfly&category=Knives"
curl "http://localhost:3000/get_product_price?productId=butterfly-gamma-fn"
```

### Deployment

```bash
# Deploy to Vercel
npm run deploy

# Or use Vercel CLI
vercel deploy --prod

# Set environment variables in Vercel dashboard
# Or via CLI:
vercel env add CSGOFLOAT_API_KEY
vercel env add APIFY_TOKEN
```

Your MCP will be available at: `https://your-project.vercel.app`

## API Endpoints

### GET `/list_products`

Returns the product catalog with filtering and pagination.

**Query Parameters:**
- `query` (optional) - Search by name, productId, or tags
- `category` (optional) - Filter by category (Knives, Rifles, Pistols)
- `limit` (optional, default: 50) - Max results per page
- `offset` (optional, default: 0) - Pagination offset

**Example:**
```bash
curl "https://your-mcp.vercel.app/list_products?category=Knives&limit=10"
```

**Response:**
```json
{
  "products": [
    {
      "productId": "butterfly-gamma-fn",
      "name": "★ Butterfly Knife | Gamma Doppler",
      "category": "Knives",
      "tags": ["butterfly", "gamma", "doppler", "factory-new", "knife"],
      "variant": "Factory New"
    }
  ],
  "total": 50,
  "hasMore": true
}
```

### GET `/get_product_price`

Returns current price for a specific product.

**Query Parameters:**
- `productId` (required) - Product ID from list_products

**Example:**
```bash
curl "https://your-mcp.vercel.app/get_product_price?productId=butterfly-gamma-fn"
```

**Response:**
```json
{
  "productId": "butterfly-gamma-fn",
  "price": 1220.50,
  "unit": "USD",
  "timestamp": "2025-01-30T12:30:00.000Z",
  "schemaVersion": "1.0",
  "name": "★ Butterfly Knife | Gamma Doppler",
  "variant": "Factory New",
  "imageUrl": "https://...",
  "source": {
    "provider": "CSGOFloat",
    "marketplace": "CSGOFloat Market",
    "method": "api",
    "sampleSize": 12
  },
  "attributes": [
    {
      "trait_type": "Condition",
      "value": "Factory New",
      "display_type": "string"
    },
    {
      "trait_type": "Float",
      "value": 0.003,
      "display_type": "number"
    }
  ]
}
```

## Product Catalog

The MCP includes 50+ curated CS2 skins across three tiers:

**Tier 1: High-Value Knives (10 items)**
- Butterfly Knife | Gamma Doppler
- Karambit | Fade
- Talon Knife | Tiger Tooth
- And more...

**Tier 2: Popular Rifles (20 items)**
- AWP | Dragon Lore
- AK-47 | Fire Serpent
- M4A4 | Howl
- And more...

**Tier 3: Popular Pistols (20 items)**
- Glock-18 | Fade
- Desert Eagle | Blaze
- USP-S | Kill Confirmed
- And more...

See `lib/products.ts` for the complete catalog.

## Price Sources

### Primary: CSGOFloat API

- **Cost:** Free tier (100 requests/day) or $10/month (10K requests)
- **Method:** Direct API
- **Speed:** Fast (typically <500ms)
- **Reliability:** High

### Fallback: Apify

- **Cost:** Pay-as-you-go (~$5-10/month for 1000 calls)
- **Method:** Web scraping via actor
- **Speed:** Slower (1-5 seconds)
- **Reliability:** Depends on actor availability

The MCP tries CSGOFloat first, automatically falling back to Apify if CSGOFloat fails.

## Product ID Format

Product IDs are stable, URL-safe identifiers:
- Format: `{skin-name}-{wear}` (e.g., `butterfly-gamma-fn`)
- Lowercase, hyphens only
- Never change once assigned
- Wear suffixes: `-fn`, `-mw`, `-ft`, `-ww`, `-bs`

## Testing with Nerve

1. Deploy your MCP to production
2. Visit Nerve market creation
3. Select "Custom Oracle"
4. Paste your MCP URL: `https://your-mcp.vercel.app`
5. Nerve automatically validates your endpoints

## Validation

Nerve validates:
- ✅ `/list_products` returns products array with `productId` + `name`
- ✅ `/get_product_price` returns all required fields
- ✅ `timestamp` is valid ISO8601
- ✅ Response time < 10 seconds
- ✅ Image URLs accessible (if provided)

## Cost Estimate

**CSGOFloat API:**
- Free tier sufficient for testing (100 req/day)
- Paid: $10/month for production

**Vercel:**
- Free tier: 100K requests/month
- More than sufficient

**Total: $0-10/month**

## Project Structure

```
.
├── api/
│   ├── list_products.ts       # Product catalog endpoint
│   └── get_product_price.ts   # Price lookup endpoint
├── lib/
│   ├── csgofloat.ts          # CSGOFloat API client
│   ├── apify.ts              # Apify fallback client
│   ├── products.ts           # Product catalog
│   └── utils.ts              # Helper functions
├── types/
│   └── mcp.ts                # TypeScript type definitions
├── .env.example              # Environment variable template
├── package.json
├── tsconfig.json
└── vercel.json
```

## Environment Variables

Required:
- `CSGOFLOAT_API_KEY` - Your CSGOFloat API key
- `APIFY_TOKEN` - Your Apify token (for fallback)

Optional:
- `APIFY_ACTOR_ID` - Specific Apify actor to use (default: `buff163-market-scraper`)

## Error Handling

The MCP returns proper HTTP status codes:
- `400` - Missing required parameter (`productId`)
- `404` - Product not found
- `500` - API failure or internal error

All error responses include `schemaVersion: "1.0"` for compatibility.

## Maintenance

**Weekly:**
- Check API keys haven't expired
- Verify top products return prices
- Review error logs in Vercel dashboard

**Monthly:**
- Add new popular skins to catalog
- Remove discontinued items
- Update if API changes

## Troubleshooting

**"CSGOFloat API authentication failed"**
- Check your API key is set correctly
- Verify key hasn't expired

**"No listings found"**
- Product might be rare/discontinued
- Try checking CSGOFloat directly
- Consider adding similar product variants

**"Apify actor failed"**
- Verify `APIFY_TOKEN` is correct
- Check if actor ID exists
- Try different actor if available

## License

MIT

## Support

- **Questions:** See MCP Developer Guide
- **Issues:** Submit to repository
- **Nerve Integration:** Use Nerve validator in market creation

---

**Status:** Production Ready  
**Schema Version:** 1.0  
**Last Updated:** 2025-01-30
