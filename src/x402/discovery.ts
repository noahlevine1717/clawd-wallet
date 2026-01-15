/**
 * x402 service discovery
 */

import type { X402Service } from '../types/index.js';

/**
 * Static list of known x402 services
 * In production, this would query x402scan or a registry
 */
const KNOWN_SERVICES: X402Service[] = [
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
   * Discover x402 services
   */
  static async discoverServices(
    query?: string,
    category?: string
  ): Promise<X402Service[]> {
    let services = [...KNOWN_SERVICES];

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
  static getCategories(): string[] {
    const categories = new Set(KNOWN_SERVICES.map(s => s.category));
    return Array.from(categories).sort();
  }

  /**
   * Get service by URL
   */
  static async getServiceByUrl(url: string): Promise<X402Service | null> {
    return KNOWN_SERVICES.find(s => s.url === url) || null;
  }
}
