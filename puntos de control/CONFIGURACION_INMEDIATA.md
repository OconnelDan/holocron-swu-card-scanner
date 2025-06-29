# 🎯 CONFIGURACIÓN INMEDIATA - Android Studio

## ✅ **ESTADO DETECTADO**
- ✅ Android Studio instalado en: `C:\Program Files\Android\Android Studio`
- ✅ JDK instalado correctamente
- ❌ Android SDK pendiente de configuración inicial

## 🚀 **PASOS INMEDIATOS (10 minutos)**

### 1. 📱 **Ejecutar Android Studio por Primera Vez**

1. **Abre Android Studio** desde el menú de Windows
2. En la pantalla de bienvenida:
   - ✅ Acepta los términos y condiciones
   - ✅ Selecciona **"Standard"** installation
   - ✅ **MUY IMPORTANTE**: Asegúrate de que estén marcados:
     - ☑️ Android SDK
     - ☑️ Android SDK Platform-Tools
     - ☑️ Performance (Intel ® HAXM)
     - ☑️ Android Virtual Device
3. Click **"Next"** hasta que comience la descarga
4. **ESPERA** a que termine la descarga (puede tomar 5-10 minutos)

### 2. 🔧 **Verificar la Instalación del SDK**

Una vez que Android Studio termine la configuración inicial:

1. Ve a **File → Settings** (o usa `Ctrl+Alt+S`)
2. En el panel izquierdo busca **"Android SDK"**
3. **Anota la ruta** que aparece en **"Android SDK Location"**
   - Normalmente será: `C:\Users\oconn\AppData\Local\Android\Sdk`

### 3. 🌍 **Configurar Variables de Entorno**

1. **Abrir Variables de Entorno**:
   - Presiona `Win + R`
   - Escribe `sysdm.cpl` y presiona Enter
   - Click en **"Variables de entorno"**

2. **Crear ANDROID_HOME**:
   - En **"Variables del sistema"** click **"Nuevo"**
   - **Nombre**: `ANDROID_HOME`
   - **Valor**: `C:\Users\oconn\AppData\Local\Android\Sdk` (la ruta real que viste)

3. **Actualizar PATH**:
   - Selecciona **"Path"** en Variables del sistema
   - Click **"Editar"**
   - Click **"Nuevo"** y agrega: `%ANDROID_HOME%\platform-tools`
   - Click **"Nuevo"** y agrega: `%ANDROID_HOME%\tools`

### 4. 📱 **Crear Emulador (Opcional pero Recomendado)**

1. En Android Studio: **Tools → AVD Manager**
2. Click **"Create Virtual Device"**
3. Selecciona **"Pixel 6"** o **"Pixel 7"**
4. Selecciona **API Level 34** (Android 14) o **API Level 33**
5. Click **"Next"** → **"Finish"**

### 5. ✅ **Verificar Todo Funciona**

1. **Reinicia PowerShell** (IMPORTANTE)
2. Ejecuta:
```bash
npm run doctor
```

Deberías ver:
- ✅ Android SDK
- ✅ Adb
- ✅ JDK

### 6. 🚀 **¡EJECUTAR LA APP!**

Si todo está bien:

```bash
# Terminal 1: Metro Bundler (ya corriendo)
npm start

# Terminal 2: Nueva ventana de PowerShell
npm run android
```

## 🎯 **RESULTADO ESPERADO**

1. ✅ Se abre el emulador Android (o conecta un dispositivo real)
2. ✅ La app **"HolocronSWUMobile"** se instala automáticamente
3. ✅ Ves la pantalla principal con botones:
   - 📷 Escanear Carta
   - 📚 Ver Colección
   - ⚙️ Configuración
4. ✅ Puedes navegar entre pantallas

## 🆘 **SI ALGO FALLA**

### Error común: "No devices found"
```bash
# Crear y iniciar emulador:
# Tools → AVD Manager → ▶️ (play button)
```

### Error: "adb not found"
```bash
# Verificar que el PATH incluya platform-tools:
echo $env:PATH | findstr platform-tools
```

### Error: "SDK not found"
```bash
# Verificar ANDROID_HOME:
echo $env:ANDROID_HOME
```

---

## ⏱️ **TIEMPO TOTAL**: 10-15 minutos
## 🎯 **RESULTADO**: App React Native funcionando en emulador Android

¡Una vez completado, tendrás la app real funcionando con navegación, cámara (con permisos), y toda la funcionalidad implementada!
