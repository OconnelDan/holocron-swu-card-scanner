# Holocron SWU Card Scanner - Cliente Móvil

Este es el cliente móvil para el escáner de cartas de Star Wars Unlimited, construido con [**React Native**](https://reactnative.dev) y TypeScript.

## Características

- 📱 Aplicación móvil multiplataforma (iOS y Android)
- 📷 Escáner de cartas usando cámara con IA
- 🔍 Reconocimiento de cartas Star Wars Unlimited
- 💾 Almacenamiento local de colecciones
- 🌐 Integración con backend para sincronización
- 🎨 Interfaz moderna y responsiva

## Primeros Pasos

> **Nota**: Asegúrate de haber completado la [Configuración del Entorno](https://reactnative.dev/docs/set-up-your-environment) antes de continuar.

### Paso 1: Iniciar Metro

Primero, necesitarás ejecutar **Metro**, la herramienta de construcción de JavaScript para React Native.

Para iniciar el servidor de desarrollo de Metro, ejecuta el siguiente comando desde la raíz de tu proyecto React Native:

```sh
# Usando npm
npm start

# O usando Yarn
yarn start
```

### Paso 2: Construir y ejecutar tu aplicación

Con Metro ejecutándose, abre una nueva ventana/panel de terminal desde la raíz de tu proyecto React Native, y usa uno de los siguientes comandos para construir y ejecutar tu aplicación Android o iOS:

#### Android

```sh
# Usando npm
npm run android

# O usando Yarn
yarn android
```

#### iOS

Para iOS, recuerda instalar las dependencias de CocoaPods (esto solo necesita ejecutarse en el primer clon o después de actualizar dependencias nativas).

La primera vez que crees un nuevo proyecto, ejecuta el Ruby bundler para instalar CocoaPods:

```sh
bundle install
```

Luego, y cada vez que actualices tus dependencias nativas, ejecuta:

```sh
bundle exec pod install
```

Para más información, visita la [Guía de Inicio de CocoaPods](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Usando npm
npm run ios

# O usando Yarn
yarn ios
```

Si todo está configurado correctamente, deberías ver tu nueva aplicación ejecutándose en el Emulador de Android, Simulador de iOS, o tu dispositivo conectado.

Esta es una forma de ejecutar tu aplicación — también puedes construirla directamente desde Android Studio o Xcode.

### Paso 3: Modificar tu aplicación

¡Ahora que has ejecutado exitosamente la aplicación, hagamos algunos cambios!

Abre `App.tsx` en tu editor de texto preferido y haz algunos cambios. Cuando guardes, tu aplicación se actualizará automáticamente y reflejará estos cambios — esto está impulsado por [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

Cuando quieras recargar forzosamente, por ejemplo para resetear el estado de tu aplicación, puedes realizar una recarga completa:

- **Android**: Presiona la tecla R dos veces o selecciona "Reload" desde el Dev Menu, accesible via Ctrl + M (Windows/Linux) o Cmd ⌘ + M (macOS).
- **iOS**: Presiona R en el Simulador de iOS.

### ¡Felicitaciones! 🎉

Has ejecutado y modificado exitosamente tu aplicación React Native. 🎉

#### ¿Qué sigue?

- Si quieres agregar este nuevo código React Native a una aplicación existente, revisa la [Guía de Integración](https://reactnative.dev/docs/integration-with-existing-apps).
- Si tienes curiosidad de aprender más sobre React Native, revisa la [documentación](https://reactnative.dev/docs/getting-started).

## Dependencias del Proyecto

### Principales

- **react-native-vision-camera**: Para captura y procesamiento de imágenes de cartas
- **@react-navigation/native**: Sistema de navegación entre pantallas
- **@react-native-async-storage/async-storage**: Almacenamiento local persistente
- **react-native-vector-icons**: Iconografía de la aplicación

### Desarrollo

- **TypeScript**: Tipado estático para mejor desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo automático de código
- **Jest**: Framework de testing

## Estructura del Proyecto

```text
src/
├── components/         # Componentes reutilizables
├── screens/           # Pantallas de la aplicación
├── navigation/        # Configuración de navegación
├── services/          # Servicios para API y ML
├── types/             # Definiciones de TypeScript
├── utils/             # Utilidades y helpers
└── assets/            # Imágenes, iconos, etc.
```

## Scripts Disponibles

- `npm start`: Inicia Metro bundler
- `npm run android`: Ejecuta la app en Android
- `npm run ios`: Ejecuta la app en iOS
- `npm run lint`: Ejecuta el linter
- `npm test`: Ejecuta las pruebas

## Solución de Problemas

Si tienes problemas para que los pasos anteriores funcionen, consulta la página de [Solución de Problemas](https://reactnative.dev/docs/troubleshooting).

## Aprende Más

Para aprender más sobre React Native, echa un vistazo a los siguientes recursos:

- [Sitio Web de React Native](https://reactnative.dev) - aprende más sobre React Native.
- [Primeros Pasos](https://reactnative.dev/docs/environment-setup) - una visión general de React Native y cómo configurar tu entorno.
- [Aprende lo Básico](https://reactnative.dev/docs/getting-started) - un tour guiado de los conceptos básicos de React Native.
- [Blog](https://reactnative.dev/blog) - lee las últimas publicaciones oficiales del Blog de React Native.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - el repositorio de GitHub de código abierto para React Native.
