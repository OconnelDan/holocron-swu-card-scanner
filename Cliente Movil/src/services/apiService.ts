import axios from 'axios';

// Base configuration for API calls
const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface ApiCollectionStats {
  overview: {
    totalCards: number;
    ownedCards: number;
    totalPhysicalCards: number;
    completionPercentage: string;
  };
  bySet: Array<{
    setCode: string;
    totalCards: number;
    ownedCards: number;
    totalPhysicalCards: number;
    completionPercentage: string;
  }>;
  byRarity: Array<{
    rarity: string;
    totalCards: number;
    ownedCards: number;
    totalPhysicalCards: number;
    completionPercentage: string;
  }>;
}

// API Service functions
export const apiService = {
  /**
   * Fetch collection statistics from backend
   */
  getCollectionStats: async (): Promise<ApiCollectionStats> => {
    try {
      const response = await apiClient.get<{ data: ApiCollectionStats }>('/cards/stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching collection stats:', error);
      throw new Error('Failed to fetch collection statistics');
    }
  },

  /**
   * Fetch cards by set
   */
  getCardsBySet: async (setCode: string, limit: number = 1000) => {
    try {
      const response = await apiClient.get(`/cards?set=${setCode}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching cards for set ${setCode}:`, error);
      throw new Error(`Failed to fetch cards for set ${setCode}`);
    }
  },

  /**
   * Update card quantities
   */
  updateCardQuantities: async (setCode: string, cardNumber: string, quantities: Record<string, number>) => {
    try {
      const response = await apiClient.put(`/cards/${setCode}/${cardNumber}`, quantities);
      return response.data.data;
    } catch (error) {
      console.error(`Error updating card ${setCode}-${cardNumber}:`, error);
      throw new Error(`Failed to update card ${setCode}-${cardNumber}`);
    }
  },
};

// Helper function to transform API data to local data format
export const transformApiStatsToLocal = (apiStats: ApiCollectionStats) => {
  const { overview, bySet, byRarity } = apiStats;
  
  return {
    totalCards: overview.totalCards,
    ownedCards: overview.ownedCards,
    uniqueCards: overview.ownedCards, // In our context, this is the same as owned cards
    completionPercentage: parseFloat(overview.completionPercentage),
    totalValue: 0, // TODO: Implement value calculation
    sets: bySet.length,
    duplicates: Math.max(0, overview.totalPhysicalCards - overview.ownedCards),
    setBreakdown: bySet.reduce((acc, set) => {
      acc[set.setCode] = {
        owned: set.ownedCards,
        total: set.totalCards,
        unique: set.ownedCards,
        completionPercentage: parseFloat(set.completionPercentage),
      };
      return acc;
    }, {} as Record<string, { owned: number; total: number; unique: number; completionPercentage: number }>),
    rarityBreakdown: byRarity.reduce((acc, rarity) => {
      acc[rarity.rarity] = {
        owned: rarity.ownedCards,
        total: rarity.totalCards,
      };
      return acc;
    }, {} as Record<string, { owned: number; total: number }>),
  };
};
