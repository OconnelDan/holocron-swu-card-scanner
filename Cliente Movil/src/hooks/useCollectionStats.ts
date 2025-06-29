import { useState, useEffect, useMemo } from 'react';
import { apiService, transformApiStatsToLocal, ApiCollectionStats } from '../services/apiService';
import { useCollectionStore } from '../store/collectionStore';

export const useCollectionStats = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStats, setApiStats] = useState<ApiCollectionStats | null>(null);
  
  // Keep fallback to mock data for offline/error scenarios
  const { cards, stats: mockStats } = useCollectionStore();

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getCollectionStats();
      setApiStats(data);
    } catch (err) {
      console.warn('Failed to fetch real stats, using mock data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      // Keep apiStats as null to use mock data
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStats = async () => {
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const detailedStats = useMemo(() => {
    if (apiStats) {
      // Use real API data
      const transformedStats = transformApiStatsToLocal(apiStats);
      return {
        ...transformedStats,
        isRealData: true,
        recentlyAdded: [], // TODO: Implement recent additions from API
      };
    } else {
      // Fallback to mock data processing
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
        ...mockStats,
        rarityBreakdown,
        setBreakdown,
        recentlyAdded,
        isRealData: false,
      };
    }
  }, [apiStats, cards, mockStats]);

  return {
    stats: detailedStats,
    refreshStats,
    isLoading,
    error,
    isUsingRealData: !!apiStats,
  };
};
