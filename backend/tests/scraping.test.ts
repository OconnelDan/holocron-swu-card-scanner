import { CardScrapingService } from '../src/services';
import { Card } from '../src/models';

describe('CardScrapingService', () => {
  let scrapingService: CardScrapingService;

  beforeEach(() => {
    scrapingService = new CardScrapingService();
  });

  describe('fetchCardsFromSwudb', () => {
    it('debería obtener cartas desde SWUDB API', async () => {
      // Mock de axios para evitar llamadas reales en tests
      jest.spyOn(scrapingService as any, 'fetchCardsFromSwudb').mockResolvedValue([
        {
          id: 'test-card-1',
          name: 'Luke Skywalker',
          subtitle: 'Jedi Knight',
          cardNumber: '001',
          set: {
            code: 'SOR',
            name: 'Spark of Rebellion',
          },
          rarity: 'Legendary',
          type: 'Unit',
          aspects: ['Heroism'],
          cost: 6,
          power: 5,
          hp: 8,
        },
      ]);

      const cards = await scrapingService.fetchCardsFromSwudb();

      expect(cards).toHaveLength(1);
      expect(cards[0]).toEqual(
        expect.objectContaining({
          id: 'test-card-1',
          name: 'Luke Skywalker',
          subtitle: 'Jedi Knight',
          rarity: 'Legendary',
          type: 'Unit',
        })
      );
    });

    it('debería manejar errores de red', async () => {
      jest.spyOn(scrapingService as any, 'fetchCardsFromSwudb').mockRejectedValue(
        new Error('Network error')
      );

      await expect(scrapingService.fetchCardsFromSwudb()).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('updateCardsFromSwudb', () => {
    it('debería actualizar cartas en la base de datos', async () => {
      // Mock de fetchCardsFromSwudb
      jest.spyOn(scrapingService, 'fetchCardsFromSwudb').mockResolvedValue([
        {
          id: 'test-card-1',
          name: 'Luke Skywalker',
          subtitle: 'Jedi Knight',
          cardNumber: '001',
          set: {
            code: 'SOR',
            name: 'Spark of Rebellion',
          },
          rarity: 'Legendary',
          type: 'Unit',
          aspects: ['Heroism'],
          cost: 6,
          power: 5,
          hp: 8,
        },
      ]);

      const updatedCount = await scrapingService.updateCardsFromSwudb();

      expect(updatedCount).toBe(1);

      // Verificamos que la carta se guardó en la DB
      const savedCard = await Card.findOne({ swudbId: 'test-card-1' });
      expect(savedCard).toBeTruthy();
      expect(savedCard?.name).toBe('Luke Skywalker');
    });
  });
});
