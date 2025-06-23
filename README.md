# 🚀 Holocron SWU Card Scanner

![CI/CD](https://github.com/OconnelDan/holocron-swu-card-scanner/workflows/CI%2FCD%20Pipeline/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/typescript-%5E5.3.3-blue.svg)

**Escáner de cartas de Star Wars Unlimited en tiempo real** utilizando visión por computadora y machine learning.

## 🎯 Descripción

Aplicación multi-plataforma que permite escanear cartas físicas de Star Wars Unlimited usando la cámara del dispositivo, detectar automáticamente qué carta es mediante IA, y almacenar los resultados. Incluye overlays en tiempo real similares a Instagram Reels.

### ✨ Características principales

- 📱 **Multi-plataforma**: React Native (iOS/Android), Electron (Desktop), React (Web)
- 🤖 **IA integrada**: MobileNetV2 fine-tuned + OpenCV para detección de contornos
- 📊 **Tiempo real**: ≥20 FPS con procesamiento on-device
- 🔍 **Alta precisión**: Umbral de confianza ≥ 0.7
- 📈 **Analytics**: Estadísticas de escaneos y cartas más populares
- 🔄 **Scraping automático**: Actualización diaria desde SWUDB API y web oficial
- 🐳 **Dockerizado**: Fácil despliegue con Docker Compose

## 🏗️ Arquitectura

```
holocron-swu-card-scanner/
├── backend/              # Node.js + Express + MongoDB
├── mobile-client/        # React Native + Vision Camera + OpenCV
├── desktop-client/       # Electron + React + OpenCV.js
└── docs/                # Documentación técnica
```

## 🛠️ Stack Tecnológico

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express 5
- **Base de datos**: MongoDB 6 + Mongoose
- **IA**: TensorFlow.js Node
- **Scraping**: Puppeteer 21 + Cheerio
- **Testing**: Jest + Supertest
- **Contenedores**: Docker + Docker Compose

### Clientes
- **Móvil**: React Native 0.74 + Vision Camera + OpenCV C++
- **Desktop**: Electron 28 + React 18 + OpenCV.js
- **IA**: TensorFlow Lite (móvil), TensorFlow.js (web/desktop)

## 🚀 Quick Start

### Prerrequisitos

- Node.js ≥ 20.0.0
- Docker y Docker Compose
- Git

### 1. Clonar repositorio

```bash
git clone https://github.com/OconnelDan/holocron-swu-card-scanner.git
cd holocron-swu-card-scanner
```

### 2. Backend (Docker)

```bash
cd backend
cp .env.example .env
docker-compose up -d
```

El backend estará disponible en `http://localhost:3000`

### 3. Backend (Desarrollo local)

```bash
cd backend
npm install
npm run dev
```

### 4. Ejecutar scraping inicial

```bash
cd backend
npm run scrape:cards
```

## 📡 API Endpoints

### Health Checks
- `GET /health` - Health check básico
- `GET /ready` - Readiness check

### Cartas
- `GET /api/cards` - Lista cartas con paginación y filtros
- `GET /api/cards/search?q=luke` - Búsqueda de texto completo
- `GET /api/cards/:id` - Obtiene carta específica

### Escaneos
- `POST /api/scans` - Registra nuevo escaneo
- `GET /api/scans` - Historial de escaneos
- `GET /api/scans/stats` - Estadísticas de uso

## 🔧 Desarrollo

### Scripts disponibles

```bash
# Backend
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run test         # Tests unitarios
npm run test:coverage # Tests con cobertura
npm run lint         # ESLint
npm run scrape:cards # Scraping manual de cartas

# Docker
npm run docker:build # Construir imagen
npm run docker:run   # Ejecutar con compose
```

### Variables de entorno

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/holocron-swu

# Server
PORT=3000
NODE_ENV=development

# APIs externas
SWUDB_API_BASE_URL=https://api.swudb.com/v1

# Scraping
SCRAPE_SCHEDULE="0 0 * * *"

# Machine Learning
TF_CONFIDENCE_THRESHOLD=0.7
```

## 🧪 Testing

```bash
# Tests unitarios
npm test

# Tests con cobertura (>80% requerido)
npm run test:coverage

# Tests de integración
npm run test:integration
```

## 📊 Monitoreo

### Health Checks

```bash
# Health básico
curl http://localhost:3000/health

# Readiness completo
curl http://localhost:3000/ready
```

### Logs

```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Logs específicos
docker-compose logs backend | grep ERROR
```

### MongoDB Express (desarrollo)

```bash
# Iniciar con interfaz web de MongoDB
docker-compose --profile dev up -d

# Acceder a http://localhost:8081
# Usuario: admin / Contraseña: admin123
```

## 🔄 CI/CD

### GitHub Actions

- ✅ **Lint & Test**: ESLint + Jest con cobertura >80%
- 🏗️ **Build**: Compilación TypeScript
- 🐳 **Docker**: Build y push a GitHub Container Registry
- 🔒 **Security**: CodeQL analysis + npm audit

### Workflow triggers

- **Push a main**: Deploy completo
- **Push a develop**: Tests y build
- **Pull Requests**: Tests completos

## 📈 Roadmap

### v1.0 (Actual)
- [x] Backend REST API completo
- [x] Scraping automático de cartas
- [x] Modelos de datos optimizados
- [x] Docker + CI/CD
- [ ] Cliente móvil React Native
- [ ] Frame processor OpenCV
- [ ] Integración TensorFlow Lite

### v1.1 (Q2 2024)
- [ ] Cliente desktop Electron
- [ ] OCR con Tesseract.js
- [ ] Modelo ML fine-tuned
- [ ] Analytics avanzados
- [ ] Modo offline

### v2.0 (Q3 2024)
- [ ] Detección de cartas foil/alt-art
- [ ] Colección personal
- [ ] Modo deck-building
- [ ] API pública

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit con formato convencional (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de commits

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo de código
refactor: refactoring
test: tests
chore: tareas de mantenimiento
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Dani** - [@OconnelDan](https://github.com/OconnelDan)

---

⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella!

🔗 **URLs importantes:**
- 📚 [Documentación API](docs/api.md)
- 🐛 [Reportar bugs](https://github.com/OconnelDan/holocron-swu-card-scanner/issues)
- 💬 [Discusiones](https://github.com/OconnelDan/holocron-swu-card-scanner/discussions)
