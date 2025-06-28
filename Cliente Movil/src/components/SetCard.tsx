import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ProgressBar } from './ProgressBar';

interface SetCardProps {
  setCode: string;
  setName: string;
  releaseDate: string;
  totalCards: number;
  ownedCards: number;
  completionPercentage: number;
  imageUrl?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: any;
}

export const SetCard: React.FC<SetCardProps> = ({
  setCode,
  setName,
  releaseDate,
  totalCards,
  ownedCards,
  completionPercentage,
  imageUrl,
  onPress,
  onLongPress,
  style,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 70) return '#FF9800';
    if (percentage >= 50) return '#2196F3';
    return '#9E9E9E';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.setImage} />
          ) : (
            <View style={[styles.setImagePlaceholder, { backgroundColor: getCompletionColor(completionPercentage) }]}>
              <Text style={styles.setCodeText}>{setCode}</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={styles.setName} numberOfLines={1}>
              {setName}
            </Text>
            <Text style={styles.setCode}>
              {setCode} • {formatDate(releaseDate)}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.completionText}>
            {completionPercentage.toFixed(1)}%
          </Text>
          <Text style={styles.cardCount}>
            {ownedCards}/{totalCards}
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <ProgressBar
          progress={completionPercentage}
          height={6}
          showPercentage={false}
          color={getCompletionColor(completionPercentage)}
          backgroundColor="#E0E0E0"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.progressLabel}>
          Progreso de la colección
        </Text>
        <Text style={styles.cardDetails}>
          {totalCards - ownedCards} cartas restantes
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  setImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  setImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setCodeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  setName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  setCode: {
    fontSize: 12,
    color: '#666',
  },
  statsContainer: {
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
  progressContainer: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  cardDetails: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});
