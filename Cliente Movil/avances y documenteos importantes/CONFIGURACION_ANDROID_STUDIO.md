# 🚀 CONFIGURACIÓN ANDROID STUDIO - PASO A PASO

## ✅ **ESTADO ACTUAL**
- ✅ JDK instalado correctamente
- ✅ Android Studio descargado
- ❌ Android SDK requiere configuración
- ❌ Variables de entorno pendientes

## 🎯 **PASOS PARA CONFIGURAR ANDROID STUDIO**

### 1. 📱 **Abrir Android Studio por primera vez**

1. Ejecuta **Android Studio**
2. En el wizard de setup:
   - ✅ Acepta la licencia
   - ✅ Selecciona "Standard" installation
   - ✅ Asegúrate de que esté marcado:
     - Android SDK
     - Android SDK Platform-Tools
     - Performance (Intel ® HAXM)
     - Android Virtual Device

### 2. 🔧 **Configurar SDK Manager**

Una vez abierto Android Studio:

1. Ve a **File → Settings** (o **Android Studio → Preferences** en Mac)
2. Busca **Android SDK** en el panel izquierdo
3. En la pestaña **SDK Platforms**:
   - ✅ Marca **Android 14.0 (API 34)** o **Android 13.0 (API 33)**
4. En la pestaña **SDK Tools**:
   - ✅ Marca **Android SDK Build-Tools**
   - ✅ Marca **Android SDK Platform-Tools**
   - ✅ Marca **Android SDK Tools**
5. Click **Apply** y acepta las licencias

### 3. 🌍 **Configurar Variables de Entorno**

#### Encontrar la ruta del SDK:
En Android Studio:
- **File → Settings → Android SDK**
- Copia la ruta que aparece en **Android SDK Location**
- Normalmente es: `C:\Users\[TuUsuario]\AppData\Local\Android\Sdk`

#### Configurar variables:
1. Abre **Variables de entorno del sistema**:
   - `Win + R` → escribe `sysdm.cpl` → Enter
   - Click en **Variables de entorno**

2. En **Variables del sistema** click **Nuevo**:
   - **Nombre**: `ANDROID_HOME`
   - **Valor**: `C:\Users\oconn\AppData\Local\Android\Sdk` (tu ruta real)

3. Editar **Path** (Variables del sistema):
   - Agregar: `%ANDROID_HOME%\platform-tools`
   - Agregar: `%ANDROID_HOME%\tools`
   - Agregar: `%ANDROID_HOME%\tools\bin`

### 4. 📱 **Crear Emulador Android**

1. En Android Studio: **Tools → AVD Manager**
2. Click **Create Virtual Device**
3. Selecciona **Pixel 6** (recomendado)
4. Selecciona **API 34** (Android 14)
5. Click **Next** → **Finish**
6. Click ▶️ para iniciar el emulador

### 5. ✅ **Verificar Configuración**

Reinicia PowerShell y ejecuta:
```bash
npm run doctor
```

Debería mostrar:
- ✅ Android SDK
- ✅ Adb
- ✅ JDK

### 6. 🚀 **Ejecutar la App**

Una vez todo configurado:

```bash
# Terminal 1: Metro Bundler
npm start

# Terminal 2: Ejecutar en Android
npm run android
```

## 🎯 **SOLUCIÓN RÁPIDA SI HAY PROBLEMAS**

Si `npm run doctor` sigue mostrando errores:

### Verificar manualmente:
```bash
# Verificar adb
adb version

# Verificar ANDROID_HOME
echo $env:ANDROID_HOME
```

### Ruta típica del SDK:
```
C:\Users\oconn\AppData\Local\Android\Sdk
```

### Alternativa - Configuración manual:
Si Android Studio no configuró automáticamente, puedes hacerlo manualmente:

1. Busca la carpeta: `C:\Users\oconn\AppData\Local\Android\Sdk`
2. Si existe, configura las variables como se indicó arriba
3. Si no existe, ejecuta Android Studio SDK Manager para descargar

## 🆘 **SI ALGO NO FUNCIONA**

Ejecuta estos comandos para diagnóstico:

```bash
# Verificar rutas
dir "C:\Users\oconn\AppData\Local\Android"
dir "C:\Users\oconn\AppData\Local\Android\Sdk"

# Verificar variables
echo $env:ANDROID_HOME
echo $env:PATH | findstr Android
```

---

## ⏱️ **TIEMPO ESTIMADO**: 15-20 minutos

Una vez completado, podrás ejecutar `npm run android` y ver la app funcionando en el emulador!
