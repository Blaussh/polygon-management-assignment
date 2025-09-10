import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const apiDelay = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const delayMs = parseInt(process.env.API_DELAY_MS || '5000', 10);

  // Skip delay for health check endpoint
  if (req.path === '/health') {
    next();
    return;
  }

  // Skip delay in test environment
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  logger.debug(`Adding ${delayMs}ms delay to ${req.method} ${req.path}`);

  setTimeout(() => {
    next();
  }, delayMs);
};
