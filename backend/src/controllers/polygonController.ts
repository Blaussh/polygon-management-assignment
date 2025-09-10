import { Request, Response } from 'express';
import { PolygonService } from '../services/polygonService';
import {
  CreatePolygonRequest,
  CreatePolygonResponse,
  GetPolygonsResponse,
  DeletePolygonResponse,
} from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export class PolygonController {
  /**
   * Create a new polygon
   * POST /api/polygons
   */
  static createPolygon = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const polygonData: CreatePolygonRequest = req.body;

      const polygon = await PolygonService.createPolygon(polygonData);

      const response: CreatePolygonResponse = {
        success: true,
        data: polygon,
        message: 'Polygon created successfully',
      };

      res.status(201).json(response);
    }
  );

  /**
   * Get all polygons
   * GET /api/polygons
   */
  static getAllPolygons = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const polygons = await PolygonService.getAllPolygons();

      const response: GetPolygonsResponse = {
        success: true,
        data: polygons,
        message: `Retrieved ${polygons.length} polygons`,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get polygon by ID
   * GET /api/polygons/:id
   */
  static getPolygonById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);

      const polygon = await PolygonService.getPolygonById(id);

      const response: CreatePolygonResponse = {
        success: true,
        data: polygon,
        message: 'Polygon retrieved successfully',
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete polygon by ID
   * DELETE /api/polygons/:id
   */
  static deletePolygon = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);

      const result = await PolygonService.deletePolygon(id);

      const response: DeletePolygonResponse = {
        success: true,
        data: result,
        message: 'Polygon deleted successfully',
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get polygon statistics
   * GET /api/polygons/stats
   */
  static getPolygonStats = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const stats = await PolygonService.getPolygonStats();

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully',
      });
    }
  );
}
