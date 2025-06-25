import { UserCollection } from '../types';
import StorageService from '../services/storage';

/**
 * Utilidades para cargar datos de prueba durante el desarrollo
 */

/**
 * Agrega cartas de prueba a la colección local para probar la integración con el backend
 */
export const addTestCardsToCollection = async (): Promise<void> => {
  try {
    // Limpiar colección existente
    await StorageService.clearAllData();

    // Crear colección de prueba con IDs que coincidan con el mock del backend
    const testCollection: UserCollection[] = [
      {
        cardId: '1', // Luke Skywalker
        quantity: 2,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      {
        cardId: '2', // Darth Vader
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Mint'
      },
      {
        cardId: '3', // Millennium Falcon
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Lightly Played'
      },
      {
        cardId: '6', // Stormtrooper
        quantity: 4,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      {
        cardId: '7', // Rebel Trooper
        quantity: 3,
        dateAdded: new Date(),
        condition: 'Near Mint'
      }
    ];

    await StorageService.saveCollection(testCollection);
    console.log('✅ Cartas de prueba agregadas a la colección local');
  } catch (error) {
    console.error('❌ Error agregando cartas de prueba:', error);
  }
};

/**
 * Verifica si la colección local está vacía
 */
export const isCollectionEmpty = async (): Promise<boolean> => {
  try {
    const collection = await StorageService.getCollection();
    return collection.length === 0;
  } catch (error) {
    console.error('Error verificando si la colección está vacía:', error);
    return true; // Si hay error, asumimos que está vacía
  }
};
