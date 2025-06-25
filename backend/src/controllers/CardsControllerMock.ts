import { Request, Response } from 'express';
import { logger } from '../utils';

/**
 * Datos mock de cartas Star Wars Unlimited para desarrollo
 */
const mockCards = [
  {
    id: '1',
    name: 'Luke Skywalker',
    set: 'SOR',
    number: '001',
    type: 'Unit',
    rarity: 'Legendary',
    cost: 7,
    power: 7,
    hp: 6,
    aspects: ['Heroism'],
    traits: ['Force', 'Jedi', 'Rebel'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Luke+Skywalker'
  },
  {
    id: '2',
    name: 'Darth Vader',
    set: 'SOR',
    number: '002',
    type: 'Unit',
    rarity: 'Legendary',
    cost: 8,
    power: 8,
    hp: 8,
    aspects: ['Villainy'],
    traits: ['Force', 'Sith', 'Imperial'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Darth+Vader'
  },
  {
    id: '3',
    name: 'Millennium Falcon',
    set: 'SOR',
    number: '003',
    type: 'Unit',
    rarity: 'Legendary',
    cost: 6,
    power: 6,
    hp: 7,
    aspects: ['Cunning'],
    traits: ['Vehicle', 'Transport', 'Rebel'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Millennium+Falcon'
  },
  {
    id: '4',
    name: 'Force Lightning',
    set: 'SOR',
    number: '004',
    type: 'Event',
    rarity: 'Rare',
    cost: 3,
    aspects: ['Villainy'],
    traits: ['Force'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Force+Lightning'
  },
  {
    id: '5',
    name: 'Princess Leia',
    set: 'SOR',
    number: '005',
    type: 'Unit',
    rarity: 'Legendary',
    cost: 5,
    power: 4,
    hp: 6,
    aspects: ['Heroism'],
    traits: ['Official', 'Rebel'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Princess+Leia'
  },
  {
    id: '6',
    name: 'Stormtrooper',
    set: 'SOR',
    number: '006',
    type: 'Unit',
    rarity: 'Common',
    cost: 2,
    power: 2,
    hp: 3,
    aspects: ['Villainy'],
    traits: ['Trooper', 'Imperial'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Stormtrooper'
  },
  {
    id: '7',
    name: 'Rebel Trooper',
    set: 'SOR',
    number: '007',
    type: 'Unit',
    rarity: 'Common',
    cost: 2,
    power: 3,
    hp: 2,
    aspects: ['Heroism'],
    traits: ['Trooper', 'Rebel'],
    imageUrl: 'https://via.placeholder.com/300x400?text=Rebel+Trooper'
  },
  {
    id: '8',
    name: 'TIE Fighter',
    set: 'SOR',
    number: '008',
    type: 'Unit',
    rarity: 'Uncommon',
    cost: 3,
    power: 4,
    hp: 2,
    aspects: ['Aggression'],
    traits: ['Vehicle', 'Fighter', 'Imperial'],
    imageUrl: 'https://via.placeholder.com/300x400?text=TIE+Fighter'
  }
];

/**
 * Controller temporal para operaciones con cartas usando datos mock
 */
export class CardsControllerMock {
  /**
   * Obtiene todas las cartas con paginación (versión mock)
   */
  static async getCards(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt((req.query['page'] as string) ?? '1', 10) || 1;
      const limit = Math.min(parseInt((req.query['limit'] as string) ?? '20', 10) || 20, 100);
      const skip = (page - 1) * limit;

      // Aplicar filtros básicos
      let filteredCards = [...mockCards];

      if (req.query['search']) {
        const searchTerm = (req.query['search'] as string).toLowerCase();
        filteredCards = filteredCards.filter(card =>
          card.name.toLowerCase().includes(searchTerm) ||
          card.traits.some(trait => trait.toLowerCase().includes(searchTerm))
        );
      }

      if (req.query['type']) {
        filteredCards = filteredCards.filter(card =>
          card.type.toLowerCase() === (req.query['type'] as string).toLowerCase()
        );
      }

      if (req.query['rarity']) {
        filteredCards = filteredCards.filter(card =>
          card.rarity.toLowerCase() === (req.query['rarity'] as string).toLowerCase()
        );
      }

      if (req.query['set']) {
        filteredCards = filteredCards.filter(card =>
          card.set.toLowerCase() === (req.query['set'] as string).toLowerCase()
        );
      }

      const total = filteredCards.length;
      const paginatedCards = filteredCards.slice(skip, skip + limit);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        cards: paginatedCards,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        note: 'Usando datos mock para desarrollo. MongoDB no está configurado aún.'
      });

      logger.info('Cards obtenidas (mock)', {
        total,
        page,
        limit,
        filters: req.query
      });

    } catch (error) {
      logger.error('Error obteniendo cartas (mock):', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las cartas',
      });
    }
  }

  /**
   * Obtiene una carta específica por ID (versión mock)
   */
  static async getCardById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const card = mockCards.find(c => c.id === id);

      if (!card) {
        res.status(404).json({
          error: 'Carta no encontrada',
          message: `No existe carta con ID: ${id}`,
        });
        return;
      }

      res.status(200).json({
        card,
        note: 'Usando datos mock para desarrollo. MongoDB no está configurado aún.'
      });

    } catch (error) {
      logger.error('Error obteniendo carta por ID (mock):', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo obtener la carta',
      });
    }
  }

  /**
   * Busca cartas por texto (versión mock)
   */
  static async searchCards(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query['q'] as string;

      if (!query || query.trim().length < 2) {
        res.status(400).json({
          error: 'Consulta inválida',
          message: 'La búsqueda debe tener al menos 2 caracteres',
        });
        return;
      }

      const searchTerm = query.toLowerCase();
      const results = mockCards.filter(card =>
        card.name.toLowerCase().includes(searchTerm) ||
        card.traits.some(trait => trait.toLowerCase().includes(searchTerm))
      );

      res.status(200).json({
        results,
        query,
        total: results.length,
        note: 'Usando datos mock para desarrollo. MongoDB no está configurado aún.'
      });

    } catch (error) {
      logger.error('Error buscando cartas (mock):', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo realizar la búsqueda',
      });
    }
  }
}
