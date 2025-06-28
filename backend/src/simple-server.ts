import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { cardsRoutes } from './routes/cards';

const app = express();
const PORT = process.env['PORT'] || 3000;
const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/holocron-swu';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/cards', cardsRoutes);

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB and start server
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 APIs disponibles en http://localhost:${PORT}/api/cards`);
    });
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

start();
