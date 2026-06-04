// src/services/aggregatorService.ts
import { HotelSearchRequest } from '@types/api';
import { Hotel as ApiHotel } from '@types/api';
import { Hotel as AggregatedHotel } from '@types/providers';
import logger from '@utils/logger';
import LocationService from './locationService';

/**
 * Hotel Aggregator Service
 */
export class AggregatorService {
  /**
   * Search locations
   */
  static searchLocations(query: string) {
    try {
      const results = LocationService.searchLocations(query);
      return {
        results,
        source: 'internal_city_mapping',
      };
    } catch (error) {
      logger.error('Location search failed', error);
      return {
        results: [],
        source: 'error',
      };
    }
  }

  /**
   * Resolve destination to ID
   */
  static resolveDestination(destination?: string, destId?: string): string | null {
    // If destId is provided, use it
    if (destId) {
      return destId;
    }

    // Try to resolve from destination name
    if (destination) {
      const resolution = LocationService.resolveLocationToProviders(destination);
      if (resolution) {
        return resolution.providers.hotelbeds as string;
      }
    }

    return null;
  }

  /**
   * Search hotels across providers
   */
  static async searchHotels(params: {
    destId: string;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number[];
  }): Promise<{
    hotels: ApiHotel[];
    providersSummary: string[];
  }> {
    logger.info('Aggregating hotel search', {
      destId: params.destId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      adults: params.adults,
    });

    // TODO: Implement actual provider calls
    // For now, return empty results as providers are not yet configured
    const hotels: ApiHotel[] = [];
    const providersSummary: string[] = [];

    logger.info(`Aggregation complete: ${hotels.length} hotels from ${providersSummary.length} providers`);

    return {
      hotels,
      providersSummary,
    };
  }

  /**
   * Merge hotel results from multiple providers
   */
  static mergeResults(
    results: Array<{
      provider: string;
      hotels: ApiHotel[];
    }>
  ): AggregatedHotel[] {
    const hotelMap = new Map<string, AggregatedHotel>();

    for (const result of results) {
      for (const hotel of result.hotels) {
        const key = this.normalizeHotelName(hotel.name);

        if (!hotelMap.has(key)) {
          hotelMap.set(key, {
            id: hotel.id,
            giataId: hotel.id,
            name: hotel.name,
            price: hotel.price,
            currency: hotel.currency,
            providers: {},
            cheapestProvider: result.provider,
            bestPrice: hotel.price,
          });
        }

        const existing = hotelMap.get(key)!;
        existing.providers[result.provider] = {
          price: hotel.price,
          link: hotel.link,
        };

        // Update cheapest provider
        if (hotel.price < existing.bestPrice) {
          existing.bestPrice = hotel.price;
          existing.cheapestProvider = result.provider;
        }
      }
    }

    return Array.from(hotelMap.values()).sort((a, b) => a.bestPrice - b.bestPrice);
  }

  /**
   * Normalize hotel name for deduplication
   */
  private static normalizeHotelName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

export default AggregatorService;