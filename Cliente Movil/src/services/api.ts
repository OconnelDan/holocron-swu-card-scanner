import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { ApiResponse, Card, ScanResult, UserCollection } from '../types';

// Configuración base para el cliente HTTP
// Detectar automáticamente si es emulador o dispositivo físico
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    // Para emulador Android usar 10.0.2.2
    // Para dispositivo físico usar la IP de tu PC
    return __DEV__ ? 'http://192.168.1.135:3001/api' : 'http://10.0.2.2:3001/api';
  }
  return 'http://localhost:3001/api'; // Para iOS o web
};

const BASE_URL = getBaseUrl();

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para manejo de respuestas
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  // Método para escanear una carta
  async scanCard(imageBase64: string): Promise<ApiResponse<ScanResult>> {
    try {
      const response = await this.client.post('/scan', {
        image: imageBase64,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al escanear la carta',
      };
    }
  }

  // Método para obtener todas las cartas con paginación
  async getCards(page: number = 1, limit: number = 20): Promise<ApiResponse<{ cards: Card[], pagination: any }>> {
    try {
      const response = await this.client.get(`/cards?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener cartas',
      };
    }
  }

  // Método para buscar cartas
  async searchCards(query: string): Promise<ApiResponse<Card[]>> {
    try {
      const response = await this.client.get(`/cards/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al buscar cartas',
      };
    }
  }

  // Método para obtener información de una carta específica
  async getCard(cardId: string): Promise<ApiResponse<Card>> {
    try {
      const response = await this.client.get(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener información de la carta',
      };
    }
  }

  // Método para sincronizar la colección (futuro)
  async syncCollection(collection: UserCollection[]): Promise<ApiResponse<void>> {
    try {
      const response = await this.client.post('/collection/sync', {
        collection,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al sincronizar la colección',
      };
    }
  }

  // Método para verificar el estado del servidor
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Método para actualizar las cantidades de una carta existente
  async updateCardQuantities(setCode: string, cardNumber: string, quantities: any): Promise<ApiResponse<Card>> {
    try {
      const response = await this.client.put(`/cards/${setCode}/${cardNumber}`, quantities);
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar la carta',
      };
    }
  }

  // Método para obtener estadísticas de la colección
  async getCollectionStats(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get('/cards/collection/stats');
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas',
      };
    }
  }
}

export default new ApiService();
