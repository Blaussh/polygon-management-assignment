import { vi } from 'vitest';
import { apiService } from './api';
import { CreatePolygonRequest, Polygon } from '@/types';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = fetch as any;

// Mock config
vi.mock('@/env', () => ({
  config: {
    API_URL: 'http://localhost:3001',
    API_TIMEOUT: 15000,
  },
}));

describe('API Service (Simple)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPolygons', () => {
    it('should fetch polygons successfully', async () => {
      const mockPolygons: Polygon[] = [
        {
          id: 1,
          name: 'Triangle',
          points: [
            { x: 100, y: 100 },
            { x: 200, y: 100 },
            { x: 150, y: 50 },
          ],
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: mockPolygons,
        }),
      } as Response);

      const result = await apiService.getPolygons();

      expect(result).toEqual(mockPolygons);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/polygons',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: false,
          error: 'Database error',
        }),
      } as Response);

      await expect(apiService.getPolygons()).rejects.toThrow('Database error');
    });
  });

  describe('createPolygon', () => {
    it('should create polygon successfully', async () => {
      const createRequest: CreatePolygonRequest = {
        name: 'Square',
        points: [
          { x: 300, y: 300 },
          { x: 400, y: 300 },
          { x: 400, y: 400 },
          { x: 300, y: 400 },
        ],
      };

      const createdPolygon: Polygon = {
        id: 2,
        ...createRequest,
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: createdPolygon,
        }),
      } as Response);

      const result = await apiService.createPolygon(createRequest);

      expect(result).toEqual(createdPolygon);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/polygons',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createRequest),
        })
      );
    });
  });

  describe('deletePolygon', () => {
    it('should delete polygon successfully', async () => {
      const deletedPolygon: Polygon = {
        id: 1,
        name: 'Deleted',
        points: [
          { x: 100, y: 100 },
          { x: 200, y: 100 },
          { x: 150, y: 50 },
        ],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: deletedPolygon,
        }),
      } as Response);

      const result = await apiService.deletePolygon(1);

      expect(result).toEqual(deletedPolygon);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/polygons/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      const healthResponse = {
        status: 'healthy',
        timestamp: '2023-01-01T00:00:00.000Z',
        uptime: 12345,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: healthResponse }),
      } as Response);

      const result = await apiService.healthCheck();

      expect(result).toEqual(healthResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/health',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          signal: expect.any(AbortSignal),
        })
      );
    });
  });
});
