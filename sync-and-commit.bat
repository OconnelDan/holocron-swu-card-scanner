@echo off
echo ============================================
echo  SCRIPT DE SINCRONIZACION HOLOCRON
echo ============================================
echo.
echo Copiando cambios de la ruta corta a la larga...
echo.

:: Definir rutas
set "RUTA_CORTA=c:\holocron"
set "RUTA_LARGA=C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner"

:: Verificar que ambas rutas existen
if not exist "%RUTA_CORTA%" (
    echo ERROR: No existe la ruta corta %RUTA_CORTA%
    pause
    exit /b 1
)

if not exist "%RUTA_LARGA%" (
    echo ERROR: No existe la ruta larga %RUTA_LARGA%
    pause
    exit /b 1
)

:: Copiar archivos modificados importantes
echo 📱 Copiando Cliente Movil...
robocopy "%RUTA_CORTA%\Cliente Movil\src" "%RUTA_LARGA%\Cliente Movil\src" /S /XO /XD node_modules .git android\app\build
robocopy "%RUTA_CORTA%\Cliente Movil" "%RUTA_LARGA%\Cliente Movil" *.json *.md *.html /XO

echo 🖥️ Copiando Backend...
robocopy "%RUTA_CORTA%\backend" "%RUTA_LARGA%\backend" *.js *.ts *.json *.md /S /XO /XD node_modules .git dist

echo 📄 Copiando archivos raíz...
robocopy "%RUTA_CORTA%" "%RUTA_LARGA%" *.md *.json *.txt /XO

echo.
echo ✅ Archivos copiados exitosamente!
echo.

:: Cambiar al directorio del repositorio Git
cd /d "%RUTA_LARGA%"

echo 📋 Estado del repositorio Git:
git status

echo.
echo 🔄 Agregando cambios al staging...
git add .

echo.
echo 💾 Haciendo commit...
set /p "COMMIT_MSG=Ingresa el mensaje del commit (o presiona Enter para mensaje automático): "

if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=feat: Sincronización automática desde ruta corta - %date% %time%"
)

git commit -m "%COMMIT_MSG%"

echo.
echo 🚀 Haciendo push al repositorio remoto...
git push origin master

echo.
echo ============================================
echo  ✅ SINCRONIZACIÓN COMPLETADA EXITOSAMENTE
echo ============================================
echo.
echo Los cambios han sido:
echo 1. ✅ Copiados de c:\holocron\ al repositorio original
echo 2. ✅ Agregados al staging de Git  
echo 3. ✅ Commiteados con mensaje: "%COMMIT_MSG%"
echo 4. ✅ Pusheados al repositorio remoto
echo.
pause
