import express from 'express';
import { logger } from './utils';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Middleware básico
app.use(express.json());

// Ruta de prueba
app.get('/', (_req, res) => {
  res.json({
    message: 'Servidor mínimo funcionando',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`✅ Servidor mínimo corriendo en puerto ${PORT}`);
}).on('error', (error) => {
  logger.error('❌ Error iniciando servidor mínimo:', error);
});
