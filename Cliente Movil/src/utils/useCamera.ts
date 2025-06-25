import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { ScanResult, Card } from '../types';
import CameraService from '../services/camera';

interface UseCameraReturn {
  isScanning: boolean;
  scanResult: ScanResult | null;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  scanWithCamera: () => Promise<void>;
  scanFromGallery: () => Promise<void>;
  clearResult: () => void;
}

export const useCamera = (): UseCameraReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await Camera.requestCameraPermission();
      const granted = permission === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }, []);

  const scanWithCamera = useCallback(async () => {
    try {
      setIsScanning(true);

      const result = await CameraService.scanCard();

      if (result) {
        setScanResult(result);
        if (result.card) {
          Alert.alert(
            'Carta Detectada',
            `Se encontró: ${result.card.name}\nConfianza: ${(result.confidence * 100).toFixed(1)}%`
          );
        } else {
          Alert.alert('No se encontró carta', 'Intenta con mejor iluminación o ángulo.');
        }
      }
    } catch (error) {
      console.error('Error scanning card:', error);
      Alert.alert('Error', 'Ocurrió un error al escanear la carta');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const scanFromGallery = useCallback(async () => {
    try {
      setIsScanning(true);

      const imageBase64 = await CameraService.selectImageFromGallery();

      if (imageBase64) {
        // Simular procesamiento de imagen desde galería
        const mockResult: ScanResult = {
          card: {
            id: 'gallery-card',
            name: 'Carta desde Galería',
            set: 'Shadows of the Galaxy',
            number: 'SHD002',
            rarity: 'Uncommon',
            type: 'Event',
            cost: 2,
            aspects: ['Cunning'],
            traits: ['Trick'],
          },
          confidence: 0.75,
          processingTime: 800,
          imageBase64
        };

        setScanResult(mockResult);
        Alert.alert(
          'Carta Detectada',
          `Se encontró: ${mockResult.card!.name}\nConfianza: ${(mockResult.confidence * 100).toFixed(1)}%`
        );
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setScanResult(null);
  }, []);

  return {
    isScanning,
    scanResult,
    hasPermission,
    requestPermission,
    scanWithCamera,
    scanFromGallery,
    clearResult,
  };
};
