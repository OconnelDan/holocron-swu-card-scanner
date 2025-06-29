import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ScrollView,
} from 'react-native';
import StorageService from '../services/storage';
import { apiService } from '../services/apiService';
import { UserCollection, CollectionStats, Card, CardSet } from '../types';
import { formatNumber } from '../utils';
import { addTestCardsToCollection, isCollectionEmpty } from '../utils/testData';

interface CollectionItem extends UserCollection {
  card?: Card; // La información completa de la carta del backend
}

interface ExtendedCollectionStats extends CollectionStats {
  backendStats?: any; // Estadísticas completas del backend
}

const SimpleCollectionScreen: React.FC = () => {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<ExtendedCollectionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [sets, setSets] = useState<CardSet[]>([]);

  useEffect(() => {
    loadCollection();
  }, []);

  const getSetName = (setCode: string): string => {
    const setNames: { [key: string]: string } = {
      'SOR': 'Spark of Rebellion',
      'SHD': 'Shadows of the Galaxy',
      'TWI': 'Twilight of the Republic',
    };
    return setNames[setCode] || setCode;
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      await apiService.getCardsBySet('SOR', 1); // Test con solo 1 carta
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

      // FORZAR LIMPIEZA DE DATOS ANTIGUOS - Solo para desarrollo
      console.log('🧹 Limpiando datos antiguos...');
      await StorageService.clearAllData();
      console.log('✅ Datos limpiados, cargando datos de prueba...');
      await addTestCardsToCollection();

      // Cargar colección local
      let userCollection = await StorageService.getCollection();
      console.log('📱 Colección local cargada:', userCollection.map(c => c.cardId));
      
      // Si la colección está vacía, agregar datos de prueba
      if (await isCollectionEmpty()) {
        console.log('Colección vacía, agregando datos de prueba...');
        await addTestCardsToCollection();
        userCollection = await StorageService.getCollection();
      }

      // Cargar estadísticas del backend si está disponible
      if (online) {
        try {
          console.log('🔄 Cargando estadísticas del backend...');
          const backendStats = await apiService.getCollectionStats();
          console.log('📊 Estadísticas del backend:', backendStats);
          
          // Usar estadísticas del backend
          setStats({
            totalCards: backendStats.overview.totalPhysicalCards,
            uniqueCards: backendStats.overview.ownedCards,
            totalValue: 0, // Se calculará localmente
            completionPercentage: parseFloat(backendStats.overview.completionPercentage),
            lastUpdated: new Date(),
            backendStats: backendStats // Guardar estadísticas completas del backend
          });

          // Cargar sets del backend
          if (backendStats.bySet) {
            const setsData = backendStats.bySet.map((set: any) => ({
              setCode: set.setCode,
              name: getSetName(set.setCode),
              totalCards: set.totalCards,
              ownedCards: set.ownedCards,
              totalPhysicalCards: set.totalPhysicalCards,
              completionPercentage: parseFloat(set.completionPercentage),
            }));
            setSets(setsData);
          }
        } catch (error) {
          console.log('Error al cargar estadísticas del backend:', error);
        }
      }

      // Enriquecer con datos del backend si está disponible - OPTIMIZADO
      const enrichedCollection: CollectionItem[] = [];
      let allBackendCards: Card[] = [];
      
      if (online) {
        try {
          console.log('🔄 Cargando cartas del backend (todos los sets)...');
          // Cargar cartas de todos los sets disponibles
          const sorCards = await apiService.getCardsBySet('SOR', 1000);
          const shdCards = await apiService.getCardsBySet('SHD', 1000); 
          const twiCards = await apiService.getCardsBySet('TWI', 1000);
          
          allBackendCards = [...sorCards, ...shdCards, ...twiCards];
          console.log(`📦 ${allBackendCards.length} cartas obtenidas del backend (todos los sets)`);
        } catch (error) {
          console.log('Error al cargar cartas del backend:', error);
        }
      }
      
      for (const item of userCollection) {
        const collectionItem: CollectionItem = { ...item };
        
        if (online && allBackendCards.length > 0) {
          const foundCard = allBackendCards.find((card: Card) => card.id === item.cardId);
          if (foundCard) {
            console.log(`✅ Carta encontrada: ${foundCard.name}`);
            collectionItem.card = foundCard;
          } else {
            console.log(`❌ Carta ${item.cardId} no encontrada en el backend`);
          }
        }
        
        enrichedCollection.push(collectionItem);
      }

      setCollection(enrichedCollection);
      
      // Si no hay estadísticas del backend, calcular localmente
      if (!online || !stats) {
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
          completionPercentage: 0,
          lastUpdated: new Date(),
        });
      } else if (stats && enrichedCollection.length > 0) {
        // Actualizar valor total con precios de las cartas
        const totalValue = enrichedCollection.reduce((sum, item) => {
          const cardValue = item.card?.marketPrice || 0;
          return sum + (cardValue * item.quantity);
        }, 0);
        
        setStats(prev => prev ? { ...prev, totalValue } : null);
      }

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

  const handleSetPress = (setCode: string) => {
    setSelectedSet(setCode);
  };

  const handleBackToSets = () => {
    setSelectedSet(null);
  };

  const getCardsForSet = (setCode: string): CollectionItem[] => {
    return collection.filter(item => item.card?.set === setCode);
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

  const renderStatsCard = (title: string, value: string, subtitle: string, color: string) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
  );

  const renderStats = () => {
    if (!stats) return null;

    const backendStats = stats.backendStats;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Estadísticas de la Colección</Text>
        
        {/* Progress Bar - si hay estadísticas del backend */}
        {backendStats && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>
                Progreso General: {backendStats.overview.completionPercentage}%
              </Text>
              <Text style={styles.progressSubtext}>
                {backendStats.overview.ownedCards} de {backendStats.overview.totalCards} cartas
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${backendStats.overview.completionPercentage}%` }
                ]} 
              />
            </View>
          </View>
        )}

        {/* Stats Cards Grid */}
        <View style={styles.statsGrid}>
          {renderStatsCard(
            'Cartas Totales',
            formatNumber(stats.totalCards),
            `de ${backendStats?.overview?.totalCards || '-'} únicas`,
            '#E3F2FD'
          )}
          {renderStatsCard(
            'Únicas',
            formatNumber(stats.uniqueCards),
            'diferentes',
            '#F3E5F5'
          )}
          {renderStatsCard(
            'Valor Estimado',
            `$${formatNumber(stats.totalValue || 0)}`,
            'USD',
            '#E8F5E8'
          )}
          {renderStatsCard(
            'Duplicados',
            formatNumber(Math.max(0, stats.totalCards - stats.uniqueCards)),
            'extras',
            '#FFF3E0'
          )}
        </View>

        {/* Estadísticas por rareza si están disponibles */}
        {backendStats?.byRarity && (
          <View style={styles.rarityContainer}>
            <Text style={styles.sectionTitle}>Por Rareza</Text>
            {backendStats.byRarity.map((rarity: any, index: number) => (
              <View key={index} style={styles.rarityItem}>
                <View style={styles.rarityHeader}>
                  <Text style={styles.rarityName}>{rarity.rarity}</Text>
                  <Text style={styles.rarityCompletion}>
                    {rarity.completionPercentage}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${rarity.completionPercentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.rarityCount}>
                  {rarity.ownedCards} de {rarity.totalCards}
                </Text>
              </View>
            ))}
          </View>
        )}
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

  const renderSetCard = ({ item }: { item: CardSet }) => (
    <TouchableOpacity style={styles.setCard} onPress={() => handleSetPress(item.setCode)}>
      <View style={styles.setHeader}>
        <View style={styles.setInfo}>
          <Text style={styles.setName}>{item.name}</Text>
          <Text style={styles.setCode}>{item.setCode}</Text>
        </View>
        <View style={styles.setStats}>
          <Text style={styles.completionText}>{item.completionPercentage}%</Text>
          <Text style={styles.cardCount}>{item.ownedCards}/{item.totalCards}</Text>
        </View>
      </View>
      <View style={styles.setProgress}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${item.completionPercentage}%` }
            ]} 
          />
        </View>
      </View>
      <View style={styles.setFooter}>
        <Text style={styles.progressLabelSmall}>Progreso de la colección</Text>
        <Text style={styles.progressLabelSmall}>
          {item.totalCards - item.ownedCards} cartas restantes
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {selectedSet && (
            <TouchableOpacity style={styles.backButton} onPress={handleBackToSets}>
              <Text style={styles.backButtonText}>← Volver</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {selectedSet ? `${getSetName(selectedSet)}` : 'Mi Colección SWU'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderConnectionStatus()}
        {renderStats()}

        {/* Contenido principal */}
        <View style={styles.mainContent}>
          {selectedSet ? (
            // Mostrar cartas del set seleccionado
            <>
              <Text style={styles.sectionTitle}>Cartas en tu colección</Text>
              {getCardsForSet(selectedSet).length > 0 ? (
                getCardsForSet(selectedSet).map((item, index) => (
                  <View key={`${item.cardId}-${item.condition}-${index}`}>
                    {renderCard({ item })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No tienes cartas de este set en tu colección
                  </Text>
                </View>
              )}
            </>
          ) : (
            // Mostrar lista de sets
            <>
              <Text style={styles.sectionTitle}>Sets de Cartas</Text>
              {sets.length > 0 ? (
                sets.map((set, index) => (
                  <View key={`${set.setCode}-${index}`}>
                    {renderSetCard({ item: set })}
                  </View>
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {isLoading ? 'Cargando sets...' : 'No hay sets disponibles'}
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#000000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 50,
    minHeight: 100,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    zIndex: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  online: {
    backgroundColor: '#E8F5E8',
  },
  offline: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressSubtext: {
    fontSize: 12,
    color: '#666',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  rarityContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rarityItem: {
    marginBottom: 12,
  },
  rarityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rarityName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rarityCompletion: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  rarityCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  cardDetails: {
    marginTop: 8,
  },
  cardSet: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardRarity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  offlineText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  setCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  setInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  setCode: {
    fontSize: 12,
    color: '#666',
  },
  setStats: {
    alignItems: 'flex-end',
  },
  completionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  setProgress: {
    marginBottom: 8,
  },
  setFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabelSmall: {
    fontSize: 12,
    color: '#666',
  },
  scrollContainer: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

export default SimpleCollectionScreen;
