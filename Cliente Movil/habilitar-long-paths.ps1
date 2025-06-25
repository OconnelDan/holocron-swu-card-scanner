# HABILITAR LONG PATHS EN WINDOWS
# Ejecutar como Administrador

Write-Host "HABILITANDO LONG PATHS EN WINDOWS..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Verificar permisos de administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host "ERROR: Este script necesita ejecutarse como Administrador" -ForegroundColor Red
  Write-Host "Cierra esta ventana y abre PowerShell como Administrador" -ForegroundColor Yellow
  pause
  exit 1
}

try {
  # Verificar estado actual
  $currentValue = Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -ErrorAction SilentlyContinue
    
  if ($currentValue.LongPathsEnabled -eq 1) {
    Write-Host "Long Paths ya estan habilitados" -ForegroundColor Green
  }
  else {
    Write-Host "Habilitando Long Paths..." -ForegroundColor Yellow
        
    # Crear/modificar la clave del registro
    Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -Type DWord
        
    Write-Host "Long Paths habilitados correctamente" -ForegroundColor Green
    Write-Host "Se recomienda REINICIAR Windows para que surta efecto completo" -ForegroundColor Yellow
  }
    
  # Verificar git tambien
  Write-Host ""
  Write-Host "Configurando Git para long paths..." -ForegroundColor Yellow
  git config --global core.longpaths true
  Write-Host "Git configurado para long paths" -ForegroundColor Green
    
  Write-Host ""
  Write-Host "CONFIGURACION COMPLETADA" -ForegroundColor Green
  Write-Host "Ahora puedes intentar npm run android otra vez" -ForegroundColor White
    
}
catch {
  Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Asegurate de ejecutar como Administrador" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
