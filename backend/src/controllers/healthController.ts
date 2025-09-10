import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../utils/database';
import { asyncHandler } from '../middleware/errorHandler';

export class HealthController {
  /**
   * Health check endpoint
   * GET /health
   */
  static healthCheck = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const isDatabaseHealthy = await checkDatabaseConnection();

      const health = {
        status: isDatabaseHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        database: isDatabaseHealthy ? 'connected' : 'disconnected',
      };

      const statusCode = isDatabaseHealthy ? 200 : 503;

      res.status(statusCode).json({
        success: isDatabaseHealthy,
        data: health,
      });
    }
  );

  /**
   * Simple ping endpoint
   * GET /ping
   */
  static ping = (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'pong',
      timestamp: new Date().toISOString(),
    });
  };
}
