# ⚡ INSTRUCCIONES INMEDIATAS - SOLUCIÓN DE ENTORNO

## 🎯 **PROBLEMA IDENTIFICADO:**
Tu entorno React Native Android no está configurado correctamente. Necesitamos instalar y configurar:
- ❌ Java JDK
- ❌ Android SDK tools en PATH  
- ❌ Variables de entorno

## 🚀 **SOLUCIÓN EN 3 PASOS:**

### **PASO 1: Ejecutar script de configuración**
1. **Abrir PowerShell como Administrador**
   - Presiona `Windows + X`
   - Selecciona "PowerShell (Administrador)" o "Terminal (Administrador)"
   
2. **Navegar al proyecto**
   ```powershell
   cd "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil"
   ```

3. **Ejecutar configuración automática**
   ```powershell
   .\configurar-entorno.ps1
   ```
   
   **Nota:** Si aparece error de ejecución, primero ejecuta:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### **PASO 2: Reiniciar terminal**
1. **Cerrar** completamente PowerShell
2. **Abrir nuevo** PowerShell normal (no administrador)
3. **Navegar al proyecto**
   ```powershell
   cd "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil"
   ```

### **PASO 3: Verificar configuración**
```powershell
.\verificar-entorno.ps1
```

## ✅ **RESULTADO ESPERADO:**
Después de ejecutar los scripts deberías ver:
- ✅ Java instalado y funcionando
- ✅ ADB disponible en terminal
- ✅ Variables ANDROID_HOME y JAVA_HOME configuradas
- ✅ React Native Doctor sin errores críticos

## 🚀 **PASO SIGUIENTE:**
Una vez configurado el entorno:

1. **Crear emulador Android** (si no tienes uno):
   ```powershell
   # Abrir Android Studio
   start "C:\Program Files\Android\Android Studio\bin\studio64.exe"
   # Ir a Tools > AVD Manager > Create Virtual Device
   ```

2. **Ejecutar la app**:
   ```powershell
   npm run android
   ```

## 🆘 **SI ALGO FALLA:**

### **Error de permisos al ejecutar script:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Java no se instala automáticamente:**
1. Ir a: https://adoptium.net/temurin/releases/
2. Descargar: Eclipse Temurin 11 (LTS) - Windows x64 MSI
3. Instalar manualmente
4. Ejecutar: `.\verificar-entorno.ps1`

### **Android Studio no encontrado:**
1. Descargar desde: https://developer.android.com/studio
2. Instalar con configuración por defecto
3. Abrir y descargar Android SDK cuando lo solicite

### **Variables de entorno no se aplican:**
1. Reiniciar PowerShell completamente
2. O reiniciar Windows si persiste el problema

## 📞 **COMANDOS DE EMERGENCIA:**

Si los scripts fallan, configurar manualmente:

```powershell
# Variables de entorno
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-11.0.XX.X-hotspot"

# Agregar al PATH (temporal para esta sesión)
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"
$env:PATH += ";$env:ANDROID_HOME\tools\bin"
```

## 🎯 **OBJETIVO FINAL:**
Ver la app ejecutándose en el emulador Android con la interfaz funcional y navegación entre pantallas.

---

**¿Listo para empezar?** Ejecuta el PASO 1 y avísame si encuentras algún problema.
