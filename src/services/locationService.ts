// src/services/locationService.ts
import { LocationResolution } from '@types/providers';
import logger from '@utils/logger';

/**
 * City Mapping Data Structure
 */
const cityMappings: Array<{
  nameAr: string;
  nameEn: string;
  country: string;
  id: string;
  providers: {
    booking?: string;
    hotelbeds?: string;
    travelport?: string;
    webbed?: string;
    hotelsnl?: string;
  };
}> = [
  {
    nameAr: 'دبي',
    nameEn: 'Dubai',
    country: 'AE',
    id: 'dubai_ae',
    providers: {
      booking: '-2140479',
      hotelbeds: '2520',
      travelport: 'DXB',
      webbed: 'DXB',
      hotelsnl: 'dubai',
    },
  },
  {
    nameAr: 'الرياض',
    nameEn: 'Riyadh',
    country: 'SA',
    id: 'riyadh_sa',
    providers: {
      booking: '-2182136',
      hotelbeds: '2520',
      travelport: 'RUH',
      webbed: 'RUH',
      hotelsnl: 'riyadh',
    },
  },
  {
    nameAr: 'مكة المكرمة',
    nameEn: 'Makkah',
    country: 'SA',
    id: 'makkah_sa',
    providers: {
      booking: '-2182136',
      hotelbeds: '2520',
      travelport: 'MCC',
      webbed: 'MCC',
      hotelsnl: 'makkah',
    },
  },
  {
    nameAr: 'جدة',
    nameEn: 'Jeddah',
    country: 'SA',
    id: 'jeddah_sa',
    providers: {
      booking: '-2182136',
      hotelbeds: '2520',
      travelport: 'JED',
      webbed: 'JED',
      hotelsnl: 'jeddah',
    },
  },
  {
    nameAr: 'أبو ظبي',
    nameEn: 'Abu Dhabi',
    country: 'AE',
    id: 'abudhabi_ae',
    providers: {
      booking: '-2182383',
      hotelbeds: '2520',
      travelport: 'AUH',
      webbed: 'AUH',
      hotelsnl: 'abu dhabi',
    },
  },
];

/**
 * Location Service
 */
export class LocationService {
  /**
   * Search for locations
   */
  static searchLocations(query: string): Array<{
    id: string;
    name: string;
    nameAr: string;
    nameEn: string;
    country: string;
    type: string;
  }> {
    const q = query.toLowerCase().trim();

    if (!q || q.length < 2) {
      return [];
    }

    const results = cityMappings
      .filter((city) => 
        city.nameAr.includes(q) || 
        city.nameEn.toLowerCase().includes(q)
      )
      .map((city) => ({
        id: city.id,
        name: city.nameAr,
        nameAr: city.nameAr,
        nameEn: city.nameEn,
        country: city.country,
        type: 'city',
      }));

    logger.debug(`Location search: "${query}" returned ${results.length} results`);

    return results;
  }

  /**
   * Resolve location to provider IDs
   */
  static resolveLocationToProviders(query: string): LocationResolution | null {
    const q = query.toLowerCase().trim();

    const city = cityMappings.find(
      (c) => c.nameAr.toLowerCase() === q || c.nameEn.toLowerCase() === q
    );

    if (!city) {
      logger.warn(`Location resolution failed for: "${query}"`);
      return null;
    }

    const resolution: LocationResolution = {
      destination: query,
      providers: city.providers,
      confidence: 1.0,
    };

    logger.debug(`Location resolved: ${query} -> ${city.id}`, { providers: city.providers });

    return resolution;
  }

  /**
   * Get provider ID for a location
   */
  static getProviderLocationId(
    destination: string,
    provider: string
  ): string | null {
    const resolution = this.resolveLocationToProviders(destination);

    if (!resolution) {
      return null;
    }

    const id = resolution.providers[provider as keyof typeof resolution.providers];
    return id ? String(id) : null;
  }
}

export default LocationService;