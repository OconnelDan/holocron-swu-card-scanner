# ================================
# Etapa 1: Construcción
# ================================
FROM node:20-alpine AS builder

# Instalamos dependencias del sistema necesarias para compilar native modules
RUN apk add --no-cache \
  python3 \
  make \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  musl-dev \
  giflib-dev \
  pixman-dev \
  pangomm-dev \
  libjpeg-turbo-dev \
  freetype-dev

# Configuramos directorio de trabajo
WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalamos dependencias (incluye devDependencies para build)
RUN npm ci --only=production=false

# Copiamos código fuente
COPY src/ ./src/
COPY scripts/ ./scripts/

# Compilamos TypeScript a JavaScript
RUN npm run build

# Limpiamos devDependencies para reducir tamaño
RUN npm prune --production

# ================================
# Etapa 2: Producción
# ================================
FROM node:20-alpine AS production

# Creamos usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S holocron -u 1001

# Instalamos dependencias del sistema solo para runtime
RUN apk add --no-cache \
  cairo \
  jpeg \
  pango \
  giflib \
  pixman \
  pangomm \
  libjpeg-turbo \
  freetype \
  chromium \
  nss \
  freetype \
  freetype-dev \
  harfbuzz \
  ca-certificates \
  ttf-freefont

# Configuramos Puppeteer para usar Chromium del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Configuramos directorio de trabajo
WORKDIR /app

# Copiamos archivos compilados y dependencias desde builder
COPY --from=builder --chown=holocron:nodejs /app/dist ./dist
COPY --from=builder --chown=holocron:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=holocron:nodejs /app/package.json ./package.json

# Creamos directorio para logs
RUN mkdir -p logs && chown holocron:nodejs logs

# Cambiamos al usuario no-root
USER holocron

# Exponemos puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de inicio
CMD ["node", "dist/index.js"]
