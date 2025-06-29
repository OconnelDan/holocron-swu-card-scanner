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
      // Cartas del set SOR
      {
        cardId: 'SOR_001', // Luke Skywalker
        quantity: 2,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      {
        cardId: 'SOR_002', // Darth Vader
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Mint'
      },
      {
        cardId: 'SOR_003', // Princess Leia
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Lightly Played'
      },
      {
        cardId: 'SOR_005', // Chewbacca
        quantity: 4,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      {
        cardId: 'SOR_008', // Stormtrooper
        quantity: 3,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      // Cartas del set SHD
      {
        cardId: 'SHD_001', // Boba Fett
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Mint'
      },
      {
        cardId: 'SHD_002', // Lando Calrissian
        quantity: 2,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      {
        cardId: 'SHD_005', // Gamorrean Guard
        quantity: 5,
        dateAdded: new Date(),
        condition: 'Near Mint'
      },
      // Cartas del set TWI
      {
        cardId: 'TWI_001', // Anakin Skywalker
        quantity: 1,
        dateAdded: new Date(),
        condition: 'Mint'
      },
      {
        cardId: 'TWI_004', // Clone Trooper
        quantity: 6,
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
