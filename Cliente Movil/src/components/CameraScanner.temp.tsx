import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CameraScannerProps {
  onCapture: (imagePath: string) => void;
  onClose: () => void;
  style?: any;
}

const { width, height } = Dimensions.get('window');

const CameraScanner: React.FC<CameraScannerProps> = ({
  onCapture,
  onClose,
  style
}) => {
  const [flashEnabled, setFlashEnabled] = useState(false);

  const takePicture = async () => {
    try {
      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8 as PhotoQuality,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          Alert.alert('Error', response.errorMessage || 'Captura cancelada');
          return;
        }

        if (response.assets && response.assets[0]) {
          const imagePath = response.assets[0].uri;
          if (imagePath) {
            onCapture(imagePath);
          }
        }
      });
    } catch (error) {
      console.error('Error al tomar foto:', error);
      Alert.alert('Error', 'No se pudo capturar la imagen');
    }
  };

  const selectFromGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8 as PhotoQuality,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        return;
      }

      if (response.assets && response.assets[0]) {
        const imagePath = response.assets[0].uri;
        if (imagePath) {
          onCapture(imagePath);
        }
      }
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Simulación de viewfinder */}
      <View style={styles.viewfinder}>
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            <Text style={styles.scanText}>
              📱 MODO TEMPORAL: ImagePicker
            </Text>
            <Text style={styles.instructionText}>
              Usa los botones para capturar o seleccionar una imagen
            </Text>
          </View>
        </View>
      </View>

      {/* Controles de cámara */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.captureControls}>
          <TouchableOpacity
            style={styles.galleryButton}
            onPress={selectFromGallery}
          >
            <Icon name="photo-library" size={25} color="#fff" />
            <Text style={styles.buttonText}>Galería</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flashButton}
            onPress={() => setFlashEnabled(!flashEnabled)}
          >
            <Icon
              name={flashEnabled ? "flash-on" : "flash-off"}
              size={25}
              color={flashEnabled ? "#FFD700" : "#fff"}
            />
            <Text style={styles.buttonText}>Flash</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicadores */}
      <View style={styles.indicators}>
        <Text style={styles.indicatorText}>
          📸 Presiona el botón para capturar
        </Text>
        <Text style={styles.indicatorText}>
          📁 O selecciona desde galería
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.8,
    height: width * 0.8 * 1.4, // Aspect ratio de carta
    borderWidth: 2,
    borderColor: '#00FF00',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  scanText: {
    color: '#00FF00',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  captureControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  galleryButton: {
    alignItems: 'center',
    padding: 10,
  },
  flashButton: {
    alignItems: 'center',
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
  },
  indicators: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  indicatorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 2,
    opacity: 0.8,
  },
});

export default CameraScanner;
