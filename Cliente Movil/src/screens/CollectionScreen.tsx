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
import { UserCollection, CollectionStats, Card } from '../types';
import { formatNumber } from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'Collection'>;

interface CollectionItem extends UserCollection {
  cardName?: string;
  cardSet?: string;
}

const CollectionScreen: React.FC<Props> = ({ navigation }) => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollection();
    loadStats();
  }, []);

  const loadCollection = async () => {
    try {
      const userCollection = await StorageService.getCollection();
      // Por ahora mostraremos solo los IDs, en el futuro cargaremos los detalles completos
      const collectionWithDetails = userCollection.map(item => ({
        ...item,
        cardName: `Carta ${item.cardId}`, // Placeholder
        cardSet: 'Set Desconocido', // Placeholder
      }));
      setCollection(collectionWithDetails);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la colección');
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
    // Crear una carta mock basada en los datos de colección
    const mockCard: Card = {
      id: item.cardId,
      name: item.cardName || `Carta ${item.cardId}`,
      set: item.cardSet || 'Set Desconocido',
      number: item.cardId.slice(-3) || '001',
      rarity: 'Common',
      type: 'Unit',
      cost: Math.floor(Math.random() * 10) + 1,
      power: Math.floor(Math.random() * 8) + 1,
      hp: Math.floor(Math.random() * 12) + 1,
      aspects: ['Heroism'],
      traits: ['Rebel'],
    }; return (
      <CardComponent
        card={mockCard}
        onPress={() => navigation.navigate('CardDetail', { card: mockCard })}
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
});

export default CollectionScreen;
