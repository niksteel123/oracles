/**
 * MCP Schema v1.0 Type Definitions
 * Based on Model Context Protocol standard for Nerve markets
 */

export interface Attribute {
  trait_type: string;
  value: string | number;
  display_type?: "string" | "number" | "boost_number" | "boost_percentage" | "date";
}

export interface SourceInfo {
  provider: string;
  marketplace?: string;
  method: "api" | "scrape" | "manual";
  sampleSize?: number;
  url?: string;
}

export interface Product {
  productId: string;
  name: string;
  imageUrl?: string;
  currentPrice?: number;
  unit?: string;
  category?: string;
  tags?: string[];
  variant?: string;
}

export interface ProductPrice {
  // Required fields
  productId: string;
  price: number;
  unit: string;
  timestamp: string; // ISO8601 format
  schemaVersion: "1.0";

  // Optional fields
  name?: string;
  variant?: string;
  imageUrl?: string;
  metadataUri?: string;
  source?: SourceInfo;
  attributes?: Attribute[];
}

export interface ListProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface ErrorResponse {
  error: string;
  productId?: string;
  message?: string;
  schemaVersion?: "1.0";
}

