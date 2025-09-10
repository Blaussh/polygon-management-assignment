import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();

// GET /health - Health check
router.get('/', HealthController.healthCheck);

// GET /ping - Simple ping
router.get('/ping', HealthController.ping);

export { router as healthRoutes };
