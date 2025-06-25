# 🔧 CONFIGURAR VARIABLES DE ENTORNO - MANUAL
# Script simple para configurar solo las variables de entorno

Write-Host "🔧 CONFIGURANDO VARIABLES DE ENTORNO..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

try {
  # Configurar ANDROID_HOME
  $AndroidSDK = "$env:LOCALAPPDATA\Android\Sdk"
  Write-Host "Configurando ANDROID_HOME: $AndroidSDK" -ForegroundColor Yellow
  [Environment]::SetEnvironmentVariable("ANDROID_HOME", $AndroidSDK, "User")

  # Verificar si Android SDK existe
  if (Test-Path $AndroidSDK) {
    Write-Host "✅ Carpeta Android SDK encontrada" -ForegroundColor Green
  }
  else {
    Write-Host "⚠️  Carpeta Android SDK no existe. Abre Android Studio para descargarla." -ForegroundColor Yellow
  }

  # Buscar Java JDK en ubicaciones comunes
  $JavaPaths = @(
    "C:\Program Files\Eclipse Adoptium\jdk-11*",
    "C:\Program Files\OpenJDK\jdk-11*",
    "C:\Program Files\Java\jdk-11*",
    "C:\Program Files\Java\jdk1.8*",
    "C:\ProgramData\chocolatey\lib\openjdk11\tools\jdk-11*",
    "C:\Program Files\AdoptOpenJDK\jdk-11*"
  )
    
  $JavaPath = $null
  foreach ($path in $JavaPaths) {
    $found = Get-ChildItem $path -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -First 1
    if ($found) {
      $JavaPath = $found.FullName
      Write-Host "✅ Java encontrado en: $JavaPath" -ForegroundColor Green
      break
    }
  }
    
  if ($JavaPath) {
    Write-Host "Configurando JAVA_HOME: $JavaPath" -ForegroundColor Yellow
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $JavaPath, "User")
  }
  else {
    Write-Host "❌ Java JDK no encontrado. Descarga desde:" -ForegroundColor Red
    Write-Host "   https://adoptium.net/temurin/releases/" -ForegroundColor Cyan
  }

  # Configurar PATH
  $CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
  if (!$CurrentPath) { 
    $CurrentPath = "" 
  }
    
  $NewPaths = @(
    "$AndroidSDK\platform-tools",
    "$AndroidSDK\tools",
    "$AndroidSDK\tools\bin",
    "$AndroidSDK\emulator"
  )

  $PathModified = $false
  foreach ($NewPath in $NewPaths) {
    if ($CurrentPath -notlike "*$NewPath*") {
      if ($CurrentPath -ne "") { 
        $CurrentPath += ";" 
      }
      $CurrentPath += $NewPath
      $PathModified = $true
      Write-Host "Agregando al PATH: $NewPath" -ForegroundColor Cyan
    }
  }
    
  if ($PathModified) {
    [Environment]::SetEnvironmentVariable("PATH", $CurrentPath, "User")
    Write-Host "✅ PATH actualizado" -ForegroundColor Green
  }
  else {
    Write-Host "✅ PATH ya estaba configurado" -ForegroundColor Green
  }

  Write-Host ""
  Write-Host "🎉 VARIABLES DE ENTORNO CONFIGURADAS!" -ForegroundColor Green
  Write-Host "====================================" -ForegroundColor Green
  Write-Host ""
  Write-Host "📋 REINICIA PowerShell y verifica:" -ForegroundColor Yellow
  Write-Host "   echo `$env:ANDROID_HOME" -ForegroundColor Cyan
  Write-Host "   echo `$env:JAVA_HOME" -ForegroundColor Cyan
  Write-Host "   adb version" -ForegroundColor Cyan
  Write-Host "   java -version" -ForegroundColor Cyan
  Write-Host ""

}
catch {
  Write-Host "❌ ERROR:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
