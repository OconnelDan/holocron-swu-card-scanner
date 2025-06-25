/**
 * Holocron SWU Card Scanner - Cliente Móvil
 * Aplicación React Native para escanear cartas de Star Wars Unlimited
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ErrorBoundary } from './src/components';
import AppNavigator from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <AppNavigator />
    </ErrorBoundary>
  );
}

export default App;
