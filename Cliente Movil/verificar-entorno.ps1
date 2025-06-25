# 🔍 VERIFICAR ENTORNO REACT NATIVE ANDROID

Write-Host "🔍 VERIFICANDO ENTORNO REACT NATIVE..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Verificando instalaciones..." -ForegroundColor Yellow

# Verificar Java
Write-Host "☕ Java JDK:" -ForegroundColor Cyan
try {
  $javaVersion = java -version 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Java instalado" -ForegroundColor Green
    Write-Host "   $($javaVersion[0])" -ForegroundColor Gray
  }
  else {
    Write-Host "   ❌ Java no encontrado" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ Java no encontrado" -ForegroundColor Red
}

# Verificar ADB
Write-Host "🔧 Android Debug Bridge (ADB):" -ForegroundColor Cyan
try {
  $adbVersion = adb version 2>&1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ADB disponible" -ForegroundColor Green
    Write-Host "   $($adbVersion[0])" -ForegroundColor Gray
  }
  else {
    Write-Host "   ❌ ADB no encontrado" -ForegroundColor Red
  }
}
catch {
  Write-Host "   ❌ ADB no encontrado" -ForegroundColor Red
}

# Verificar variables de entorno
Write-Host "🔧 Variables de entorno:" -ForegroundColor Cyan

$androidHome = $env:ANDROID_HOME
if ($androidHome) {
  Write-Host "   ✅ ANDROID_HOME: $androidHome" -ForegroundColor Green
    
  # Verificar si existe la carpeta
  if (Test-Path $androidHome) {
    Write-Host "   ✅ Carpeta Android SDK existe" -ForegroundColor Green
  }
  else {
    Write-Host "   ⚠️  Carpeta Android SDK no existe" -ForegroundColor Yellow
  }
}
else {
  Write-Host "   ❌ ANDROID_HOME no configurado" -ForegroundColor Red
}

$javaHome = $env:JAVA_HOME
if ($javaHome) {
  Write-Host "   ✅ JAVA_HOME: $javaHome" -ForegroundColor Green
    
  # Verificar si existe la carpeta
  if (Test-Path $javaHome) {
    Write-Host "   ✅ Carpeta Java JDK existe" -ForegroundColor Green
  }
  else {
    Write-Host "   ⚠️  Carpeta Java JDK no existe" -ForegroundColor Yellow
  }
}
else {
  Write-Host "   ❌ JAVA_HOME no configurado" -ForegroundColor Red
}

# Verificar Node.js y npm
Write-Host "📦 Node.js y npm:" -ForegroundColor Cyan
try {
  $nodeVersion = node --version 2>&1
  $npmVersion = npm --version 2>&1
  Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
  Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
}
catch {
  Write-Host "   ❌ Node.js/npm no encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "🏥 Ejecutando React Native Doctor..." -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow

try {
  npx react-native doctor
}
catch {
  Write-Host "❌ Error ejecutando React Native Doctor" -ForegroundColor Red
}

Write-Host ""
Write-Host "📱 Verificando emuladores disponibles..." -ForegroundColor Yellow

try {
  $emulators = emulator -list-avds 2>&1
  if ($emulators -and $emulators.Count -gt 0) {
    Write-Host "✅ Emuladores encontrados:" -ForegroundColor Green
    foreach ($emu in $emulators) {
      Write-Host "   - $emu" -ForegroundColor Gray
    }
  }
  else {
    Write-Host "⚠️  No hay emuladores configurados" -ForegroundColor Yellow
    Write-Host "   Crea uno en Android Studio > AVD Manager" -ForegroundColor Gray
  }
}
catch {
  Write-Host "⚠️  No se pudo verificar emuladores" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 RESUMEN:" -ForegroundColor Green
Write-Host "==========" -ForegroundColor Green

$allGood = $true

if (!(Get-Command java -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Instalar Java JDK" -ForegroundColor Red
  $allGood = $false
}

if (!(Get-Command adb -ErrorAction SilentlyContinue)) {
  Write-Host "❌ Configurar ADB en PATH" -ForegroundColor Red
  $allGood = $false
}

if (!$env:ANDROID_HOME) {
  Write-Host "❌ Configurar ANDROID_HOME" -ForegroundColor Red
  $allGood = $false
}

if (!$env:JAVA_HOME) {
  Write-Host "❌ Configurar JAVA_HOME" -ForegroundColor Red
  $allGood = $false
}

if ($allGood) {
  Write-Host "🎉 ENTORNO CONFIGURADO CORRECTAMENTE!" -ForegroundColor Green
  Write-Host ""
  Write-Host "🚀 Siguiente paso:" -ForegroundColor Yellow
  Write-Host "   cd 'C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil'" -ForegroundColor Cyan
  Write-Host "   npm run android" -ForegroundColor Cyan
}
else {
  Write-Host "⚠️  CONFIGURACIÓN INCOMPLETA" -ForegroundColor Yellow
  Write-Host "   Ejecuta: .\configurar-entorno.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
