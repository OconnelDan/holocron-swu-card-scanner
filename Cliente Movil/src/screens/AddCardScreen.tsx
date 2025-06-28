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

const AddCardScreen: React.FC = () => {
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

  const handleInputChange = (field: keyof NewCardData, value: string | number) => {
    setCardData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateCard = (): boolean => {
    if (!cardData.name.trim()) {
      Alert.alert('Error', 'El nombre de la carta es obligatorio');
      return false;
    }
    if (!cardData.setCode.trim()) {
      Alert.alert('Error', 'El código del set es obligatorio');
      return false;
    }
    if (!cardData.cardNumber.trim()) {
      Alert.alert('Error', 'El número de carta es obligatorio');
      return false;
    }
    if (!cardData.aspect1.trim()) {
      Alert.alert('Error', 'Al menos un aspecto es obligatorio');
      return false;
    }
    return true;
  };

  const handleSaveCard = async () => {
    if (!validateCard()) return;

    setLoading(true);
    try {
      // Preparar datos para enviar al backend
      const cardToSave = {
        swudbId: `${cardData.setCode}-${cardData.cardNumber}`,
        name: cardData.name,
        setCode: cardData.setCode,
        cardNumber: cardData.cardNumber,
        rarity: cardData.rarity,
        type: cardData.type,
        aspect1: cardData.aspect1,
        aspect2: cardData.aspect2 || undefined,
        cost: cardData.cost || undefined,
        traits: cardData.traits || '',
        arena: cardData.arena || undefined,
        copies: cardData.copies,
        variants: {
          normal: cardData.copies,
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
        },
      };

      // Aquí llamarías a la API para guardar la carta
      // await ApiService.addCard(cardToSave);

      Alert.alert(
        'Éxito',
        `Carta "${cardData.name}" añadida correctamente`,
        [
          {
            text: 'Añadir otra',
            onPress: () => {
              setCardData({
                name: '',
                setCode: '5LOF',
                cardNumber: '',
                rarity: 'Común',
                type: 'Unidad',
                aspect1: '',
                aspect2: '',
                cost: 0,
                traits: '',
                arena: '',
                copies: 1,
              });
            }
          },
          {
            text: 'Volver',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la carta. Inténtalo de nuevo.');
      console.error('Error saving card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Añadir Nueva Carta</Text>
        <Text style={styles.subtitle}>Especialmente para la colección 5LOF</Text>
      </View>

      <View style={styles.form}>
        {/* Nombre de la carta */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la Carta *</Text>
          <TextInput
            style={styles.input}
            value={cardData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Ej: Luke Skywalker"
            placeholderTextColor="#999"
          />
        </View>

        {/* Set y Número */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>Set *</Text>
            <TextInput
              style={styles.input}
              value={cardData.setCode}
              onChangeText={(value) => handleInputChange('setCode', value.toUpperCase())}
              placeholder="5LOF"
              placeholderTextColor="#999"
              maxLength={4}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>Número *</Text>
            <TextInput
              style={styles.input}
              value={cardData.cardNumber}
              onChangeText={(value) => handleInputChange('cardNumber', value)}
              placeholder="001"
              placeholderTextColor="#999"
              maxLength={3}
            />
          </View>
        </View>

        {/* Rareza */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Rareza</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonRow}>
              {rarities.map((rarity) => (
                <TouchableOpacity
                  key={rarity}
                  style={[
                    styles.optionButton,
                    cardData.rarity === rarity && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('rarity', rarity)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    cardData.rarity === rarity && styles.optionButtonTextSelected
                  ]}>
                    {rarity}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Tipo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonRow}>
              {types.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionButton,
                    cardData.type === type && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('type', type)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    cardData.type === type && styles.optionButtonTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Aspectos */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aspecto Principal *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonRow}>
              {aspects.map((aspect) => (
                <TouchableOpacity
                  key={aspect}
                  style={[
                    styles.optionButton,
                    cardData.aspect1 === aspect && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('aspect1', aspect)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    cardData.aspect1 === aspect && styles.optionButtonTextSelected
                  ]}>
                    {aspect}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Aspecto Secundario (opcional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  !cardData.aspect2 && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange('aspect2', '')}
              >
                <Text style={[
                  styles.optionButtonText,
                  !cardData.aspect2 && styles.optionButtonTextSelected
                ]}>
                  Ninguno
                </Text>
              </TouchableOpacity>
              {aspects.map((aspect) => (
                <TouchableOpacity
                  key={aspect}
                  style={[
                    styles.optionButton,
                    cardData.aspect2 === aspect && styles.optionButtonSelected
                  ]}
                  onPress={() => handleInputChange('aspect2', aspect)}
                >
                  <Text style={[
                    styles.optionButtonText,
                    cardData.aspect2 === aspect && styles.optionButtonTextSelected
                  ]}>
                    {aspect}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Costo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Costo</Text>
          <TextInput
            style={styles.input}
            value={cardData.cost?.toString() || ''}
            onChangeText={(value) => handleInputChange('cost', parseInt(value) || 0)}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Traits */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Traits (separados por comas)</Text>
          <TextInput
            style={styles.input}
            value={cardData.traits}
            onChangeText={(value) => handleInputChange('traits', value)}
            placeholder="Ej: Jedi, Leader, Force"
            placeholderTextColor="#999"
            multiline
          />
        </View>

        {/* Arena */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Arena</Text>
          <View style={styles.buttonRow}>
            {arenas.map((arena, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  cardData.arena === arena && styles.optionButtonSelected
                ]}
                onPress={() => handleInputChange('arena', arena)}
              >
                <Text style={[
                  styles.optionButtonText,
                  cardData.arena === arena && styles.optionButtonTextSelected
                ]}>
                  {arena || 'Ninguna'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cantidad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cantidad que posees</Text>
          <TextInput
            style={styles.input}
            value={cardData.copies.toString()}
            onChangeText={(value) => handleInputChange('copies', parseInt(value) || 1)}
            placeholder="1"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Botón Guardar */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveCard}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Carta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#2c3e50',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#bdc3c7',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#2c3e50',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#3498db',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  optionButtonTextSelected: {
    color: '#ffffff',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddCardScreen;
