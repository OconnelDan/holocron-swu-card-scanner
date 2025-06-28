import { connectToDatabase, disconnectFromDatabase, clearDatabase } from '../src/utils';

/**
 * Setup global para tests
 */
beforeAll(async () => {
  // Configuramos variables de entorno para tests
  process.env['NODE_ENV'] = 'test';
  process.env['MONGODB_TEST_URI'] = 'mongodb://localhost:27017/holocron-swu-test';

  // Conectamos a la base de datos de test
  await connectToDatabase();
});

beforeEach(async () => {
  // Limpiamos la base de datos antes de cada test
  await clearDatabase();
});

afterAll(async () => {
  // Limpiamos y desconectamos después de todos los tests
  await clearDatabase();
  await disconnectFromDatabase();
});
