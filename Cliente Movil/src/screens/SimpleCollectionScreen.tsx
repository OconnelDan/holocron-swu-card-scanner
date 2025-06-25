import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import StorageService from '../services/storage';
import ApiService from '../services/api';
import { UserCollection, CollectionStats, Card } from '../types';
import { formatNumber } from '../utils';
import { addTestCardsToCollection, isCollectionEmpty } from '../utils/testData';

interface CollectionItem extends UserCollection {
  card?: Card; // La información completa de la carta del backend
}

const SimpleCollectionScreen: React.FC = () => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    loadCollection();
  }, []);

  const testConnection = async (): Promise<boolean> => {
    try {
      const apiService = new ApiService();
      await apiService.getAllCards(1, 1); // Test con solo 1 carta
      return true;
    } catch (error) {
      console.log('Backend no disponible:', error);
      return false;
    }
  };

  const loadCollection = async () => {
    try {
      setIsLoading(true);
      
      // Probar conexión con el backend
      const online = await testConnection();
      setIsOnline(online);

      // Cargar colección local
      let userCollection = await StorageService.getUserCollection();
      
      // Si la colección está vacía, agregar datos de prueba
      if (isCollectionEmpty(userCollection)) {
        console.log('Colección vacía, agregando datos de prueba...');
        userCollection = addTestCardsToCollection();
        await StorageService.saveUserCollection(userCollection);
      }

      // Enriquecer con datos del backend si está disponible
      const enrichedCollection: CollectionItem[] = [];
      
      for (const item of userCollection) {
        const collectionItem: CollectionItem = { ...item };
        
        if (online) {
          try {
            const apiService = new ApiService();
            const response = await apiService.getCardById(item.cardId);
            if (response.success && response.data) {
              collectionItem.card = response.data;
            }
          } catch (error) {
            console.log(`Error al obtener carta ${item.cardId}:`, error);
          }
        }
        
        enrichedCollection.push(collectionItem);
      }

      setCollection(enrichedCollection);
      
      // Calcular estadísticas
      const totalCards = enrichedCollection.reduce((sum, item) => sum + item.quantity, 0);
      const uniqueCards = enrichedCollection.length;
      const totalValue = enrichedCollection.reduce((sum, item) => {
        const cardValue = item.card?.marketPrice || 0;
        return sum + (cardValue * item.quantity);
      }, 0);

      setStats({
        totalCards,
        uniqueCards,
        totalValue,
      });

    } catch (error) {
      console.error('Error al cargar la colección:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollection();
    setRefreshing(false);
  };

  const renderCard = ({ item }: { item: CollectionItem }) => {
    const card = item.card;
    
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            {card?.name || `Carta ID: ${item.cardId}`}
          </Text>
          <Text style={styles.cardQuantity}>x{item.quantity}</Text>
        </View>
        
        {card && (
          <View style={styles.cardDetails}>
            <Text style={styles.cardSet}>Set: {card.set}</Text>
            <Text style={styles.cardRarity}>Rareza: {card.rarity}</Text>
            {card.marketPrice && (
              <Text style={styles.cardPrice}>
                Precio: ${card.marketPrice.toFixed(2)}
              </Text>
            )}
          </View>
        )}
        
        {!card && (
          <Text style={styles.offlineText}>
            Datos no disponibles (offline)
          </Text>
        )}
      </View>
    );
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estadísticas de la Colección</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            Total de cartas: {formatNumber(stats.totalCards)}
          </Text>
          <Text style={styles.statItem}>
            Cartas únicas: {formatNumber(stats.uniqueCards)}
          </Text>
        </View>
        <Text style={styles.statItem}>
          Valor total: ${formatNumber(stats.totalValue)}
        </Text>
      </View>
    );
  };

  const renderConnectionStatus = () => (
    <View style={[styles.statusContainer, isOnline ? styles.online : styles.offline]}>
      <Text style={styles.statusText}>
        {isOnline ? '🟢 Conectado al backend' : '🔴 Sin conexión al backend'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Colección SWU</Text>
      </View>

      {renderConnectionStatus()}
      {renderStats()}

      <FlatList
        data={collection}
        renderItem={renderCard}
        keyExtractor={(item) => `${item.cardId}-${item.condition}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? 'Cargando colección...' : 'No hay cartas en tu colección'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusContainer: {
    padding: 8,
    margin: 8,
    borderRadius: 4,
  },
  online: {
    backgroundColor: '#004d00',
  },
  offline: {
    backgroundColor: '#4d0000',
  },
  statusText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
  },
  statsContainer: {
    backgroundColor: '#1a1a1a',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statItem: {
    color: '#cccccc',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  cardContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  cardQuantity: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDetails: {
    gap: 4,
  },
  cardSet: {
    color: '#cccccc',
    fontSize: 14,
  },
  cardRarity: {
    color: '#cccccc',
    fontSize: 14,
  },
  cardPrice: {
    color: '#00ff00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  offlineText: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SimpleCollectionScreen;
