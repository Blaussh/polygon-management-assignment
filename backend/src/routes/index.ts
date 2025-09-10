import { Router } from 'express';
import { polygonRoutes } from './polygonRoutes';
import { healthRoutes } from './healthRoutes';

const router = Router();

// API routes
router.use('/polygons', polygonRoutes);

// Health routes (no /api prefix)
router.use('/health', healthRoutes);

export { router as apiRoutes };
