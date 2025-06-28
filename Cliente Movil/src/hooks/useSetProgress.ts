import { useMemo } from 'react';
import { useCollectionStore } from '../store/collectionStore';

export const useSetProgress = (setCode?: string) => {
  const { cards, sets } = useCollectionStore();

  const setProgress = useMemo(() => {
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
  }, [cards, sets, setCode]);

  return setProgress;
};
