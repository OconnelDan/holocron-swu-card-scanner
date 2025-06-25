import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button, CameraScanner } from '../components';
import CameraService from '../services/camera';
import StorageService from '../services/storage';
import { ScanResult } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Scan'>;

const ScanScreen: React.FC<Props> = ({ navigation }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleScan = async () => {
    try {
      setIsScanning(true);

      const result = await CameraService.scanCard();

      if (result) {
        setScanResult(result);
        if (result.card) {
          Alert.alert(
            'Carta Detectada',
            `Se encontró: ${result.card.name}\nConfianza: ${(result.confidence * 100).toFixed(1)}%`,
            [
              {
                text: 'Ver Detalles',
                onPress: () => navigation.navigate('CardDetail', { card: result.card! }),
              },
              {
                text: 'Agregar a Colección',
                onPress: () => handleAddToCollection(result.card!),
              },
              { text: 'Cerrar', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert(
            'No se encontró carta',
            'No se pudo identificar ninguna carta en la imagen. Intenta con mejor iluminación o una imagen más clara.',
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', 'No se pudo procesar la imagen');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al escanear la carta');
    } finally {
      setIsScanning(false);
    }
  };
  const handleAddToCollection = async (card: any) => {
    try {
      await StorageService.addCardToCollection(card, 1);
      Alert.alert('Éxito', 'Carta agregada a tu colección');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la carta a la colección');
    }
  };

  const handleCameraCapture = async (imagePath: string) => {
    try {
      setShowCamera(false);
      setIsScanning(true);      // Aquí procesarías la imagen capturada
      // Por ahora simulamos el resultado
      const mockResult: ScanResult = {
        card: {
          id: 'mock-id',
          name: 'Carta Escaneada',
          set: 'Shadows of the Galaxy',
          number: 'SHD001',
          rarity: 'Common',
          type: 'Unit',
          cost: 3,
          power: 2,
          hp: 4,
          aspects: ['Heroism'],
          traits: ['Rebel'],
          imageUrl: imagePath
        },
        confidence: 0.85,
        processingTime: 1200,
        imageBase64: undefined
      };

      setScanResult(mockResult);

      Alert.alert(
        'Carta Detectada',
        `Se encontró: ${mockResult.card!.name}\nConfianza: ${(mockResult.confidence * 100).toFixed(1)}%`,
        [
          {
            text: 'Ver Detalles',
            onPress: () => navigation.navigate('CardDetail', { card: mockResult.card! }),
          },
          {
            text: 'Agregar a Colección',
            onPress: () => handleAddToCollection(mockResult.card!),
          },
          { text: 'Cerrar', style: 'cancel' },
        ]
      );

    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setIsScanning(false);
    }
  };

  const openCamera = () => {
    setShowCamera(true);
  };

  const closeCamera = () => {
    setShowCamera(false);
  };

  const handleSelectFromGallery = async () => {
    try {
      setIsScanning(true);

      const imageBase64 = await CameraService.selectImageFromGallery();
      if (imageBase64) {
        const result = await CameraService.processImageForScan(imageBase64);
        setScanResult(result);

        if (result.card) {
          Alert.alert(
            'Carta Detectada',
            `Se encontró: ${result.card.name}\nConfianza: ${(result.confidence * 100).toFixed(1)}%`,
            [
              {
                text: 'Ver Detalles',
                onPress: () => navigation.navigate('CardDetail', { card: result.card! }),
              },
              {
                text: 'Agregar a Colección',
                onPress: () => handleAddToCollection(result.card!),
              },
              { text: 'Cerrar', style: 'cancel' },
            ]
          );
        } else {
          Alert.alert('No se encontró carta', 'No se pudo identificar ninguna carta en la imagen');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar la imagen');
    } finally {
      setIsScanning(false);
    }
  };
  return (
    <>
      {showCamera ? (
        <CameraScanner
          onCapture={handleCameraCapture}
          onClose={closeCamera}
        />
      ) : (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            {/* Instrucciones */}
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>¿Cómo escanear?</Text>
              <Text style={styles.instructionsText}>
                1. Asegúrate de tener buena iluminación{'\n'}
                2. Coloca la carta sobre una superficie plana{'\n'}
                3. Toma la foto o selecciona una imagen{'\n'}
                4. ¡Espera los resultados!
              </Text>
            </View>        {/* Botones de acción */}
            <View style={styles.actionsContainer}>
              <Button
                title="📷 Abrir Cámara"
                onPress={openCamera}
                disabled={isScanning}
                variant="primary"
                size="large"
                style={styles.actionButton}
              />

              <Button
                title="🖼️ Seleccionar de Galería"
                onPress={handleSelectFromGallery}
                disabled={isScanning}
                variant="secondary"
                size="large"
                style={styles.actionButton}
              />

              <Button
                title="📤 Método Alternativo"
                onPress={handleScan}
                disabled={isScanning}
                variant="outline"
                size="large"
                style={styles.actionButton}
              />
            </View>

            {/* Indicador de carga */}
            {isScanning && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Procesando imagen...</Text>
              </View>
            )}

            {/* Resultado del escaneo */}
            {scanResult && scanResult.imageBase64 && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Última imagen escaneada:</Text>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${scanResult.imageBase64}` }}
                  style={styles.scannedImage}
                  resizeMode="contain"
                />
                {scanResult.card ? (
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{scanResult.card.name}</Text>
                    <Text style={styles.cardDetails}>
                      Set: {scanResult.card.set} | Número: {scanResult.card.number}
                    </Text>
                    <Text style={styles.confidence}>
                      Confianza: {(scanResult.confidence * 100).toFixed(1)}%
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noCardText}>No se detectó ninguna carta</Text>
                )}
              </View>
            )}

            {/* Consejos */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Consejos para mejores resultados</Text>
              <Text style={styles.tipsText}>
                • Evita reflejos y sombras{'\n'}
                • Usa suficiente luz natural{'\n'}
                • Mantén la carta completa en el encuadre{'\n'}            • Asegúrate de que la imagen esté enfocada
              </Text>
            </View>
          </ScrollView>
        </View>
      )}
    </>
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
  instructionsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  cameraButton: {
    backgroundColor: '#1E88E5',
  },
  galleryButton: {
    backgroundColor: '#43A047',
  },
  actionButtonIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#FFD700',
    fontSize: 16,
    marginTop: 10,
  },
  resultContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  scannedImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardInfo: {
    alignItems: 'center',
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  confidence: {
    fontSize: 14,
    color: '#4CAF50',
  },
  noCardText: {
    fontSize: 16,
    color: '#FF5722',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});

export default ScanScreen;
