# 🚀 COMANDOS RÁPIDOS - HOLOCRON SWU CARD SCANNER

## 🛠️ **CONFIGURACIÓN DE ENTORNO** (NUEVO)

### **1. Configurar entorno automáticamente:**
```powershell
# Ejecutar como Administrador
.\configurar-entorno.ps1
```

### **2. Verificar configuración:**
```powershell
.\verificar-entorno.ps1
```

### **3. Diagnóstico React Native:**
```powershell
npx react-native doctor
```

---

## 📱 **DESARROLLO MÓVIL**

### **Iniciar Metro Bundler:**
```powershell
npm start
```

### **Ejecutar en Android:**
```powershell
npm run android
```

### **Ejecutar en iOS:**
```powershell
npm run ios
```

### **Limpiar cache:**
```powershell
npx react-native start --reset-cache
```

---

## 🔧 **HERRAMIENTAS DE DESARROLLO**

### **Instalar dependencias:**
```powershell
npm install
```

### **Actualizar dependencias:**
```powershell
npm update
```

### **Limpiar node_modules:**
```powershell
rm -rf node_modules
npm install
```

### **Build para producción:**
```powershell
cd android
.\gradlew assembleRelease
```

---

## 🐞 **DEBUGGING**

### **Ver logs de Android:**
```powershell
adb logcat
```

### **Ver dispositivos conectados:**
```powershell
adb devices
```

### **Reiniciar ADB:**
```powershell
adb kill-server
adb start-server
```

### **Abrir Chrome DevTools:**
```
chrome://inspect
```

---

## 📱 **EMULADOR ANDROID**

### **Listar emuladores:**
```powershell
emulator -list-avds
```

### **Iniciar emulador específico:**
```powershell
emulator -avd NombreDelEmulador
```

### **Crear nuevo emulador:**
```powershell
# Abrir Android Studio
start "C:\Program Files\Android\Android Studio\bin\studio64.exe"
# Ir a: Tools > AVD Manager > Create Virtual Device
```

---

## 🌐 **DEMO WEB**

### **Abrir demo en navegador:**
```powershell
# Desde explorador de archivos
demo-web.html
```

### **Servidor local simple:**
```powershell
# Con Python (si está instalado)
python -m http.server 8000

# Con Node.js
npx serve .
```

---

## 📦 **GESTIÓN DE PAQUETES**

### **Instalar nueva dependencia:**
```powershell
npm install nombre-paquete
```

### **Instalar dependencia de desarrollo:**
```powershell
npm install --save-dev nombre-paquete
```

### **Desinstalar dependencia:**
```powershell
npm uninstall nombre-paquete
```

### **Ver dependencias instaladas:**
```powershell
npm list
```

---

## 🔄 **COMANDOS DE LIMPIEZA**

### **Limpiar cache completo:**
```powershell
npx react-native start --reset-cache
rm -rf node_modules
npm install
cd android
.\gradlew clean
cd ..
```

### **Reconstruir proyecto Android:**
```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
cd ..
```

---

## 📋 **VERIFICACIÓN RÁPIDA**

### **Estado del proyecto:**
```powershell
# Verificar versiones
node --version
npm --version
java -version
adb version

# Variables de entorno
echo $env:ANDROID_HOME
echo $env:JAVA_HOME

# Diagnóstico completo
npx react-native doctor
```

---

## 🆘 **SOLUCIÓN DE PROBLEMAS COMUNES**

### **Error: "Java not found"**
```powershell
.\configurar-entorno.ps1
# Reiniciar PowerShell
```

### **Error: "ADB not found"**
```powershell
# Verificar PATH
echo $env:PATH | grep Android
# Reconfigurar si es necesario
.\configurar-entorno.ps1
```

### **Error: "No emulator found"**
```powershell
# Abrir Android Studio y crear emulador
start "C:\Program Files\Android\Android Studio\bin\studio64.exe"
```

### **Error: "Metro bundler failed"**
```powershell
npx react-native start --reset-cache
```

### **Error: "Build failed"**
```powershell
cd android
.\gradlew clean
cd ..
rm -rf node_modules
npm install
```

---

## 🎯 **WORKFLOW TÍPICO DE DESARROLLO**

1. **Verificar entorno:**
   ```powershell
   .\verificar-entorno.ps1
   ```

2. **Iniciar Metro:**
   ```powershell
   npm start
   ```

3. **En nueva terminal, ejecutar app:**
   ```powershell
   npm run android
   ```

4. **Para cambios, recargar con:**
   - `R R` en Metro terminal
   - `Ctrl + M` en emulador → Reload

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **Configuración completa:** `SOLUCION_ENTORNO_COMPLETA.md`
- **Guía paso a paso:** `CONFIGURACION_PASO_A_PASO.md`
- **Variables de entorno:** `CONFIGURAR_VARIABLES_ENTORNO.md`
- **Próximos pasos:** `PROXIMOS_PASOS_CRITICOS.md`
