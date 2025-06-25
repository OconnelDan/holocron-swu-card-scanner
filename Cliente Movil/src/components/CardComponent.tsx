import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../types';

interface CardComponentProps {
  card: Card;
  onPress?: () => void;
  showQuantity?: boolean;
  quantity?: number;
  style?: any;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 2 cartas por fila con margen

const CardComponent: React.FC<CardComponentProps> = ({
  card,
  onPress,
  showQuantity = false,
  quantity = 1,
  style,
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#95A5A6';
      case 'Uncommon': return '#2ECC71';
      case 'Rare': return '#3498DB';
      case 'Legendary': return '#F39C12';
      case 'Special': return '#E74C3C';
      default: return '#95A5A6';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'fiber-manual-record';
      case 'Uncommon': return 'change-history';
      case 'Rare': return 'star';
      case 'Legendary': return 'stars';
      case 'Special': return 'whatshot';
      default: return 'fiber-manual-record';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      {/* Imagen de la carta */}
      <View style={styles.imageContainer}>
        {card.imageUrl ? (
          <Image source={{ uri: card.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="photo" size={40} color="#999" />
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        {/* Badge de cantidad */}
        {showQuantity && quantity > 1 && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{quantity}</Text>
          </View>
        )}
      </View>

      {/* Información de la carta */}
      <View style={styles.infoContainer}>
        <Text style={styles.cardName} numberOfLines={2}>
          {card.name}
        </Text>

        <View style={styles.setInfo}>
          <Text style={styles.setName} numberOfLines={1}>
            {card.set}
          </Text>
          <Text style={styles.cardNumber}>#{card.number}</Text>
        </View>

        <View style={styles.detailsRow}>
          {/* Rareza */}
          <View style={styles.rarityContainer}>
            <Icon
              name={getRarityIcon(card.rarity)}
              size={12}
              color={getRarityColor(card.rarity)}
            />
            <Text style={[styles.rarityText, { color: getRarityColor(card.rarity) }]}>
              {card.rarity}
            </Text>
          </View>

          {/* Estadísticas */}
          <View style={styles.statsContainer}>
            {card.cost !== undefined && (
              <View style={styles.statItem}>
                <Icon name="monetization-on" size={12} color="#666" />
                <Text style={styles.statText}>{card.cost}</Text>
              </View>
            )}
            {card.power !== undefined && (
              <View style={styles.statItem}>
                <Icon name="flash-on" size={12} color="#f39c12" />
                <Text style={styles.statText}>{card.power}</Text>
              </View>
            )}
            {card.hp !== undefined && (
              <View style={styles.statItem}>
                <Icon name="favorite" size={12} color="#e74c3c" />
                <Text style={styles.statText}>{card.hp}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Tipo */}
        <Text style={styles.cardType} numberOfLines={1}>
          {card.type}
        </Text>

        {/* Aspectos */}
        {card.aspects && card.aspects.length > 0 && (
          <View style={styles.aspectsContainer}>
            {card.aspects.slice(0, 2).map((aspect, index) => (
              <View key={index} style={styles.aspectBadge}>
                <Text style={styles.aspectText}>{aspect}</Text>
              </View>
            ))}
            {card.aspects.length > 2 && (
              <Text style={styles.moreAspects}>+{card.aspects.length - 2}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: cardWidth * 1.4, // Proporción de carta
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
  },
  quantityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  quantityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 12,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  setInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  setName: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  cardNumber: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
    fontWeight: '500',
  },
  cardType: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 6,
  },
  aspectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  aspectBadge: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  aspectText: {
    fontSize: 9,
    color: '#1976d2',
    fontWeight: '500',
  },
  moreAspects: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CardComponent;
