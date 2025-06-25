/**
 * Holocron SWU Card Scanner - Cliente Móvil (Versión Simplificada)
 * Versión temporal sin react-native-screens para probar integración con backend
 *
 * @format
 */

import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import { ErrorBoundary } from './src/components';
import SimpleCollectionScreen from './src/screens/SimpleCollectionScreen';

function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.container}>
        <SimpleCollectionScreen />
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;
