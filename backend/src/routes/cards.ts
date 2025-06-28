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
 * @query search - Búsqueda por nombre/traits
 */
router.get('/', CardsController.getCards);

/**
 * @route GET /api/cards/stats
 * @desc Obtiene estadísticas de la colección
 * @access Public
 */
router.get('/stats', CardsController.getCollectionStats);

/**
 * @route GET /api/cards/collection/stats
 * @desc Obtiene estadísticas de la colección (ruta alternativa)
 * @access Public
 */
router.get('/collection/stats', CardsController.getCollectionStats);

/**
 * @route GET /api/cards/collection/owned
 * @desc Obtiene solo las cartas que posee el usuario
 * @access Public
 * @query page - Página (default: 1)
 * @query limit - Elementos por página (default: 20, max: 100)
 * @query set - Filtrar por código de set
 * @query type - Filtrar por tipo de carta
 * @query rarity - Filtrar por rareza
 * @query search - Búsqueda por nombre/traits
 */
router.get('/collection/owned', CardsController.getOwnedCards);

/**
 * @route GET /api/cards/search
 * @desc Búsqueda de texto completo en cartas
 * @access Public
 * @query q - Texto a buscar
 */
router.get('/search', CardsController.searchCards);

/**
 * @route PUT /api/cards/:setCode/:cardNumber
 * @desc Actualiza las cantidades de una carta existente
 * @access Public
 * @param setCode - Código del set (5LOF, 1SOR, etc.)
 * @param cardNumber - Número de la carta (001, 002, etc.)
 * @body {object} - Cantidades de variantes a actualizar
 */
router.put('/:setCode/:cardNumber', CardsController.updateCardQuantities);

/**
 * @route GET /api/cards/:setCode/:cardNumber
 * @desc Obtiene una carta específica por set y número
 * @access Public
 * @param setCode - Código del set (1SOR, 2SHD, etc.)
 * @param cardNumber - Número de la carta (001, 002, etc.)
 */
router.get('/:setCode/:cardNumber', CardsController.getCardBySetAndNumber);

/**
 * @route GET /api/cards/:id
 * @desc Obtiene una carta específica por ID
 * @access Public
 * @param id - ID de la carta
 */
router.get('/:id', CardsController.getCardById);

export { router as cardsRoutes };
