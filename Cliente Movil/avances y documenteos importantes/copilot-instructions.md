# Copilot Instructions - Holocron SWU Card Scanner

## Descripción del Proyecto
Esta es una aplicación móvil React Native con TypeScript para escanear cartas de Star Wars Unlimited. La aplicación permite a los usuarios:
- Escanear cartas usando la cámara del dispositivo
- Identificar cartas mediante IA/ML
- Gestionar su colección personal
- Sincronizar con un backend (localhost:3000)

## Stack Tecnológico
- **React Native 0.80.0** con TypeScript
- **React Navigation** para navegación entre pantallas
- **react-native-vision-camera** para captura de imágenes
- **AsyncStorage** para almacenamiento local
- **Axios** para comunicación con backend
- **react-native-image-picker** para selección de imágenes

## Estructura del Proyecto

```
src/
├── components/         # Componentes reutilizables
├── screens/           # Pantallas principales de la app
│   ├── HomeScreen.tsx         # Pantalla principal
│   ├── ScanScreen.tsx         # Pantalla de escaneo
│   ├── CollectionScreen.tsx   # Pantalla de colección
│   └── CardDetailScreen.tsx   # Detalle de carta
├── navigation/        # Configuración de navegación
│   └── AppNavigator.tsx       # Navegador principal
├── services/          # Servicios para API y datos
│   ├── api.ts                 # Cliente HTTP para backend
│   ├── camera.ts              # Servicio de cámara
│   └── storage.ts             # Almacenamiento local
├── types/             # Definiciones TypeScript
│   └── index.ts               # Tipos principales
├── utils/             # Utilidades y helpers
│   └── index.ts               # Funciones de utilidad
└── assets/            # Recursos estáticos
```

## Patrones de Código

### Componentes de Pantalla
- Usar TypeScript estricto con tipos de navegación
- Implementar manejo de errores con Alert
- Usar StyleSheet para estilos
- Implementar estados de carga y error

### Servicios
- Singleton pattern para servicios
- Manejo de errores asíncrono con try/catch
- Retornar objetos ApiResponse tipados
- Logging para debugging

### Tipos TypeScript
- Interfaces para entidades (Card, UserCollection, etc.)
- Tipos para respuestas API
- Parámetros de navegación tipados

## Convenciones de Estilo

### Colores
- **Primario**: #FFD700 (dorado Star Wars)
- **Fondo**: #000000 (negro)
- **Secundario**: #1A1A1A (gris oscuro)
- **Texto**: #FFFFFF (blanco)
- **Texto secundario**: #CCCCCC (gris claro)
- **Acento azul**: #1E88E5
- **Acento verde**: #43A047
- **Error**: #FF5722

### Espaciado
- Padding containers: 20px
- Margin entre elementos: 10-30px
- Border radius: 15px para containers, 10px para elementos

### Tipografía
- Títulos principales: 24-32px, bold
- Subtítulos: 18px, bold
- Texto normal: 16px
- Texto pequeño: 14px
- Labels: 12px

## Backend Integration
- **Base URL**: http://localhost:3000/api
- **Endpoints**:
  - POST /scan - Escanear carta
  - GET /cards/search - Buscar cartas
  - GET /cards/:id - Obtener carta específica
  - POST /collection/sync - Sincronizar colección
  - GET /health - Estado del servidor

## Funcionalidades Futuras
- Integración completa con TensorFlow Lite
- Autenticación de usuarios
- Sincronización en la nube
- Marketplace de cartas
- Estadísticas avanzadas
- Filtros y búsqueda avanzada

## Comandos Importantes
- `npm start` - Iniciar Metro bundler
- `npm run android` - Ejecutar en Android
- `npm run ios` - Ejecutar en iOS (requiere Mac)
- `npm run lint` - Ejecutar linter
- `npm test` - Ejecutar pruebas

## Notas de Desarrollo
- Siempre usar tipos TypeScript estrictos
- Implementar manejo de errores robusto
- Optimizar rendimiento para dispositivos móviles
- Seguir patrones React Native establecidos
- Documentar funciones complejas
- Usar async/await para operaciones asíncronas
