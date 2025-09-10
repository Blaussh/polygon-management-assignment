import { Router } from 'express';
import { PolygonController } from '../controllers/polygonController';
import { validateBody, validateParams } from '../middleware/validation';
import { createPolygonSchema, polygonIdSchema } from '../utils/validation';

const router = Router();

// GET /api/polygons/stats - Must be before /:id route
router.get('/stats', PolygonController.getPolygonStats);

// GET /api/polygons - Get all polygons
router.get('/', PolygonController.getAllPolygons);

// POST /api/polygons - Create new polygon
router.post(
  '/',
  validateBody(createPolygonSchema),
  PolygonController.createPolygon
);

// GET /api/polygons/:id - Get polygon by ID
router.get(
  '/:id',
  validateParams(polygonIdSchema),
  PolygonController.getPolygonById
);

// DELETE /api/polygons/:id - Delete polygon by ID
router.delete(
  '/:id',
  validateParams(polygonIdSchema),
  PolygonController.deletePolygon
);

export { router as polygonRoutes };
