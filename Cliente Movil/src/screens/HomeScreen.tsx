import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Holocron SWU</Text>
          <Text style={styles.subtitle}>Escáner de Cartas Star Wars Unlimited</Text>
        </View>

        {/* Main Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.scanButton]}
            onPress={() => navigation.navigate('Scan')}
          >
            <Text style={styles.actionButtonText}>📷</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonLabel}>Escanear Carta</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.collectionButton]}
            onPress={() => navigation.navigate('Collection')}
          >
            <Text style={styles.actionButtonText}>📚</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonLabel}>Mi Colección</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.addButton]}
            onPress={() => navigation.navigate('UpdateCard')}
          >
            <Text style={styles.actionButtonText}>➕</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonLabel}>Actualizar Carta</Text>
              <Text style={styles.actionButtonSubLabel}>5LOF Ready!</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.overviewButton]}
            onPress={() => navigation.navigate('CollectionOverview')}
          >
            <Text style={styles.actionButtonText}>📊</Text>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonLabel}>Resumen Colección</Text>
              <Text style={styles.actionButtonSubLabel}>Stats & Progress</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Statistics Preview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Estadísticas Rápidas</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Cartas Totales</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Cartas Únicas</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>🔍 Buscar Cartas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>⚙️ Configuración</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem}>
            <Text style={styles.quickActionText}>ℹ️ Acerca de</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'column',
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#1E88E5',
  },
  collectionButton: {
    backgroundColor: '#43A047',
  },
  addButton: {
    backgroundColor: '#27ae60',
  },
  overviewButton: {
    backgroundColor: '#9C27B0',
  },
  actionButtonText: {
    fontSize: 40,
    marginRight: 15,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSubLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 5,
  },
  quickActionsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
  },
  quickActionItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default HomeScreen;
