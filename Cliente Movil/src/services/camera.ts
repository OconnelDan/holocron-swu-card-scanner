// TODO: Reactivar cuando se reintegre react-native-vision-camera
// import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { ScanResult, CameraConfig } from '../types';
import { apiService } from './apiService';

class CameraService {
  private config: CameraConfig = {
    quality: 'high',
    format: 'jpg',
    enableTorch: false,
    autoFocus: true,
  };

  // Configurar la cámara
  setConfig(config: Partial<CameraConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Obtener configuración actual
  getConfig(): CameraConfig {
    return { ...this.config };
  }

  // Verificar permisos de cámara
  async checkCameraPermissions(): Promise<boolean> {
    try {
      // TODO: Reactivar cuando se reintegre react-native-vision-camera
      // const permission = await Camera.getCameraPermissionStatus();
      // if (permission === 'granted') {
      //   return true;
      // }

      // const newPermission = await Camera.requestCameraPermission();
      // return newPermission === 'granted';
      
      // Temporalmente devolver true para evitar errores
      console.warn('Camera permissions check disabled - using image picker only');
      return true;
    } catch (error) {
      console.error('Error checking camera permissions:', error);
      return false;
    }
  };

  // Tomar foto para escanear carta
  async captureCardImage(): Promise<string | null> {
    try {
      const hasPermission = await this.checkCameraPermissions();
      if (!hasPermission) {
        throw new Error('Permiso de cámara denegado');
      }

      // Por ahora utilizaremos el image picker como fallback
      // En el futuro implementaremos captura directa con vision-camera
      return await this.selectImageFromGallery();
    } catch (error) {
      console.error('Error capturing image:', error);
      return null;
    }
  }

  // Seleccionar imagen de la galería
  async selectImageFromGallery(): Promise<string | null> {
    return new Promise((resolve) => {
      const options = {
        mediaType: 'photo' as MediaType,
        quality: (this.config.quality === 'high' ? 1 : this.config.quality === 'medium' ? 0.7 : 0.5) as 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1,
        includeBase64: true,
        maxWidth: 1024,
        maxHeight: 1024,
      };

      launchImageLibrary(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          resolve(null);
          return;
        }

        if (response.assets && response.assets[0] && response.assets[0].base64) {
          resolve(response.assets[0].base64);
        } else {
          resolve(null);
        }
      });
    });
  }

  // Procesar imagen para escanear carta
  async processImageForScan(imageBase64: string): Promise<ScanResult> {
    try {
      const startTime = Date.now();

      // TODO: Implementar escaneo de cartas cuando se reintegre la funcionalidad de cámara
      // const response = await apiService.scanCard(imageBase64);
      
      const processingTime = Date.now() - startTime;
      
      // Funcionalidad de escaneo temporalmente deshabilitada
      return {
        card: null,
        confidence: 0,
        processingTime,
        imageBase64,
      };

      /* 
      if (response.success && response.data) {
        return {
          ...response.data,
          processingTime,
          imageBase64,
        };
      } else {
        return {
          card: null,
          confidence: 0,
          processingTime,
          imageBase64,
        };
      }
      */
    } catch (error) {
      console.error('Error processing image:', error);
      return {
        card: null,
        confidence: 0,
        processingTime: 0,
        imageBase64,
      };
    }
  }

  // Escanear carta completo (capturar + procesar)
  async scanCard(): Promise<ScanResult | null> {
    try {
      const imageBase64 = await this.captureCardImage();
      if (!imageBase64) {
        return null;
      }

      return await this.processImageForScan(imageBase64);
    } catch (error) {
      console.error('Error scanning card:', error);
      return null;
    }
  }

  // Obtener dispositivos de cámara disponibles (para futuro uso)
  async getAvailableCameraDevices(): Promise<any[]> {
    try {
      // Esto se implementará cuando integremos completamente vision-camera
      return [];
    } catch (error) {
      console.error('Error getting camera devices:', error);
      return [];
    }
  }
}

export default new CameraService();
