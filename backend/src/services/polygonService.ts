import { prisma } from '../utils/database';
import { logger } from '../utils/logger';
import { PolygonData, Point, AppError, CreatePolygonRequest } from '../types';
import { validatePoints, isPolygonSelfIntersecting } from '../utils/validation';

export class PolygonService {
  /**
   * Create a new polygon
   */
  static async createPolygon(data: CreatePolygonRequest): Promise<PolygonData> {
    const { name, points } = data;

    // Validate points
    const pointsValidationError = validatePoints(points);
    if (pointsValidationError) {
      throw new AppError(pointsValidationError, 400);
    }

    // Check for self-intersecting polygon
    if (isPolygonSelfIntersecting(points)) {
      logger.warn(`Attempted to create self-intersecting polygon: ${name}`);
      throw new AppError('Polygon cannot be self-intersecting', 400);
    }

    // Check if name already exists
    const existingPolygon = await prisma.polygon.findUnique({
      where: { name },
    });

    if (existingPolygon) {
      throw new AppError(`Polygon with name '${name}' already exists`, 409);
    }

    try {
      // Create polygon in database
      const polygon = await prisma.polygon.create({
        data: {
          name,
          points: JSON.stringify(points),
        },
      });

      logger.info(`Created polygon: ${name} with ${points.length} points`);

      return this.transformPolygonEntity(polygon);
    } catch (error) {
      logger.error('Failed to create polygon:', error);
      throw new AppError('Failed to create polygon', 500);
    }
  }

  /**
   * Get all polygons
   */
  static async getAllPolygons(): Promise<PolygonData[]> {
    try {
      const polygons = await prisma.polygon.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      logger.info(`Retrieved ${polygons.length} polygons`);

      return polygons.map((polygon: any) =>
        this.transformPolygonEntity(polygon)
      );
    } catch (error) {
      logger.error('Failed to retrieve polygons:', error);
      throw new AppError('Failed to retrieve polygons', 500);
    }
  }

  /**
   * Get polygon by ID
   */
  static async getPolygonById(id: number): Promise<PolygonData> {
    try {
      const polygon = await prisma.polygon.findUnique({
        where: { id },
      });

      if (!polygon) {
        throw new AppError('Polygon not found', 404);
      }

      return this.transformPolygonEntity(polygon);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to retrieve polygon with ID ${id}:`, error);
      throw new AppError('Failed to retrieve polygon', 500);
    }
  }

  /**
   * Delete polygon by ID
   */
  static async deletePolygon(id: number): Promise<{ id: number }> {
    try {
      // Check if polygon exists
      const existingPolygon = await prisma.polygon.findUnique({
        where: { id },
      });

      if (!existingPolygon) {
        throw new AppError('Polygon not found', 404);
      }

      // Delete polygon
      await prisma.polygon.delete({
        where: { id },
      });

      logger.info(`Deleted polygon with ID: ${id}`);

      return { id };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete polygon with ID ${id}:`, error);
      throw new AppError('Failed to delete polygon', 500);
    }
  }

  /**
   * Get polygon statistics
   */
  static async getPolygonStats(): Promise<{
    totalPolygons: number;
    averagePoints: number;
    oldestPolygon: Date | null;
    newestPolygon: Date | null;
  }> {
    try {
      const [count, polygons] = await Promise.all([
        prisma.polygon.count(),
        prisma.polygon.findMany({
          select: {
            points: true,
            createdAt: true,
          },
        }),
      ]);

      if (count === 0) {
        return {
          totalPolygons: 0,
          averagePoints: 0,
          oldestPolygon: null,
          newestPolygon: null,
        };
      }

      const totalPoints = polygons.reduce((sum: number, polygon: any) => {
        try {
          const points = JSON.parse(polygon.points) as Point[];
          return sum + points.length;
        } catch {
          return sum;
        }
      }, 0);

      const dates = polygons.map((p: any) => p.createdAt);
      const oldestPolygon = new Date(
        Math.min(...dates.map((d: Date) => d.getTime()))
      );
      const newestPolygon = new Date(
        Math.max(...dates.map((d: Date) => d.getTime()))
      );

      return {
        totalPolygons: count,
        averagePoints: Math.round((totalPoints / count) * 100) / 100,
        oldestPolygon,
        newestPolygon,
      };
    } catch (error) {
      logger.error('Failed to retrieve polygon statistics:', error);
      throw new AppError('Failed to retrieve statistics', 500);
    }
  }

  /**
   * Transform database entity to API response format
   */
  private static transformPolygonEntity(entity: {
    id: number;
    name: string;
    points: string;
    createdAt: Date;
    updatedAt: Date;
  }): PolygonData {
    let points: Point[];

    try {
      points = JSON.parse(entity.points) as Point[];
    } catch (error) {
      logger.error(`Failed to parse points for polygon ${entity.id}:`, error);
      points = [];
    }

    return {
      id: entity.id,
      name: entity.name,
      points,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
