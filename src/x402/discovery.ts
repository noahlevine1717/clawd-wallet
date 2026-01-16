/**
 * x402 service discovery
 *
 * Supports both API-based registry discovery and local fallback.
 * Configure with X402_REGISTRY_URL environment variable.
 */

import type { X402Service } from '../types/index.js';

/**
 * Default registry API endpoint
 * Set X402_REGISTRY_URL environment variable to use a custom registry
 */
const DEFAULT_REGISTRY_URL = 'https://api.x402scan.com';
const REGISTRY_URL = process.env.X402_REGISTRY_URL || DEFAULT_REGISTRY_URL;

/**
 * Fallback list of known x402 services
 * Used when registry API is unavailable
 */
const FALLBACK_SERVICES: X402Service[] = [
  {
    name: 'Weather API',
    url: 'https://api.example.com/weather',
    description: 'Real-time weather data',
    pricing: {
      currency: 'USDC',
      amount: 0.01,
      per: 'request'
    },
    category: 'data'
  },
  {
    name: 'AI Image Generation',
    url: 'https://api.example.com/generate-image',
    description: 'Generate images from text',
    pricing: {
      currency: 'USDC',
      amount: 0.05,
      per: 'image'
    },
    category: 'ai'
  },
  {
    name: 'Code Analysis',
    url: 'https://api.example.com/analyze-code',
    description: 'Analyze code quality and security',
    pricing: {
      currency: 'USDC',
      amount: 0.02,
      per: 'analysis'
    },
    category: 'developer-tools'
  }
];

export class ServiceDiscovery {
  /**
   * Discover x402 services from registry API
   * Falls back to local services if API is unavailable
   */
  static async discoverServices(
    query?: string,
    category?: string
  ): Promise<X402Service[]> {
    try {
      // Try to fetch from registry API
      const services = await this.fetchFromRegistry(query, category);
      return services;
    } catch (error) {
      // Fall back to local services if API fails
      console.warn(`Registry API unavailable (${REGISTRY_URL}), using fallback services`);
      return this.filterLocalServices(query, category);
    }
  }

  /**
   * Fetch services from registry API
   */
  private static async fetchFromRegistry(
    query?: string,
    category?: string
  ): Promise<X402Service[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);

    const url = `${REGISTRY_URL}/services?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'clawd-wallet/0.1.0'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      throw new Error(`Registry API returned ${response.status}`);
    }

    const data = await response.json() as any;
    return (data.services || data) as X402Service[];
  }

  /**
   * Filter local fallback services
   */
  private static filterLocalServices(
    query?: string,
    category?: string
  ): X402Service[] {
    let services = [...FALLBACK_SERVICES];

    // Filter by category
    if (category) {
      services = services.filter(s => s.category === category);
    }

    // Filter by query
    if (query) {
      const lowerQuery = query.toLowerCase();
      services = services.filter(s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery)
      );
    }

    return services;
  }

  /**
   * Get all available categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${REGISTRY_URL}/categories`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'clawd-wallet/0.1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json() as any;
        return (data.categories || data) as string[];
      }
    } catch (error) {
      // Fall back to local categories
    }

    const categories = new Set(FALLBACK_SERVICES.map(s => s.category));
    return Array.from(categories).sort();
  }

  /**
   * Get service by URL
   */
  static async getServiceByUrl(url: string): Promise<X402Service | null> {
    try {
      const response = await fetch(`${REGISTRY_URL}/services?url=${encodeURIComponent(url)}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'clawd-wallet/0.1.0'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json() as any;
        return (data.service || data[0] || null) as X402Service | null;
      }
    } catch (error) {
      // Fall back to local lookup
    }

    return FALLBACK_SERVICES.find(s => s.url === url) || null;
  }

  /**
   * Get the configured registry URL
   */
  static getRegistryUrl(): string {
    return REGISTRY_URL;
  }

  /**
   * Check if using default registry
   */
  static isUsingDefaultRegistry(): boolean {
    return REGISTRY_URL === DEFAULT_REGISTRY_URL;
  }
}
