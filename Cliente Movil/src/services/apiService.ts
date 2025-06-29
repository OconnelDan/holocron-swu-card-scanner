import axios from 'axios';
import { Platform } from 'react-native';

// Base configuration for API calls - auto-detect environment
const getApiBaseUrl = () => {
  // En desarrollo, usar la IP correcta para emulador Android
  if (__DEV__) {
    const emulatorHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
    return `http://${emulatorHost}:3000/api`;
  }
  
  // En producción, usar fallback a API de producción
  return 'https://api.holocron.com/api';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000, // 8 segundos timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log para debugging
console.log('API Base URL configurada:', API_BASE_URL);

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
