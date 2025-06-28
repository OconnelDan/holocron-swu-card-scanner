import { useMemo } from 'react';
import { useCollectionStore } from '../store/collectionStore';

export const useCollectionStats = () => {
  const { cards, stats, refreshStats } = useCollectionStore();

  const detailedStats = useMemo(() => {
    const rarityBreakdown = cards.reduce((acc, card) => {
      if (!acc[card.rarity]) {
        acc[card.rarity] = { owned: 0, total: 0 };
      }
      acc[card.rarity].owned += card.owned;
      acc[card.rarity].total += card.total;
      return acc;
    }, {} as Record<string, { owned: number; total: number }>);

    const setBreakdown = cards.reduce((acc, card) => {
      if (!acc[card.setCode]) {
        acc[card.setCode] = { owned: 0, total: 0, unique: 0 };
      }
      acc[card.setCode].owned += card.owned;
      acc[card.setCode].total += card.total;
      if (card.owned > 0) {
        acc[card.setCode].unique += 1;
      }
      return acc;
    }, {} as Record<string, { owned: number; total: number; unique: number }>);

    const recentlyAdded = cards
      .filter(card => card.owned > 0)
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(0, 5);

    return {
      ...stats,
      rarityBreakdown,
      setBreakdown,
      recentlyAdded,
    };
  }, [cards, stats]);

  return {
    stats: detailedStats,
    refreshStats,
  };
};
