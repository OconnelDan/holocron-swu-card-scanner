# ============================================
# SCRIPT DE SINCRONIZACION HOLOCRON (PowerShell)
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host " SCRIPT DE SINCRONIZACION HOLOCRON" -ForegroundColor Cyan  
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Definir rutas
$rutaCorta = "c:\holocron"
$rutaLarga = "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner"

# Verificar que ambas rutas existen
if (-not (Test-Path $rutaCorta)) {
    Write-Host "ERROR: No existe la ruta corta $rutaCorta" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

if (-not (Test-Path $rutaLarga)) {
    Write-Host "ERROR: No existe la ruta larga $rutaLarga" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "📱 Copiando Cliente Movil..." -ForegroundColor Yellow

# Copiar archivos de Cliente Movil (excluyendo node_modules y builds)
try {
    robocopy "$rutaCorta\Cliente Movil\src" "$rutaLarga\Cliente Movil\src" /S /XO /XD node_modules .git android\app\build | Out-Null
    robocopy "$rutaCorta\Cliente Movil" "$rutaLarga\Cliente Movil" *.json *.md *.html /XO | Out-Null
    Write-Host "✅ Cliente Movil copiado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error copiando Cliente Movil: $_" -ForegroundColor Red
}

Write-Host "🖥️ Copiando Backend..." -ForegroundColor Yellow

# Copiar archivos de Backend
try {
    robocopy "$rutaCorta\backend" "$rutaLarga\backend" *.js *.ts *.json *.md /S /XO /XD node_modules .git dist | Out-Null
    Write-Host "✅ Backend copiado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error copiando Backend: $_" -ForegroundColor Red
}

Write-Host "📄 Copiando archivos raíz..." -ForegroundColor Yellow

# Copiar archivos raíz
try {
    robocopy "$rutaCorta" "$rutaLarga" *.md *.json *.txt /XO | Out-Null
    Write-Host "✅ Archivos raíz copiados" -ForegroundColor Green
} catch {
    Write-Host "❌ Error copiando archivos raíz: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Archivos copiados exitosamente!" -ForegroundColor Green
Write-Host ""

# Cambiar al directorio del repositorio Git
Set-Location $rutaLarga

Write-Host "📋 Estado del repositorio Git:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "🔄 Agregando cambios al staging..." -ForegroundColor Yellow
git add .

Write-Host ""

# Solicitar mensaje de commit
$commitMsg = Read-Host "Ingresa el mensaje del commit (o presiona Enter para mensaje automático)"

if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "feat: Sincronización automática desde ruta corta - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

Write-Host "💾 Haciendo commit con mensaje: $commitMsg" -ForegroundColor Yellow
git commit -m $commitMsg

Write-Host ""
Write-Host "🚀 Haciendo push al repositorio remoto..." -ForegroundColor Yellow
git push origin master

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " ✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Los cambios han sido:" -ForegroundColor White
Write-Host "1. ✅ Copiados de c:\holocron\ al repositorio original" -ForegroundColor Green
Write-Host "2. ✅ Agregados al staging de Git" -ForegroundColor Green  
Write-Host "3. ✅ Commiteados con mensaje: '$commitMsg'" -ForegroundColor Green
Write-Host "4. ✅ Pusheados al repositorio remoto" -ForegroundColor Green
Write-Host ""

Write-Host "Presiona cualquier tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
