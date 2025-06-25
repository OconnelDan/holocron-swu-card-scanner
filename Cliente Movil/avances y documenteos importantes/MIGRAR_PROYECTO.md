# 🚀 MIGRACIÓN A RUTA CORTA - Solución para Rutas Largas

## ❓ Problema Actual
- Ruta actual: `c:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil`
- **Longitud: 89 caracteres**
- CMake falla con rutas largas en Windows

## ✅ Solución: Migrar a Ruta Corta
- Nueva ruta sugerida: `c:\Users\oconn\Desktop\swu-scanner`
- **Longitud: 34 caracteres** (reducción del 62%)

## 📋 Pasos para Migrar

### 1. Preparar el Directorio Destino
```powershell
# En PowerShell como administrador
cd C:\Users\oconn\Desktop
mkdir swu-scanner
```

### 2. Copiar el Proyecto
```powershell
# Copiar todos los archivos
xcopy "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil\*" "C:\Users\oconn\Desktop\swu-scanner\" /E /H /C /I

# O usar robocopy (más robusto)
robocopy "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil" "C:\Users\oconn\Desktop\swu-scanner" /E /COPYALL /R:3 /W:1
```

### 3. Limpiar Cachés en el Nuevo Proyecto
```powershell
cd C:\Users\oconn\Desktop\swu-scanner

# Limpiar node_modules
rm -rf node_modules
rm -rf android\.gradle
rm -rf android\app\build
rm -rf android\build

# Reinstalar dependencias
npm install
```

### 4. Configurar Android en Nueva Ubicación
```powershell
# El archivo local.properties se copiará automáticamente
# Pero verificar que ANDROID_HOME esté configurado

# Configurar variables de entorno para la nueva sesión
$env:ANDROID_HOME = "C:\Users\oconn\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Users\oconn\.gradle\jdks\temurin-17-jdk-17.0.15+6"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:PATH"
```

### 5. Probar el Build
```powershell
# Con la nueva ruta corta
npm run android
```

## 🎯 Ventajas de la Migración

1. **Resuelve problemas de rutas largas** - CMake funcionará
2. **Mejor rendimiento** - Paths más cortos = acceso más rápido
3. **Menos errores de Windows** - Evita limitaciones del sistema de archivos
4. **Fácil acceso** - Directamente en el escritorio

## ⚠️ Consideraciones

- **Backup**: El proyecto original se mantiene intacto
- **Git**: Si usas Git, necesitarás clonar o mover el .git
- **VS Code**: Abrir la nueva carpeta en VS Code
- **Scripts**: Los scripts PowerShell funcionarán igual

## 🔧 Comandos Rápidos para Migrar

```powershell
# Ejecutar todo de una vez
cd C:\Users\oconn\Desktop
mkdir swu-scanner
robocopy "C:\Users\oconn\Desktop\PROGRAMACION\holocron-swu-card-scanner\Cliente Movil" "C:\Users\oconn\Desktop\swu-scanner" /E /COPYALL
cd swu-scanner
rm -rf node_modules, android\.gradle, android\app\build, android\build
npm install
```

¿Quieres que proceda con la migración?
