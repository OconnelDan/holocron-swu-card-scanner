import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCollection, Card, CollectionStats } from '../types';

const COLLECTION_KEY = 'user_collection';
const SETTINGS_KEY = 'app_settings';

class StorageService {
  // Guardar colección del usuario
  async saveCollection(collection: UserCollection[]): Promise<void> {
    try {
      await AsyncStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
    } catch (error) {
      console.error('Error saving collection:', error);
      throw new Error('No se pudo guardar la colección');
    }
  }

  // Obtener colección del usuario
  async getCollection(): Promise<UserCollection[]> {
    try {
      const data = await AsyncStorage.getItem(COLLECTION_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading collection:', error);
      return [];
    }
  }

  // Agregar carta a la colección
  async addCardToCollection(card: Card, quantity: number = 1, condition?: string): Promise<void> {
    try {
      const collection = await this.getCollection();
      const existingIndex = collection.findIndex(item => item.cardId === card.id);

      if (existingIndex >= 0) {
        // Si ya existe, aumentar la cantidad
        collection[existingIndex].quantity += quantity;
      } else {
        // Si no existe, agregar nueva entrada
        collection.push({
          cardId: card.id,
          quantity,
          dateAdded: new Date(),
          condition: condition as any,
        });
      }

      await this.saveCollection(collection);
    } catch (error) {
      console.error('Error adding card to collection:', error);
      throw new Error('No se pudo agregar la carta a la colección');
    }
  }

  // Remover carta de la colección
  async removeCardFromCollection(cardId: string, quantity?: number): Promise<void> {
    try {
      const collection = await this.getCollection();
      const existingIndex = collection.findIndex(item => item.cardId === cardId);

      if (existingIndex >= 0) {
        if (quantity && collection[existingIndex].quantity > quantity) {
          // Reducir cantidad
          collection[existingIndex].quantity -= quantity;
        } else {
          // Remover completamente
          collection.splice(existingIndex, 1);
        }
        await this.saveCollection(collection);
      }
    } catch (error) {
      console.error('Error removing card from collection:', error);
      throw new Error('No se pudo remover la carta de la colección');
    }
  }

  // Calcular estadísticas de la colección
  async getCollectionStats(): Promise<CollectionStats> {
    try {
      const collection = await this.getCollection();
      const totalCards = collection.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueCards = collection.length;

      return {
        totalCards,
        uniqueCards,
        completionPercentage: 0, // Se calculará cuando tengamos datos del set completo
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error calculating collection stats:', error);
      return {
        totalCards: 0,
        uniqueCards: 0,
        completionPercentage: 0,
        lastUpdated: new Date(),
      };
    }
  }

  // Guardar configuraciones de la app
  async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw new Error('No se pudieron guardar las configuraciones');
    }
  }

  // Obtener configuraciones de la app
  async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  // Limpiar toda la data (para testing o reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([COLLECTION_KEY, SETTINGS_KEY]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('No se pudo limpiar la data');
    }
  }
}

export default new StorageService();
