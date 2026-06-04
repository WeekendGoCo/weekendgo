// src/routes/hotels.ts
import { Router, Request, Response } from 'express';
import { HotelSearchRequest, HotelSearchResponse, LocationSearchResponse } from '@types/api';
import { validateHotelSearch, validateLocationSearch } from '@middleware/validation';
import { catchAsync } from '@utils/errors';
import AggregatorService from '@services/aggregatorService';
import logger from '@utils/logger';

const router = Router();

/**
 * GET /api/locations/search?query=دبي
 * Search for locations
 */
router.get(
  '/locations/search',
  validateLocationSearch,
  catchAsync(async (req: Request, res: Response) => {
    const query = String(req.query.query || req.query.q || '').trim();

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query must be at least 2 characters',
      });
    }

    const { results, source } = AggregatorService.searchLocations(query);

    const response: LocationSearchResponse = {
      success: true,
      source,
      data: results,
    };

    return res.json(response);
  })
);

/**
 * POST /api/hotels/search
 * Search hotels across providers
 */
router.post(
  '/hotels/search',
  validateHotelSearch,
  catchAsync(async (req: Request, res: Response) => {
    const {
      destination,
      destId,
      checkIn,
      checkOut,
      guests = 2,
      children = [],
    } = req.body as HotelSearchRequest;

    // Set default dates if not provided
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 7);

    const cin = checkIn || today.toISOString().split('T')[0];
    const cout = checkOut || future.toISOString().split('T')[0];

    // Resolve destination ID
    let resolvedDestId = AggregatorService.resolveDestination(destination, destId);

    if (!resolvedDestId) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found. Try a different city name.',
      });
    }

    logger.info('Hotel search request', {
      destination,
      checkIn: cin,
      checkOut: cout,
      guests,
      children: children.length,
    });

    // Search hotels
    const { hotels, providersSummary } = await AggregatorService.searchHotels({
      destId: resolvedDestId,
      checkIn: cin,
      checkOut: cout,
      adults: guests,
      children,
    });

    const response: HotelSearchResponse = {
      success: true,
      count: hotels.length,
      providers: providersSummary,
      data: hotels,
    };

    return res.json(response);
  })
);

/**
 * GET /api/providers/status
 * Get provider status
 */
router.get(
  '/providers/status',
  catchAsync(async (req: Request, res: Response) => {
    const status = {
      hotelbeds: {
        available: !!process.env.HOTELBEDS_API_KEY,
        note: 'Sandbox (PRUEBAS)',
      },
      booking: {
        available: !!process.env.BOOKING_API_KEY,
        note: 'Pending approval',
      },
      webbed: {
        available: !!process.env.WEBBED_USERNAME,
        note: 'Pending approval',
      },
      hotelsnl: {
        available: !!process.env.HOTELSNL_API_KEY,
        note: 'Ready — needs API key',
      },
      ratehawk: {
        available: !!process.env.RATEHAWK_API_KEY,
        note: 'Pending approval',
      },
      tbo: {
        available: !!process.env.TBO_API_KEY,
        note: 'Pending approval',
      },
      serpapi: {
        available: !!process.env.SERPAPI_KEY,
        note: 'Active (250/month)',
      },
    };

    return res.json(status);
  })
);

export default router;