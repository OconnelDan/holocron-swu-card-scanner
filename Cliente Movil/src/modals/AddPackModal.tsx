import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Modal from 'react-native-modal';
import { Picker } from '@react-native-picker/picker';
import { mockPacks, Pack } from '../data/exampleData';
import { useCollectionStore } from '../store/collectionStore';
import * as Progress from 'react-native-progress';

interface AddPackModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const AddPackModal: React.FC<AddPackModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<'select' | 'review' | 'opening'>('select');
  const [openedCards, setOpenedCards] = useState<any[]>([]);

  const { openPack, isOpeningPack } = useCollectionStore();

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedPack(null);
    setSelectedQuantity(1);
    setOpenedCards([]);
    onClose();
  };

  const handleSelectPack = () => {
    if (!selectedPack) {
      Alert.alert('Error', 'Por favor selecciona un pack');
      return;
    }
    setCurrentStep('review');
  };

  const handleOpenPacks = async () => {
    if (!selectedPack) return;

    setCurrentStep('opening');
    const allOpenedCards = [];

    try {
      for (let i = 0; i < selectedQuantity; i++) {
        const cards = await openPack(selectedPack.id);
        allOpenedCards.push(...cards);
      }
      setOpenedCards(allOpenedCards);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron abrir los packs');
      handleClose();
    }
  };

  const renderPackSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seleccionar Pack</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tipo de Pack:</Text>
        <Picker
          selectedValue={selectedPack?.id || ''}
          onValueChange={(itemValue) => {
            const pack = mockPacks.find(p => p.id === itemValue);
            setSelectedPack(pack || null);
          }}
          style={styles.picker}
        >
          <Picker.Item label="Selecciona un pack..." value="" />
          {mockPacks.map((pack) => (
            <Picker.Item
              key={pack.id}
              label={`${pack.name} (${pack.cardCount} cartas)`}
              value={pack.id}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Cantidad:</Text>
        <Picker
          selectedValue={selectedQuantity}
          onValueChange={setSelectedQuantity}
          style={styles.picker}
        >
          {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
            <Picker.Item
              key={num}
              label={`${num} pack${num > 1 ? 's' : ''}`}
              value={num}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, !selectedPack && styles.disabledButton]}
          onPress={handleSelectPack}
          disabled={!selectedPack}
        >
          <Text style={styles.primaryButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderReview = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Confirmar Apertura</Text>

      <View style={styles.reviewContainer}>
        <Text style={styles.reviewLabel}>Pack seleccionado:</Text>
        <Text style={styles.reviewValue}>{selectedPack?.name}</Text>

        <Text style={styles.reviewLabel}>Cantidad:</Text>
        <Text style={styles.reviewValue}>{selectedQuantity} pack{selectedQuantity > 1 ? 's' : ''}</Text>

        <Text style={styles.reviewLabel}>Total de cartas:</Text>
        <Text style={styles.reviewValue}>
          {(selectedPack?.cardCount || 0) * selectedQuantity} cartas
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => setCurrentStep('select')}
        >
          <Text style={styles.cancelButtonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryButton} onPress={handleOpenPacks}>
          <Text style={styles.primaryButtonText}>Abrir Packs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderOpening = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>
        {isOpeningPack ? 'Abriendo Packs...' : '¡Packs Abiertos!'}
      </Text>

      {isOpeningPack ? (
        <View style={styles.loadingContainer}>
          <Progress.Circle
            size={80}
            indeterminate={true}
            color="#2196F3"
          />
          <Text style={styles.loadingText}>
            Abriendo {selectedQuantity} pack{selectedQuantity > 1 ? 's' : ''}...
          </Text>
        </View>
      ) : (
        <View>
          <Text style={styles.resultsTitle}>
            Cartas obtenidas ({openedCards.length}):
          </Text>
          <ScrollView style={styles.resultsContainer}>
            {openedCards.map((card, index) => (
              <View key={index} style={styles.cardResult}>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.cardDetails}>
                  {card.setCode} #{card.cardNumber} • {card.rarity}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.primaryButton} onPress={handleClose}>
            <Text style={styles.primaryButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'select':
        return renderPackSelection();
      case 'review':
        return renderReview();
      case 'opening':
        return renderOpening();
      default:
        return renderPackSelection();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={isOpeningPack ? undefined : handleClose}
      onBackButtonPress={isOpeningPack ? undefined : handleClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        {renderCurrentStep()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  stepContainer: {
    minHeight: 200,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 10,
  },
  primaryButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  reviewContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  resultsContainer: {
    maxHeight: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  cardResult: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  cardDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
