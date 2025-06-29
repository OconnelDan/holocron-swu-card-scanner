# 🛠️ SOLUCIÓN COMPLETA DE ENTORNO - ANDROID DEVELOPMENT

## 📊 **Errores detectados:**
- ❌ Java/JDK no instalado
- ❌ ADB no disponible en PATH
- ❌ ANDROID_HOME no configurado
- ❌ Android SDK no detectado

## 🎯 **Plan de solución paso a paso:**

### **PASO 1: Instalar Java JDK** ⭐
```powershell
# Opción A: Instalar con Chocolatey (RECOMENDADO)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
choco install openjdk11 -y

# Opción B: Descargar manualmente
# Ir a: https://adoptium.net/temurin/releases/
# Descargar: Eclipse Temurin 11 (LTS) - Windows x64 MSI
```

### **PASO 2: Configurar ANDROID_HOME**
```powershell
# Verificar que Android SDK existe
$AndroidSDK = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $AndroidSDK) {
    Write-Host "✅ Android SDK encontrado en: $AndroidSDK"
} else {
    Write-Host "❌ Android SDK no encontrado. Instalar Android Studio primero."
}
```

### **PASO 3: Configurar variables de entorno**
```powershell
# Configurar ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")

# Configurar JAVA_HOME (después de instalar Java)
$JavaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium\" -Directory | Sort-Object Name -Descending | Select-Object -First 1
if ($JavaPath) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaPath.FullName, "User")
}

# Agregar al PATH
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$NewPaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools",
    "$env:LOCALAPPDATA\Android\Sdk\tools",
    "$env:LOCALAPPDATA\Android\Sdk\tools\bin"
)

foreach ($NewPath in $NewPaths) {
    if ($CurrentPath -notlike "*$NewPath*") {
        $CurrentPath += ";$NewPath"
    }
}
[Environment]::SetEnvironmentVariable("PATH", $CurrentPath, "User")
```

### **PASO 4: Reiniciar terminal y verificar**
```powershell
# Reiniciar PowerShell y ejecutar:
java -version
adb version
echo $env:ANDROID_HOME
echo $env:JAVA_HOME
npx react-native doctor
```

## 🚀 **Script automatizado completo:**

Ejecutar este script como Administrador:

```powershell
# SCRIPT COMPLETO DE CONFIGURACIÓN
Write-Host "🛠️ CONFIGURANDO ENTORNO REACT NATIVE ANDROID..." -ForegroundColor Green

# 1. Instalar Chocolatey si no existe
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

# 2. Instalar Java JDK 11
Write-Host "☕ Instalando Java JDK 11..." -ForegroundColor Yellow
choco install openjdk11 -y

# 3. Configurar variables de entorno
Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Yellow

# ANDROID_HOME
$AndroidSDK = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidSDK, "User")

# JAVA_HOME
$JavaPath = Get-ChildItem "C:\Program Files\Eclipse Adoptium\" -Directory | Sort-Object Name -Descending | Select-Object -First 1
if ($JavaPath) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaPath.FullName, "User")
}

# PATH
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$NewPaths = @(
    "$AndroidSDK\platform-tools",
    "$AndroidSDK\tools",
    "$AndroidSDK\tools\bin",
    "$AndroidSDK\emulator"
)

foreach ($NewPath in $NewPaths) {
    if ($CurrentPath -notlike "*$NewPath*") {
        $CurrentPath += ";$NewPath"
    }
}
[Environment]::SetEnvironmentVariable("PATH", $CurrentPath, "User")

Write-Host "✅ Configuración completada. REINICIA PowerShell y ejecuta verificación." -ForegroundColor Green
```

## 📋 **Después de ejecutar el script:**

1. **Cerrar** PowerShell completamente
2. **Abrir nuevo** PowerShell
3. **Verificar** instalación:
   ```powershell
   java -version
   adb version
   echo $env:ANDROID_HOME
   echo $env:JAVA_HOME
   npx react-native doctor
   ```

4. **Crear emulador** Android:
   ```powershell
   # Abrir Android Studio
   start "C:\Program Files\Android\Android Studio\bin\studio64.exe"
   
   # O desde línea de comandos
   avdmanager create avd -n ReactNativeEmulator -k "system-images;android-30;google_apis;x86_64"
   ```

## ⚠️ **Notas importantes:**

- **Ejecutar como Administrador** para instalar software
- **Reiniciar PowerShell** después de configurar variables
- **Verificar cada paso** antes de continuar
- Si algo falla, revisar logs de instalación

## 🎯 **Siguiente paso:**
Una vez solucionado el entorno, ejecutar:
```powershell
npm run android
```
