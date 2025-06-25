# 🛠️ CONFIGURAR ENTORNO REACT NATIVE ANDROID
# Ejecutar como Administrador

Write-Host "🛠️ CONFIGURANDO ENTORNO REACT NATIVE ANDROID..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Verificar si se ejecuta como Administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "⚠️  ESTE SCRIPT DEBE EJECUTARSE COMO ADMINISTRADOR" -ForegroundColor Red
  Write-Host "Cerrando en 5 segundos..." -ForegroundColor Yellow
  Start-Sleep -Seconds 5
  exit 1
}

try {
  # 1. Instalar Chocolatey si no existe
  Write-Host "📦 Verificando Chocolatey..." -ForegroundColor Yellow
  if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
        
    # Actualizar PATH para la sesión actual
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
    Write-Host "✅ Chocolatey instalado correctamente" -ForegroundColor Green
  }
  else {
    Write-Host "✅ Chocolatey ya está instalado" -ForegroundColor Green
  }

  # 2. Instalar Java JDK 11
  Write-Host "☕ Instalando Java JDK 11..." -ForegroundColor Yellow
  choco install openjdk11 -y
  Write-Host "✅ Java JDK 11 instalado" -ForegroundColor Green

  # 3. Configurar variables de entorno
  Write-Host "🔧 Configurando variables de entorno..." -ForegroundColor Yellow

  # ANDROID_HOME
  $AndroidSDK = "$env:LOCALAPPDATA\Android\Sdk"
  Write-Host "Setting ANDROID_HOME to: $AndroidSDK" -ForegroundColor Cyan
  [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidSDK, "User")

  # JAVA_HOME
  $JavaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-11*",
    "C:\Program Files\OpenJDK\jdk-11*",
    "C:\ProgramData\chocolatey\lib\openjdk11\tools\jdk-11*"
  )
    
  $JavaPath = $null
  foreach ($path in $JavaPaths) {
    $found = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($found) {
      $JavaPath = $found.FullName
      break
    }
  }
    
  if ($JavaPath) {
    Write-Host "Setting JAVA_HOME to: $JavaPath" -ForegroundColor Cyan
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaPath, "User")
  }
  else {
    Write-Host "⚠️  Java JDK no encontrado en ubicaciones esperadas" -ForegroundColor Yellow
  }

  # PATH - Obtener PATH actual del usuario
  $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
  if (!$CurrentPath) { $CurrentPath = "" }
    
  # Rutas a agregar
  $NewPaths = @(
    "$AndroidSDK\platform-tools",
    "$AndroidSDK\tools",
    "$AndroidSDK\tools\bin",
    "$AndroidSDK\emulator"
  )    $PathModified = $false
  foreach ($NewPath in $NewPaths) {
    if ($CurrentPath -notlike "*$NewPath*") {
      if ($CurrentPath -ne "") { $CurrentPath += ";" }
      $CurrentPath += $NewPath
      $PathModified = $true
      Write-Host "Agregando al PATH: $NewPath" -ForegroundColor Cyan
    }
  }
    
  if ($PathModified) {
    [Environment]::SetEnvironmentVariable("PATH", $CurrentPath, "User")
  }

  Write-Host "✅ Variables de entorno configuradas" -ForegroundColor Green

  # 4. Verificar instalación de Android Studio
  $AndroidStudioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Android\Android Studio\bin\studio64.exe"
  )
    
  $AndroidStudioFound = $false
  foreach ($path in $AndroidStudioPaths) {
    if (Test-Path $path) {
      Write-Host "✅ Android Studio encontrado en: $path" -ForegroundColor Green
      $AndroidStudioFound = $true
      break
    }
  }
    
  if (!$AndroidStudioFound) {
    Write-Host "⚠️  Android Studio no encontrado. Instálalo desde: https://developer.android.com/studio" -ForegroundColor Yellow
  }

  Write-Host ""
  Write-Host "🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
  Write-Host "=============================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Yellow
  Write-Host "1. CERRAR esta ventana de PowerShell" -ForegroundColor White
  Write-Host "2. ABRIR nueva ventana de PowerShell" -ForegroundColor White
  Write-Host "3. EJECUTAR verificación:" -ForegroundColor White
  Write-Host "   java -version" -ForegroundColor Cyan
  Write-Host "   adb version" -ForegroundColor Cyan
  Write-Host "   echo `$env:ANDROID_HOME" -ForegroundColor Cyan
  Write-Host "   npx react-native doctor" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "4. CREAR EMULADOR en Android Studio" -ForegroundColor White
  Write-Host "5. EJECUTAR: npm run android" -ForegroundColor Cyan
  Write-Host ""

}
catch {
  Write-Host "❌ ERROR durante la configuración:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  Write-Host ""
  Write-Host "💡 Soluciones:" -ForegroundColor Yellow
  Write-Host "- Ejecutar como Administrador" -ForegroundColor White
  Write-Host "- Verificar conexión a internet" -ForegroundColor White
  Write-Host "- Instalar manualmente desde: https://adoptium.net/temurin/releases/" -ForegroundColor White
}

Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
