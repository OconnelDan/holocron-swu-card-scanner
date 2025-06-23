import { Router } from 'express';
import { ScansController } from '../controllers';

const router = Router();

/**
 * @route POST /api/scans
 * @desc Registra un nuevo escaneo de carta
 * @access Public
 * @body ScanRequestBody
 */
router.post('/', ScansController.createScan);

/**
 * @route GET /api/scans
 * @desc Obtiene historial de escaneos con paginación
 * @access Public
 * @query page - Página (default: 1)
 * @query limit - Elementos por página (default: 20, max: 100)
 */
router.get('/', ScansController.getScans);

/**
 * @route GET /api/scans/stats
 * @desc Obtiene estadísticas de escaneos
 * @access Public
 */
router.get('/stats', ScansController.getStats);

export { router as scansRoutes };
