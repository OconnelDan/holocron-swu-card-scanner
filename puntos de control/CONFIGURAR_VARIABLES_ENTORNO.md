# 🔧 SCRIPT PARA CONFIGURAR VARIABLES DE ENTORNO

## 🎯 **OPCIÓN 1: AUTOMÁTICA (RECOMENDADA)**

### Ejecuta este comando en PowerShell (como Administrador):

```powershell
# Configurar ANDROID_HOME
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\oconn\AppData\Local\Android\Sdk", "Machine")

# Obtener PATH actual
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")

# Agregar rutas de Android al PATH
$androidPaths = @(
    "%ANDROID_HOME%\platform-tools",
    "%ANDROID_HOME%\tools", 
    "%ANDROID_HOME%\cmdline-tools\latest\bin"
)

foreach ($path in $androidPaths) {
    if ($currentPath -notlike "*$path*") {
        $currentPath = $currentPath + ";" + $path
    }
}

# Actualizar PATH
[Environment]::SetEnvironmentVariable("PATH", $currentPath, "Machine")

Write-Host "✅ Variables de entorno configuradas correctamente"
Write-Host "🔄 Reinicia PowerShell para que los cambios tengan efecto"
```

---

## 🎯 **OPCIÓN 2: MANUAL**

### Si prefieres hacerlo manualmente:

1. **Abrir Variables de Entorno:**
   - `Win + R` → `sysdm.cpl` → Enter
   - Click "Variables de entorno"

2. **Crear ANDROID_HOME:**
   - Variables del sistema → "Nuevo"
   - Nombre: `ANDROID_HOME`
   - Valor: `C:\Users\oconn\AppData\Local\Android\Sdk`

3. **Actualizar PATH:**
   - Seleccionar "Path" → "Editar"
   - "Nuevo" → `%ANDROID_HOME%\platform-tools`
   - "Nuevo" → `%ANDROID_HOME%\tools`
   - "Nuevo" → `%ANDROID_HOME%\cmdline-tools\latest\bin`

---

## ⏱️ **CRONOLOGÍA RECOMENDADA:**

1. **AHORA**: Configurar SDK Manager en Android Studio (descarga en progreso)
2. **MIENTRAS DESCARGA**: Configurar variables de entorno 
3. **DESPUÉS**: Verificar con `npm run doctor`
4. **FINALMENTE**: Ejecutar `npm run android`

---

## 🚨 **IMPORTANTE:**

- Usa la **OPCIÓN 1 (automática)** si tienes permisos de administrador
- **Reinicia PowerShell** después de configurar las variables
- **Espera** a que termine la descarga del SDK antes de continuar

---

## 📋 **SIGUIENTE PASO:**

Una vez que termine la descarga del SDK en Android Studio:
1. Configura las variables de entorno (script arriba)
2. Reinicia PowerShell  
3. Ejecuta `npm run doctor` para verificar
