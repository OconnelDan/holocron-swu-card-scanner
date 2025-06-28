import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ApiService from '../services/api';

interface CardQuantities {
  normal: number;
  foil: number;
  hyperspace: number;
  foil_hyperspace: number;
  showcase: number;
  organized_play: number;
  event_exclusive: number;
  prerelease_promo: number;
  organized_play_foil: number;
  standard_prestige: number;
  foil_prestige: number;
  serialized_prestige: number;
}

const UpdateCardScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [setCode, setSetCode] = useState('5LOF'); // Por defecto para la nueva colección
  const [cardNumber, setCardNumber] = useState('');
  const [quantities, setQuantities] = useState<CardQuantities>({
    normal: 0,
    foil: 0,
    hyperspace: 0,
    foil_hyperspace: 0,
    showcase: 0,
    organized_play: 0,
    event_exclusive: 0,
    prerelease_promo: 0,
    organized_play_foil: 0,
    standard_prestige: 0,
    foil_prestige: 0,
    serialized_prestige: 0,
  });

  const sets = ['5LOF', '1SOR', '2SHD', '3TWI', '4TDA'];
  
  const variantLabels = {
    normal: 'Normal',
    foil: 'Foil',
    hyperspace: 'Hyperspace',
    foil_hyperspace: 'Foil & Hyperspace',
    showcase: 'Showcase',
    organized_play: 'Organized Play',
    event_exclusive: 'Event Exclusive',
    prerelease_promo: 'Prerelease Promo',
    organized_play_foil: 'Organized Play Foil',
    standard_prestige: 'Standard Prestige',
    foil_prestige: 'Foil Prestige',
    serialized_prestige: 'Serialized Prestige',
  };

  const handleQuantityChange = (variant: keyof CardQuantities, value: string) => {
    const numValue = parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [variant]: numValue >= 0 ? numValue : 0,
    }));
  };

  const handleUpdateCard = async () => {
    // Validación básica
    if (!setCode.trim()) {
      Alert.alert('Error', 'Por favor selecciona un set');
      return;
    }

    if (!cardNumber.trim()) {
      Alert.alert('Error', 'Por favor ingresa el número de carta');
      return;
    }

    // Verificar que al menos una cantidad sea mayor a 0
    const hasQuantities = Object.values(quantities).some(qty => qty > 0);
    if (!hasQuantities) {
      Alert.alert('Error', 'Por favor ingresa al menos una cantidad mayor a 0');
      return;
    }

    setLoading(true);

    try {
      // Filtrar solo las cantidades que son mayores a 0
      const nonZeroQuantities = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .reduce((acc, [variant, qty]) => {
          acc[variant] = qty;
          return acc;
        }, {} as any);

      const response = await ApiService.updateCardQuantities(
        setCode,
        cardNumber.padStart(3, '0'),
        nonZeroQuantities
      );

      if (response.success) {
        Alert.alert(
          'Éxito',
          `Carta ${setCode}-${cardNumber.padStart(3, '0')} actualizada correctamente`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'No se pudo actualizar la carta');
      }
    } catch (error) {
      console.error('Error updating card:', error);
      Alert.alert('Error', 'Error de conexión. Verifica que el servidor esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCardNumber('');
    setQuantities({
      normal: 0,
      foil: 0,
      hyperspace: 0,
      foil_hyperspace: 0,
      showcase: 0,
      organized_play: 0,
      event_exclusive: 0,
      prerelease_promo: 0,
      organized_play_foil: 0,
      standard_prestige: 0,
      foil_prestige: 0,
      serialized_prestige: 0,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Actualizar Carta</Text>
        <Text style={styles.subtitle}>
          Busca una carta existente e indica las cantidades que posees
        </Text>

        {/* Información de la carta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identificación de la Carta</Text>
          
          <Text style={styles.label}>Set:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {sets.map((set) => (
              <TouchableOpacity
                key={set}
                style={[styles.chip, setCode === set && styles.chipSelected]}
                onPress={() => setSetCode(set)}
              >
                <Text style={[styles.chipText, setCode === set && styles.chipTextSelected]}>
                  {set}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Número de Carta:</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="ej: 001, 123"
            keyboardType="numeric"
            maxLength={3}
          />
        </View>

        {/* Cantidades por variante */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cantidades por Variante</Text>
          
          {Object.entries(variantLabels).map(([variant, label]) => (
            <View key={variant} style={styles.quantityRow}>
              <Text style={styles.quantityLabel}>{label}:</Text>
              <TextInput
                style={styles.quantityInput}
                value={quantities[variant as keyof CardQuantities].toString()}
                onChangeText={(value) => handleQuantityChange(variant as keyof CardQuantities, value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ))}
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetForm}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>Limpiar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleUpdateCard}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Actualizar Carta</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2a2a2a',
  },
  horizontalScroll: {
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  chipSelected: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  chipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#000000',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: '#2a2a2a',
    width: 80,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#444',
    borderWidth: 1,
    borderColor: '#666',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FFD700',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UpdateCardScreen;
