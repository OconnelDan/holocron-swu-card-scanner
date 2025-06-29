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
      const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10) || 20, 2000);
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
          { traits: { $regex: req.query['search'], $options: 'i' } },
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
          { traits: { $regex: q, $options: 'i' } },
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

  /**
   * Obtiene estadísticas de la colección
   */
  static async getCollectionStats(_req: Request, res: Response): Promise<void> {
    try {
      const totalCards = await Card.countDocuments({});
      const ownedCards = await Card.countDocuments({ copies: { $gt: 0 } });
      const totalPhysicalCards = await Card.aggregate([
        { $group: { _id: null, total: { $sum: '$copies' } } }
      ]);

      // Obtener todos los sets existentes para incluir TODOS los sets, incluso aquellos con 0 cartas coleccionadas
      const allSets = await Card.distinct('setCode');
      
      // Estadísticas por set (incluyendo sets con 0 cartas coleccionadas)
      const statsBySet = await Promise.all(
        allSets.map(async (setCode) => {
          const totalCards = await Card.countDocuments({ setCode });
          const ownedCards = await Card.countDocuments({ setCode, copies: { $gt: 0 } });
          const totalPhysicalCards = await Card.aggregate([
            { $match: { setCode } },
            { $group: { _id: null, total: { $sum: '$copies' } } }
          ]);

          // Calcular porcentaje de completitud correctamente:
          // 100% si se posee al menos una copia de cada carta del set
          const completionPercentage = totalCards > 0 ? ((ownedCards / totalCards) * 100).toFixed(1) : '0.0';

          return {
            setCode,
            totalCards,
            ownedCards,
            totalPhysicalCards: totalPhysicalCards[0]?.total || 0,
            completionPercentage
          };
        })
      );

      // Ordenar por setCode para mantener consistencia
      statsBySet.sort((a, b) => a.setCode.localeCompare(b.setCode));

      // Estadísticas por rareza
      const statsByRarity = await Card.aggregate([
        {
          $group: {
            _id: '$rarity',
            totalCards: { $sum: 1 },
            ownedCards: { $sum: { $cond: [{ $gt: ['$copies', 0] }, 1, 0] } },
            totalPhysicalCards: { $sum: '$copies' }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      res.status(200).json({
        data: {
          overview: {
            totalCards,
            ownedCards,
            totalPhysicalCards: totalPhysicalCards[0]?.total || 0,
            completionPercentage: totalCards > 0 ? ((ownedCards / totalCards) * 100).toFixed(1) : '0.0'
          },
          bySet: statsBySet,
          byRarity: statsByRarity.map(stat => ({
            rarity: stat._id,
            totalCards: stat.totalCards,
            ownedCards: stat.ownedCards,
            totalPhysicalCards: stat.totalPhysicalCards,
            completionPercentage: stat.totalCards > 0 ? ((stat.ownedCards / stat.totalCards) * 100).toFixed(1) : '0.0'
          }))
        }
      });

    } catch (error) {
      logger.error('Error obteniendo estadísticas de colección:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las estadísticas',
      });
    }
  }

  /**
   * Obtiene cartas de la colección del usuario (solo las que posee)
   */
  static async getOwnedCards(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
      const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10) || 20, 2000);
      const skip = (page - 1) * limit;

      // Filtros opcionales
      const filters: Record<string, unknown> = { copies: { $gt: 0 } };

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
        filters['$and'] = [
          { copies: { $gt: 0 } },
          {
            $or: [
              { name: { $regex: req.query['search'], $options: 'i' } },
              { traits: { $regex: req.query['search'], $options: 'i' } },
            ]
          }
        ];
        delete filters['copies'];
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
      logger.error('Error obteniendo cartas de la colección:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las cartas de la colección',
      });
    }
  }

  /**
   * Obtiene una carta por setCode y cardNumber (formato alternativo al ID)
   */
  static async getCardBySetAndNumber(req: Request, res: Response): Promise<void> {
    try {
      const { setCode, cardNumber } = req.params;

      if (!setCode || !cardNumber) {
        res.status(400).json({
          error: 'Parámetros requeridos',
          message: 'Debe proporcionar setCode y cardNumber',
        });
        return;
      }

      const card = await Card.findOne({
        setCode: setCode.toUpperCase(),
        cardNumber
      }).select('-__v').lean();

      if (!card) {
        res.status(404).json({
          error: 'Carta no encontrada',
          message: `No existe carta ${setCode.toUpperCase()}-${cardNumber}`,
        });
        return;
      }

      res.status(200).json({ data: card });

    } catch (error) {
      logger.error('Error obteniendo carta por set y número:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la carta',
      });
    }
  }

  /**
   * Actualiza las cantidades de una carta existente
   */
  static async updateCardQuantities(req: Request, res: Response): Promise<void> {
    try {
      const { setCode, cardNumber } = req.params;
      const updateData = req.body;

      // Validar que setCode y cardNumber estén presentes
      if (!setCode || !cardNumber) {
        res.status(400).json({
          error: 'Parámetros requeridos faltantes',
          message: 'setCode y cardNumber son requeridos',
        });
        return;
      }

      // Buscar la carta existente
      const existingCard = await Card.findOne({
        setCode: setCode.toUpperCase(),
        cardNumber: cardNumber.padStart(3, '0'),
      });

      if (!existingCard) {
        res.status(404).json({
          error: 'Carta no encontrada',
          message: `No se encontró la carta ${setCode.toUpperCase()}-${cardNumber.padStart(3, '0')}`,
        });
        return;
      }

      // Validar que solo se envíen campos de variantes válidos
      const validVariants = [
        'normal', 'foil', 'hyperspace', 'foil_hyperspace', 'showcase',
        'organized_play', 'event_exclusive', 'prerelease_promo',
        'organized_play_foil', 'standard_prestige', 'foil_prestige', 'serialized_prestige'
      ];

      const updateFields: any = {
        lastUpdated: new Date(),
      };

      // Actualizar solo las variantes que se enviaron
      let totalCopies = 0;
      for (const [key, value] of Object.entries(updateData)) {
        if (validVariants.includes(key)) {
          const quantity = parseInt(value as string, 10);
          if (isNaN(quantity) || quantity < 0) {
            res.status(400).json({
              error: 'Cantidad inválida',
              message: `La cantidad para ${key} debe ser un número entero positivo`,
            });
            return;
          }
          updateFields[`variants.${key}`] = quantity;
        }
      }

      // Recalcular el total de copias basado en todas las variantes
      const updatedCard = await Card.findOneAndUpdate(
        { setCode: setCode.toUpperCase(), cardNumber: cardNumber.padStart(3, '0') },
        { $set: updateFields },
        { new: true }
      );

      if (!updatedCard) {
        res.status(500).json({
          error: 'Error actualizando carta',
          message: 'No se pudo actualizar la carta',
        });
        return;
      }

      // Calcular el total de copias sumando todas las variantes
      totalCopies = Object.values(updatedCard.variants).reduce((sum: number, qty: any) => sum + (qty || 0), 0);

      // Actualizar el campo copies con el total
      await Card.findOneAndUpdate(
        { _id: updatedCard._id },
        { $set: { copies: totalCopies } }
      );

      // Obtener la carta actualizada con el nuevo total
      const finalCard = await Card.findById(updatedCard._id);

      logger.info(`Carta actualizada: ${finalCard?.setCode}-${finalCard?.cardNumber} - Total: ${totalCopies} copias`);

      res.status(200).json({
        message: 'Carta actualizada exitosamente',
        data: finalCard,
      });

    } catch (error) {
      logger.error('Error actualizando cantidades de carta:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar la carta',
      });
    }
  }
}
