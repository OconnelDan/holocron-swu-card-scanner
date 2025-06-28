import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type SetDetailsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SetDetails'
>;
type SetDetailsScreenRouteProp = RouteProp<RootStackParamList, 'SetDetails'>;

interface Props {
  navigation: SetDetailsScreenNavigationProp;
  route: SetDetailsScreenRouteProp;
}

export const SetDetailsScreen: React.FC<Props> = ({ route }) => {
  const { setCode } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Detalles del Set: {setCode}</Text>
        <Text style={styles.subtitle}>
          Esta pantalla mostrará los detalles específicos del set seleccionado.
        </Text>
        <Text style={styles.description}>
          Aquí se implementará:
          {'\n'}- Lista de cartas del set
          {'\n'}- Progreso detallado por rareza
          {'\n'}- Estadísticas específicas del set
          {'\n'}- Funcionalidad de búsqueda y filtros
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});
