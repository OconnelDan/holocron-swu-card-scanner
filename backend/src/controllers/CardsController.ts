import { Request, Response } from 'express';
import { Card } from '../models';
import { logger } from '../utils';

/**
 * Controller para operaciones con cartas
 */
export class CardsController {  /**
   * Obtiene todas las cartas con paginación
   */
  static async getCards(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
      const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10) || 20, 100);
      const skip = (page - 1) * limit;

      // Filtros opcionales
      const filters: Record<string, unknown> = {};

      if (req.query['set']) {
        filters['setCode'] = req.query['set'];
      }

      if (req.query['type']) {
        filters['type'] = req.query['type'];
      }

      if (req.query['rarity']) {
        filters['rarity'] = req.query['rarity'];
      }

      if (req.query['search']) {
        filters['$or'] = [
          { name: { $regex: req.query['search'], $options: 'i' } },
          { subtitle: { $regex: req.query['search'], $options: 'i' } },
        ];
      }

      const [cards, total] = await Promise.all([
        Card.find(filters)
          .select('-__v')
          .sort({ setCode: 1, cardNumber: 1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Card.countDocuments(filters),
      ]);

      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        data: cards,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });

    } catch (error) {
      logger.error('Error obteniendo cartas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las cartas',
      });
    }
  }

  /**
   * Obtiene una carta específica por ID
   */
  static async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const card = await Card.findById(id).select('-__v').lean();

      if (!card) {
        res.status(404).json({
          error: 'Carta no encontrada',
          message: `No existe carta con ID: ${id}`,
        });
        return;
      }

      res.status(200).json({ data: card });

    } catch (error) {
      logger.error('Error obteniendo carta por ID:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la carta',
      });
    }
  }
  /**
   * Busca cartas por texto
   */
  static async searchCards(req: Request, res: Response): Promise<void> {
    try {
      const q = req.query['q'];

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          error: 'Parámetro de búsqueda requerido',
          message: 'Debe proporcionar el parámetro "q" con el texto a buscar',
        });
        return;
      }

      const cards = await Card.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { subtitle: { $regex: q, $options: 'i' } },
          { text: { $regex: q, $options: 'i' } },
          { traits: { $in: [new RegExp(q, 'i')] } },
          { keywords: { $in: [new RegExp(q, 'i')] } },
        ],
      })
        .select('-__v')
        .limit(50)
        .lean();

      res.status(200).json({
        query: q,
        total: cards.length,
        results: cards,
      });

    } catch (error) {
      logger.error('Error buscando cartas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda',
      });
    }
  }
}
