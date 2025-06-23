// Script de inicialización para MongoDB
// Se ejecuta automáticamente cuando se crea el contenedor

// Cambiamos a la base de datos de la aplicación
db = db.getSiblingDB('holocron-swu');

// Creamos usuario específico para la aplicación
db.createUser({
  user: 'holocron-app',
  pwd: 'swu_scanner_app_2024',
  roles: [
    {
      role: 'readWrite',
      db: 'holocron-swu'
    }
  ]
});

// Creamos índices iniciales para mejor performance
db.cards.createIndex({ "swudbId": 1 }, { unique: true });
db.cards.createIndex({ "setCode": 1, "cardNumber": 1 }, { unique: true });
db.cards.createIndex({ "name": "text", "subtitle": "text" });
db.cards.createIndex({ "type": 1, "rarity": 1 });

db.scans.createIndex({ "scannedAt": -1 });
db.scans.createIndex({ "cardId": 1, "scannedAt": -1 });
db.scans.createIndex({ "confidence": -1, "status": 1 });

print('✅ Base de datos holocron-swu inicializada correctamente');
print('✅ Usuario holocron-app creado');
print('✅ Índices básicos creados');
