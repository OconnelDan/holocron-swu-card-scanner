import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CameraScannerProps {
  onCapture: (imagePath: string) => void;
  onClose: () => void;
}

const CameraScanner: React.FC<CameraScannerProps> = ({ onClose }) => {
  const handleTempCapture = () => {
    Alert.alert(
      'Funcionalidad Temporalmente Deshabilitada',
      'La funcionalidad de escaneo de cartas está temporalmente deshabilitada mientras se estabiliza la aplicación.',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Escáner de Cartas</Text>
      </View>
      
      <View style={styles.content}>
        <Icon name="camera-alt" size={100} color="#666" />
        <Text style={styles.message}>
          Funcionalidad de escáner temporalmente deshabilitada
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleTempCapture}
        >
          <Text style={styles.buttonText}>Entendido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 10,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 44, // Para compensar el botón de cerrar
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScanner;
