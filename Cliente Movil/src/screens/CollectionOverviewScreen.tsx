import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// Components
import { StatCard } from '../components/StatCard';
import { SetCard } from '../components/SetCard';
import { ProgressBar } from '../components/ProgressBar';
import { AddPackModal } from '../modals/AddPackModal';

// Hooks and Store
import { useCollectionStats } from '../hooks/useCollectionStats';
import { useSetProgress } from '../hooks/useSetProgress';
import { useCollectionStore } from '../store/collectionStore';

// Types
import { RootStackParamList } from '../navigation/AppNavigator';

type CollectionOverviewScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'CollectionOverview'
>;
type CollectionOverviewScreenRouteProp = RouteProp<
  RootStackParamList,
  'CollectionOverview'
>;

interface Props {
  navigation: CollectionOverviewScreenNavigationProp;
  route: CollectionOverviewScreenRouteProp;
}

export const CollectionOverviewScreen: React.FC<Props> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [isAddPackModalVisible, setIsAddPackModalVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'name' | 'completion' | 'release'>('release');

  const { stats, refreshStats } = useCollectionStats();
  const setProgress = useSetProgress();
  const { selectedView, setView } = useCollectionStore();

  const handleRefresh = async () => {
    setRefreshing(true);
    refreshStats();
    // Simulate API refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSetPress = (setCode: string) => {
    navigation.navigate('SetDetails', { setCode });
  };

  const sortedSets = React.useMemo(() => {
    if (!setProgress || !Array.isArray(setProgress)) return [];

    return [...setProgress].sort((a, b) => {
      switch (selectedSort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'completion':
          return b.completionPercentage - a.completionPercentage;
        case 'release':
        default:
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
    });
  }, [setProgress, selectedSort]);

  const renderStatCards = () => (
    <View style={styles.statCardsContainer}>
      <View style={styles.statCardRow}>
        <StatCard
          title="Cartas Totales"
          value={stats.ownedCards}
          subtitle={`de ${stats.totalCards}`}
          backgroundColor="#E3F2FD"
          textColor="#1976D2"
          size="small"
          style={styles.statCard}
        />
        <StatCard
          title="Únicas"
          value={stats.uniqueCards}
          subtitle="diferentes"
          backgroundColor="#F3E5F5"
          textColor="#7B1FA2"
          size="small"
          style={styles.statCard}
        />
      </View>

      <View style={styles.statCardRow}>
        <StatCard
          title="Valor Estimado"
          value={`$${stats.totalValue.toFixed(0)}`}
          subtitle="USD"
          backgroundColor="#E8F5E8"
          textColor="#388E3C"
          size="small"
          style={styles.statCard}
        />
        <StatCard
          title="Duplicados"
          value={stats.duplicates}
          subtitle="extras"
          backgroundColor="#FFF3E0"
          textColor="#F57C00"
          size="small"
          style={styles.statCard}
        />
      </View>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Ordenar por:</Text>
        <Picker
          selectedValue={selectedSort}
          onValueChange={setSelectedSort}
          style={styles.sortPicker}
        >
          <Picker.Item label="Fecha de lanzamiento" value="release" />
          <Picker.Item label="Nombre" value="name" />
          <Picker.Item label="Completitud" value="completion" />
        </Picker>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.viewButton, selectedView === 'list' && styles.activeViewButton]}
          onPress={() => setView('list')}
        >
          <Text style={[styles.viewButtonText, selectedView === 'list' && styles.activeViewButtonText]}>
            Lista
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewButton, selectedView === 'grid' && styles.activeViewButton]}
          onPress={() => setView('grid')}
        >
          <Text style={[styles.viewButtonText, selectedView === 'grid' && styles.activeViewButtonText]}>
            Grid
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addPackButton}
          onPress={() => setIsAddPackModalVisible(true)}
        >
          <Text style={styles.addPackButtonText}>+ Pack</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSetsList = () => (
    <View style={styles.setsContainer}>
      <Text style={styles.sectionTitle}>Sets de Cartas</Text>

      {sortedSets.map((set) => (
        <SetCard
          key={set.code}
          setCode={set.code}
          setName={set.name}
          releaseDate={set.releaseDate}
          totalCards={set.totalCards}
          ownedCards={set.ownedCards}
          completionPercentage={set.completionPercentage}
          imageUrl={set.imageUrl}
          onPress={() => handleSetPress(set.code)}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with progress */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Colección</Text>
          <ProgressBar
            progress={stats.completionPercentage}
            height={12}
            label="Progreso General"
            color="#4CAF50"
            style={styles.mainProgress}
          />
        </View>

        {/* Stats Cards */}
        {renderStatCards()}

        {/* Controls */}
        {renderControls()}

        {/* Sets List */}
        {renderSetsList()}
      </ScrollView>

      {/* Add Pack Modal */}
      <AddPackModal
        isVisible={isAddPackModalVisible}
        onClose={() => setIsAddPackModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  mainProgress: {
    marginTop: 8,
  },
  statCardsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
  },
  controlsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortContainer: {
    flex: 1,
  },
  sortLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sortPicker: {
    height: 40,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 4,
  },
  activeViewButton: {
    backgroundColor: '#2196F3',
  },
  viewButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeViewButtonText: {
    color: '#FFFFFF',
  },
  addPackButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  addPackButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  setsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
});
