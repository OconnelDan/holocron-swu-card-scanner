import { useMemo } from 'react';
import { useCollectionStore } from '../store/collectionStore';
import { useCollectionStats } from './useCollectionStats';

// Set names mapping for display
const SET_NAMES = {
  '1SOR': 'Spark of Rebellion',
  '2SHD': 'Shadows of the Galaxy', 
  '3TWI': 'Twilight of the Republic',
  '4JTL': 'Juega tu Legado', // TODO: Replace with actual name
  '5LOF': 'Legacy of the Force', // TODO: Replace with actual name
};

export const useSetProgress = (setCode?: string) => {
  const { cards, sets } = useCollectionStore();
  const { stats, isUsingRealData } = useCollectionStats();

  const setProgress = useMemo(() => {
    if (isUsingRealData && stats.setBreakdown) {
      // Use real API data
      if (!setCode) {
        // Return all sets
        return Object.entries(stats.setBreakdown).map(([code, data]) => ({
          code,
          name: SET_NAMES[code as keyof typeof SET_NAMES] || code,
          totalCards: data.total,
          ownedCards: data.owned,
          uniqueOwned: data.unique,
          completionPercentage: data.total > 0 ? (data.owned / data.total) * 100 : 0,
          missingCards: data.total - data.owned,
          duplicates: 0, // TODO: Calculate from API if needed
          imageUrl: `set_${code.toLowerCase()}`, // Placeholder for set image
          releaseDate: new Date().toISOString(), // TODO: Add real release dates
        }));
      }
      
      // Return specific set
      const setData = stats.setBreakdown[setCode];
      if (!setData) return null;
      
      return {
        code: setCode,
        name: SET_NAMES[setCode as keyof typeof SET_NAMES] || setCode,
        totalCards: setData.total,
        ownedCards: setData.owned,
        uniqueOwned: setData.unique,
        completionPercentage: setData.total > 0 ? (setData.owned / setData.total) * 100 : 0,
        missingCards: setData.total - setData.owned,
        duplicates: 0,
        imageUrl: `set_${setCode.toLowerCase()}`,
        releaseDate: new Date().toISOString(),
        rarityProgress: {}, // TODO: Implement if needed
        cards: [], // TODO: Fetch specific set cards if needed
      };
    } else {
      // Fallback to mock data processing
      if (!setCode) {
        return sets.map(set => {
          const setCards = cards.filter(card => card.setCode === set.code);
          const totalCards = setCards.reduce((sum, card) => sum + card.total, 0);
          const ownedCards = setCards.reduce((sum, card) => sum + card.owned, 0);
          const uniqueOwned = setCards.filter(card => card.owned > 0).length;
          const completion = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;

          return {
            ...set,
            totalCards,
            ownedCards,
            uniqueOwned,
            completionPercentage: completion,
            missingCards: setCards.filter(card => card.owned === 0).length,
            duplicates: setCards.reduce((sum, card) => sum + Math.max(0, card.owned - card.total), 0),
          };
        });
      }

      const targetSet = sets.find(set => set.code === setCode);
      if (!targetSet) return null;

      const setCards = cards.filter(card => card.setCode === setCode);
      const totalCards = setCards.reduce((sum, card) => sum + card.total, 0);
      const ownedCards = setCards.reduce((sum, card) => sum + card.owned, 0);
      const uniqueOwned = setCards.filter(card => card.owned > 0).length;
      const completion = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;

      const rarityProgress = setCards.reduce((acc, card) => {
        if (!acc[card.rarity]) {
          acc[card.rarity] = { owned: 0, total: 0, unique: 0 };
        }
        acc[card.rarity].owned += card.owned;
        acc[card.rarity].total += card.total;
        if (card.owned > 0) {
          acc[card.rarity].unique += 1;
        }
        return acc;
      }, {} as Record<string, { owned: number; total: number; unique: number }>);

      return {
        ...targetSet,
        totalCards,
        ownedCards,
        uniqueOwned,
        completionPercentage: completion,
        missingCards: setCards.filter(card => card.owned === 0).length,
        duplicates: setCards.reduce((sum, card) => sum + Math.max(0, card.owned - card.total), 0),
        rarityProgress,
        cards: setCards,
      };
    }
  }, [setCode, cards, sets, stats, isUsingRealData]);

  return setProgress;
};
