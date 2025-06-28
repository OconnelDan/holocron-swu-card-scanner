import { create } from 'zustand';
import { Card, Set, mockCards, mockSets, mockCollectionStats } from '../data/exampleData';

interface CollectionState {
  cards: Card[];
  sets: Set[];
  stats: typeof mockCollectionStats;
  selectedView: 'grid' | 'list';

  // Actions
  updateCard: (cardId: string, owned: number) => void;
  addCard: (card: Card) => void;
  removeCard: (cardId: string) => void;
  setView: (view: 'grid' | 'list') => void;
  refreshStats: () => void;

  // Pack opening
  isOpeningPack: boolean;
  openPack: (packId: string) => Promise<Card[]>;
  setIsOpeningPack: (isOpening: boolean) => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  cards: mockCards,
  sets: mockSets,
  stats: mockCollectionStats,
  selectedView: 'grid',
  isOpeningPack: false,

  updateCard: (cardId: string, owned: number) => {
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId ? { ...card, owned } : card
      ),
    }));
    get().refreshStats();
  },

  addCard: (card: Card) => {
    set((state) => ({
      cards: [...state.cards, card],
    }));
    get().refreshStats();
  },

  removeCard: (cardId: string) => {
    set((state) => ({
      cards: state.cards.filter((card) => card.id !== cardId),
    }));
    get().refreshStats();
  },

  setView: (view: 'grid' | 'list') => {
    set({ selectedView: view });
  },

  refreshStats: () => {
    const { cards, sets } = get();

    const totalCards = cards.reduce((sum, card) => sum + card.total, 0);
    const ownedCards = cards.reduce((sum, card) => sum + card.owned, 0);
    const uniqueCards = cards.filter((card) => card.owned > 0).length;
    const completionPercentage = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;
    const duplicates = cards.reduce((sum, card) => sum + Math.max(0, card.owned - card.total), 0);

    // Simulate card value calculation
    const totalValue = cards.reduce((sum, card) => {
      const baseValue = card.rarity === 'Legendary' ? 50 :
        card.rarity === 'Rare' ? 15 :
          card.rarity === 'Uncommon' ? 5 : 2;
      return sum + (card.owned * baseValue);
    }, 0);

    set({
      stats: {
        totalCards,
        ownedCards,
        uniqueCards,
        completionPercentage,
        totalValue,
        sets: sets.length,
        duplicates,
      },
    });
  },

  openPack: async (packId: string): Promise<Card[]> => {
    set({ isOpeningPack: true });

    // Simulate pack opening delay
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 2000));

    // Mock pack opening results
    const newCards: Card[] = [
      {
        id: `new_${Date.now()}_1`,
        name: 'TIE Fighter',
        setCode: 'SOR',
        cardNumber: '120',
        rarity: 'Common',
        variants: ['Normal'],
        owned: 1,
        total: 1,
      },
      {
        id: `new_${Date.now()}_2`,
        name: 'X-Wing',
        setCode: 'SOR',
        cardNumber: '121',
        rarity: 'Uncommon',
        variants: ['Normal'],
        owned: 1,
        total: 1,
      },
    ];

    // Add new cards to collection
    set((state) => ({
      cards: [...state.cards, ...newCards],
      isOpeningPack: false,
    }));

    get().refreshStats();
    return newCards;
  },

  setIsOpeningPack: (isOpening: boolean) => {
    set({ isOpeningPack: isOpening });
  },
}));
