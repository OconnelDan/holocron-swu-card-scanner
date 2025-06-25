import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, Card, ScanResult, UserCollection } from '../types';

// Configuración base para el cliente HTTP
const BASE_URL = 'http://localhost:3000/api'; // URL del backend

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
}

export default new ApiService();
