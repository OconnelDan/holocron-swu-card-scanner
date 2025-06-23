import { Router } from 'express';
import { HealthController } from '../controllers';

const router = Router();

/**
 * @route GET /health
 * @desc Health check básico
 * @access Public
 */
router.get('/health', HealthController.getHealth);

/**
 * @route GET /ready
 * @desc Readiness check para K8s/Docker
 * @access Public
 */
router.get('/ready', HealthController.getReady);

export { router as healthRoutes };
