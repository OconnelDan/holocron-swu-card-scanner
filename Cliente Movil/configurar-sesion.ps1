# ===================================================================
# CONFIGURAR ENTORNO COMPLETO - Holocron SWU Card Scanner
# ===================================================================
# Este script configura todas las variables de entorno necesarias para React Native

Write-Host "🚀 CONFIGURANDO ENTORNO COMPLETO" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

# Definir rutas
$androidSdkPath = "C:\Users\oconn\AppData\Local\Android\Sdk"
$jdk17Path = "C:\Users\oconn\AppData\Local\jdk-17.0.15+6"

Write-Host "📋 Configurando variables de entorno..." -ForegroundColor Cyan

# 1. Configurar JAVA_HOME
Write-Host "   Configurando JAVA_HOME..." -ForegroundColor Gray
$env:JAVA_HOME = $jdk17Path

# 2. Configurar ANDROID_HOME
Write-Host "   Configurando ANDROID_HOME..." -ForegroundColor Gray
$env:ANDROID_HOME = $androidSdkPath
$env:ANDROID_SDK_ROOT = $androidSdkPath

# 3. Actualizar PATH
Write-Host "   Actualizando PATH..." -ForegroundColor Gray
$newPath = @(
    "$jdk17Path\bin",
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\tools",
    "$androidSdkPath\tools\bin",
    "$androidSdkPath\emulator"
) -join ";"

$env:PATH = $newPath + ";" + $env:PATH

# 4. Crear/actualizar local.properties
Write-Host "   Configurando local.properties..." -ForegroundColor Gray
$localPropertiesPath = "android\local.properties"
$androidSdkPathForProperties = $androidSdkPath -replace '\\', '\\'
$localPropertiesContent = @"
sdk.dir=$androidSdkPathForProperties
"@

Set-Content -Path $localPropertiesPath -Value $localPropertiesContent
Write-Host "✅ local.properties configurado" -ForegroundColor Green

# 5. Verificar configuración
Write-Host ""
Write-Host "🔍 Verificando configuración..." -ForegroundColor Cyan

Write-Host "   JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "   ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Gray

# Verificar Java
try {
    $javaVersion = & java -version 2>&1 | Select-String "openjdk version"
    Write-Host "✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verificando Java" -ForegroundColor Red
}

# Verificar ADB
try {
    $adbVersion = & adb version 2>&1 | Select-String "Android Debug Bridge"
    Write-Host "✅ ADB: $adbVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error verificando ADB" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ ENTORNO CONFIGURADO PARA ESTA SESIÓN" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   Esta configuración es temporal para esta sesión de PowerShell" -ForegroundColor Gray
Write-Host "   Para configuración permanente, ejecuta configurar-entorno.ps1 como administrador" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 Ahora puedes ejecutar:" -ForegroundColor Yellow
Write-Host "   npm run android" -ForegroundColor Cyan

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
