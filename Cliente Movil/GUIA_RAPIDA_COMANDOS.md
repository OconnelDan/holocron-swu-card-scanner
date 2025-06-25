# ⚡ Guía Rápida de Comandos - Holocron SWU

## 🚀 **Comandos de Desarrollo Diario**

### Metro Bundler (Terminal 1)
```bash
# Iniciar servidor de desarrollo
npm start

# Limpiar cache si hay problemas
npm run reset-cache
```

### Android (Terminal 2)
```bash
# Ejecutar en dispositivo/emulador Android
npm run android

# Logs en tiempo real
npm run log-android

# Limpiar build si hay errores
npm run clean-android
```

### Verificación del Entorno
```bash
# Verificar configuración completa
npm run doctor

# Información del sistema
npm run info

# Verificar errores de lint
npm run lint
```

### Limpieza y Mantenimiento
```bash
# Limpiar cache Metro
npm run clean

# Reinstalar dependencias completo
npm run clean-install

# Limpiar específicamente Android
npm run clean-android
```

## 📱 **Flujo de Desarrollo Típico**

### Primera vez del día:
```bash
cd "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil"
npm start          # Terminal 1
npm run android    # Terminal 2 (nueva ventana)
```

### Si hay problemas:
```bash
npm run reset-cache  # Limpiar Metro
npm run clean-android # Limpiar Android
npm run doctor       # Verificar entorno
```

## 🔧 **Estructura de Archivos Clave**

```
src/
├── components/     # Componentes reutilizables
├── screens/       # Pantallas principales
├── navigation/    # Configuración de navegación
├── services/      # API, Storage, Camera
├── types/         # Tipos TypeScript
├── utils/         # Utilidades y hooks
└── assets/        # Imágenes y recursos
```

## 📝 **Comandos de Edición Comunes**

### VS Code:
- `Ctrl+Shift+P` → "React Native: Start Packager"
- `Ctrl+Shift+P` → "React Native: Run Android"
- `F5` → Debugging con React Native Tools

### Android Studio:
- `AVD Manager` → Crear/ejecutar emuladores
- `Device Manager` → Ver dispositivos conectados

## 🎯 **Próximo Objetivo**

1. **Configurar Android Studio** (30 min)
2. **Ejecutar `npm run android`** (primera vez)
3. **Ver la app funcionando** en dispositivo real

---

**Estado actual**: ✅ Código listo | ⚠️ Pendiente: Configuración Android
