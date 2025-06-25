import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import StorageService from '../services/storage';
import { getRarityColor } from '../utils';

type Props = NativeStackScreenProps<RootStackParamList, 'CardDetail'>;

const CardDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { card } = route.params;

  const handleAddToCollection = async () => {
    try {
      await StorageService.addCardToCollection(card, 1);
      Alert.alert('Éxito', 'Carta agregada a tu colección', [
        {
          text: 'Ver Colección',
          onPress: () => navigation.navigate('Collection'),
        },
        { text: 'OK' },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la carta a la colección');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Imagen de la carta */}
        <View style={styles.imageContainer}>
          {card.imageUrl ? (
            <Image source={{ uri: card.imageUrl }} style={styles.cardImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🃏</Text>
              <Text style={styles.placeholderLabel}>Imagen no disponible</Text>
            </View>
          )}
        </View>

        {/* Información básica */}
        <View style={styles.infoContainer}>
          <Text style={styles.cardName}>{card.name}</Text>

          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Set:</Text>
              <Text style={styles.infoValue}>{card.set}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Número:</Text>
              <Text style={styles.infoValue}>{card.number}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rareza:</Text>
              <Text style={[styles.infoValue, { color: getRarityColor(card.rarity) }]}>
                {card.rarity}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo:</Text>
              <Text style={styles.infoValue}>{card.type}</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas */}
        {(card.cost !== undefined || card.power !== undefined || card.hp !== undefined) && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Estadísticas</Text>
            <View style={styles.statsRow}>
              {card.cost !== undefined && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Costo</Text>
                  <Text style={styles.statValue}>{card.cost}</Text>
                </View>
              )}
              {card.power !== undefined && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Poder</Text>
                  <Text style={styles.statValue}>{card.power}</Text>
                </View>
              )}
              {card.hp !== undefined && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Vida</Text>
                  <Text style={styles.statValue}>{card.hp}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Aspectos */}
        {card.aspects && card.aspects.length > 0 && (
          <View style={styles.aspectsContainer}>
            <Text style={styles.sectionTitle}>Aspectos</Text>
            <View style={styles.tagContainer}>
              {card.aspects.map((aspect, index) => (
                <View key={index} style={styles.aspectTag}>
                  <Text style={styles.tagText}>{aspect}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Traits */}
        {card.traits && card.traits.length > 0 && (
          <View style={styles.traitsContainer}>
            <Text style={styles.sectionTitle}>Rasgos</Text>
            <View style={styles.tagContainer}>
              {card.traits.map((trait, index) => (
                <View key={index} style={styles.traitTag}>
                  <Text style={styles.tagText}>{trait}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botón para agregar a colección */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddToCollection}>
          <Text style={styles.addButtonText}>➕ Agregar a Colección</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  cardImage: {
    width: 250,
    height: 350,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: 250,
    height: 350,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 10,
  },
  placeholderLabel: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  infoContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  basicInfo: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
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
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  aspectsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  traitsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  aspectTag: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  traitTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#43A047',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CardDetailScreen;
