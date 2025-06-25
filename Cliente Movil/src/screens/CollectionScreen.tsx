import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { CardComponent } from '../components';
import StorageService from '../services/storage';
import ApiService from '../services/api';
import { UserCollection, CollectionStats, Card } from '../types';
import { formatNumber } from '../utils';
import { addTestCardsToCollection, isCollectionEmpty } from '../utils/testData';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;

interface CollectionItem extends UserCollection {
  card?: Card; // La información completa de la carta del backend
}

const CollectionScreen: React.FC<Props> = ({ navigation }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    loadCollection();
    loadStats();
  }, []);

  const loadCollection = async () => {
    try {
      // Verificar si la colección está vacía y agregar datos de prueba si es necesario
      if (await isCollectionEmpty()) {
        console.log('🧪 Colección vacía, agregando datos de prueba...');
        await addTestCardsToCollection();
      }

      // Cargar la colección local (IDs y cantidades)
      const userCollection = await StorageService.getCollection();

      if (userCollection.length === 0) {
        setCollection([]);
        setBackendConnected(false);
        return;
      }

      // Obtener todas las cartas disponibles del backend
      const cardsResponse = await ApiService.getCards(1, 1000); // Obtener todas las cartas

      if (cardsResponse.success && cardsResponse.data) {
        const allCards = cardsResponse.data.cards || [];
        setBackendConnected(true);

        // Combinar los datos: colección local + detalles del backend
        const collectionWithDetails = userCollection.map(item => {
          const cardDetails = allCards.find(card => card.id === item.cardId);
          return {
            ...item,
            card: cardDetails, // Información completa de la carta
          };
        }).filter(item => item.card); // Solo mostrar cartas que encontramos en el backend

        setCollection(collectionWithDetails);
      } else {
        // Si no hay conexión al backend, mostrar solo los IDs
        console.warn('No se pudieron cargar los detalles de las cartas del backend');
        setBackendConnected(false);
        const collectionFallback = userCollection.map(item => ({
          ...item,
          card: undefined, // Sin detalles del backend
        }));
        setCollection(collectionFallback);
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      setBackendConnected(false);
      setCollection([]);
      // No mostrar Alert.alert aquí porque puede causar el crash de Text
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const collectionStats = await StorageService.getCollectionStats();
      setStats(collectionStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollection();
    await loadStats();
    setRefreshing(false);
  };

  const handleRemoveCard = (cardId: string) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres eliminar esta carta de tu colección?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeCardFromCollection(cardId);
              loadCollection();
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la carta');
            }
          },
        },
      ]
    );
  };

  const handleClearCollection = () => {
    Alert.alert(
      'Limpiar Colección',
      '¿Estás seguro de que quieres eliminar toda tu colección? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              loadCollection();
              loadStats();
              Alert.alert('Éxito', 'Colección limpiada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo limpiar la colección');
            }
          },
        },
      ]
    );
  };
  const renderCollectionItem = ({ item }: { item: CollectionItem }) => {
    // Si tenemos los datos de la carta del backend, usarlos
    if (item.card) {
      return (
        <CardComponent
          card={item.card}
          onPress={() => navigation.navigate('CardDetail', { card: item.card! })}
          showQuantity={true}
          quantity={item.quantity}
        />
      );
    }

    // Fallback: crear una carta mock si no tenemos datos del backend
    const fallbackCard: Card = {
      id: item.cardId,
      name: `Carta ${item.cardId}`,
      set: 'Set Desconocido',
      number: item.cardId.slice(-3) || '001',
      rarity: 'Common',
      type: 'Unit',
      cost: Math.floor(Math.random() * 10) + 1,
      power: Math.floor(Math.random() * 8) + 1,
      hp: Math.floor(Math.random() * 12) + 1,
      aspects: ['Heroism'],
      traits: ['Rebel'],
    };

    return (
      <CardComponent
        card={fallbackCard}
        onPress={() => navigation.navigate('CardDetail', { card: fallbackCard })}
        showQuantity={true}
        quantity={item.quantity}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyTitle}>Tu colección está vacía</Text>
      <Text style={styles.emptyText}>
        Comienza escaneando algunas cartas para crear tu colección
      </Text>
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate('Scan')}
      >
        <Text style={styles.scanButtonText}>Escanear Primera Carta</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Cargando colección...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Indicador de estado del backend */}
      <View style={[styles.statusContainer, backendConnected ? styles.statusConnected : styles.statusDisconnected]}>
        <Text style={styles.statusText}>
          {backendConnected ? '🟢 Conectado al servidor' : '🔴 Modo offline'}
        </Text>
      </View>

      {/* Estadísticas */}
      {stats && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas de Colección</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.totalCards)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{formatNumber(stats.uniqueCards)}</Text>
              <Text style={styles.statLabel}>Únicas</Text>
            </View>
          </View>
        </View>
      )}      {/* Lista de cartas */}
      <FlatList
        data={collection}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.cardId}
        numColumns={2}
        columnWrapperStyle={collection.length > 1 ? styles.row : undefined}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={collection.length === 0 ? styles.emptyList : styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Botón para limpiar colección */}
      {collection.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearCollection}>
          <Text style={styles.clearButtonText}>Limpiar Colección</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    margin: 20,
    padding: 20,
    borderRadius: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  cardItem: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 3,
  },
  cardCondition: {
    fontSize: 12,
    color: '#FFD700',
  },
  removeButton: {
    padding: 10,
  },
  removeButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  scanButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#FF5722',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  }, clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  statusContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusConnected: {
    backgroundColor: '#1B5E20',
  },
  statusDisconnected: {
    backgroundColor: '#B71C1C',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CollectionScreen;
