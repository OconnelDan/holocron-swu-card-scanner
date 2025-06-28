import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Card } from '../types';

// Importaremos las pantallas cuando las creemos
import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import CollectionScreen from '../screens/CollectionScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import UpdateCardScreen from '../screens/UpdateCardScreen';

// Definir tipos para la navegación
export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
  Collection: undefined;
  CardDetail: { card: Card };
  UpdateCard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a1a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Holocron SWU Scanner',
            headerStyle: {
              backgroundColor: '#000000',
            },
          }}
        />
        <Stack.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            title: 'Escanear Carta',
          }}
        />
        <Stack.Screen
          name="Collection"
          component={CollectionScreen}
          options={{
            title: 'Mi Colección',
          }}
        />
        <Stack.Screen
          name="CardDetail"
          component={CardDetailScreen}
          options={{
            title: 'Detalle de Carta',
          }}
        />
        <Stack.Screen
          name="UpdateCard"
          component={UpdateCardScreen}
          options={{
            title: 'Actualizar Carta',
            headerStyle: {
              backgroundColor: '#27ae60',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
