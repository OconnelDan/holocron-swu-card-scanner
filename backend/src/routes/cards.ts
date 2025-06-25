import { Router } from 'express';
import { CardsController } from '../controllers/CardsController';

const router = Router();

/**
 * @route GET /api/cards
 * @desc Obtiene todas las cartas con paginación y filtros
 * @access Public
 * @query page - Página (default: 1)
 * @query limit - Elementos por página (default: 20, max: 100)
 * @query set - Filtrar por código de set
 * @query type - Filtrar por tipo de carta
 * @query rarity - Filtrar por rareza
 * @query search - Búsqueda por nombre/subtítulo
 */
router.get('/', CardsController.getCards);

/**
 * @route GET /api/cards/search
 * @desc Búsqueda de texto completo en cartas
 * @access Public
 * @query q - Texto a buscar
 */
router.get('/search', CardsController.searchCards);

/**
 * @route GET /api/cards/:id
 * @desc Obtiene una carta específica por ID
 * @access Public
 * @param id - ID de la carta
 */
router.get('/:id', CardsController.getCardById);

export { router as cardsRoutes };
