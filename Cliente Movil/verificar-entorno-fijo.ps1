# ===================================================================
# VERIFICAR ENTORNO - Holocron SWU Card Scanner
# ===================================================================
# Este script verifica si el entorno de desarrollo está correctamente configurado

Write-Host "🔍 VERIFICANDO ENTORNO DE DESARROLLO" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Yellow
Write-Host ""

# Definir rutas esperadas
$androidSdkPath = "C:\Users\oconn\AppData\Local\Android\Sdk"
$jdk17Path = "C:\Users\oconn\AppData\Local\jdk-17.0.15+6"

$allOk = $true

# 1. Verificar Java 17
Write-Host "📋 Verificando Java..." -ForegroundColor Cyan
if (Test-Path "$jdk17Path\bin\java.exe") {
    Write-Host "✅ Java 17 encontrado en: $jdk17Path" -ForegroundColor Green
    
    # Configurar temporalmente JAVA_HOME
    $env:JAVA_HOME = $jdk17Path
    $env:PATH = "$jdk17Path\bin;" + $env:PATH
    
    $javaVersion = & java -version 2>&1 | Select-String "openjdk version"
    Write-Host "   Versión: $javaVersion" -ForegroundColor Gray
} else {
    Write-Host "❌ Java 17 no encontrado en: $jdk17Path" -ForegroundColor Red
    $allOk = $false
}

# 2. Verificar Android SDK
Write-Host ""
Write-Host "📋 Verificando Android SDK..." -ForegroundColor Cyan
if (Test-Path $androidSdkPath) {
    Write-Host "✅ Android SDK encontrado en: $androidSdkPath" -ForegroundColor Green
    
    # Configurar temporalmente ANDROID_HOME
    $env:ANDROID_HOME = $androidSdkPath
    $env:PATH = "$androidSdkPath\platform-tools;" + "$androidSdkPath\tools;" + $env:PATH
    
    # Verificar ADB
    if (Test-Path "$androidSdkPath\platform-tools\adb.exe") {
        Write-Host "✅ ADB encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ ADB no encontrado" -ForegroundColor Red
        $allOk = $false
    }
} else {
    Write-Host "❌ Android SDK no encontrado en: $androidSdkPath" -ForegroundColor Red
    $allOk = $false
}

# 3. Verificar emuladores
Write-Host ""
Write-Host "📋 Verificando emuladores..." -ForegroundColor Cyan
if (Test-Path "$androidSdkPath\emulator\emulator.exe") {
    $emulatorsOutput = & "$androidSdkPath\emulator\emulator.exe" -list-avds 2>&1
    if ($emulatorsOutput -and $emulatorsOutput.Count -gt 0) {
        Write-Host "✅ Emuladores encontrados:" -ForegroundColor Green
        foreach ($emulator in $emulatorsOutput) {
            Write-Host "   - $emulator" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️  No hay emuladores configurados" -ForegroundColor Yellow
        Write-Host "   Necesitas crear un emulador en Android Studio" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Emulator no encontrado" -ForegroundColor Red
    $allOk = $false
}

# 4. Verificar local.properties
Write-Host ""
Write-Host "📋 Verificando local.properties..." -ForegroundColor Cyan
$localPropertiesPath = "android\local.properties"
if (Test-Path $localPropertiesPath) {
    Write-Host "✅ local.properties existe" -ForegroundColor Green
    $content = Get-Content $localPropertiesPath
    Write-Host "   Contenido:" -ForegroundColor Gray
    foreach ($line in $content) {
        Write-Host "   $line" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ local.properties no existe" -ForegroundColor Red
    Write-Host "   Creando local.properties..." -ForegroundColor Yellow
    
    $androidSdkPathForProperties = $androidSdkPath -replace '\\', '\\'
    Set-Content -Path $localPropertiesPath -Value "sdk.dir=$androidSdkPathForProperties"
    Write-Host "✅ local.properties creado" -ForegroundColor Green
}

# 5. Verificar variables de entorno actuales
Write-Host ""
Write-Host "📋 Variables de entorno actuales:" -ForegroundColor Cyan
Write-Host "   JAVA_HOME = $env:JAVA_HOME" -ForegroundColor Gray
Write-Host "   ANDROID_HOME = $env:ANDROID_HOME" -ForegroundColor Gray

# 6. Resumen
Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Yellow
if ($allOk) {
    Write-Host "✅ ENTORNO CONFIGURADO CORRECTAMENTE" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Siguiente paso:" -ForegroundColor Yellow
    Write-Host "   npm run android" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  CONFIGURACIÓN INCOMPLETA" -ForegroundColor Yellow
    Write-Host "   Ejecuta: .\configurar-entorno.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
