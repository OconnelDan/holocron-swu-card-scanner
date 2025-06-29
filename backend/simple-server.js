const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log para debugging
console.log('🚀 Iniciando servidor simple en puerto', PORT);

// Mock data
const mockStats = {
  overview: {
    totalCards: 450,
    ownedCards: 85,
    totalPhysicalCards: 142,
    completionPercentage: "18.89"
  },
  bySet: [
    {
      setCode: "SOR",
      totalCards: 246,
      ownedCards: 45,
      totalPhysicalCards: 78,
      completionPercentage: "18.29"
    },
    {
      setCode: "SHD", 
      totalCards: 134,
      ownedCards: 28,
      totalPhysicalCards: 42,
      completionPercentage: "20.90"
    },
    {
      setCode: "TWI",
      totalCards: 70,
      ownedCards: 12,
      totalPhysicalCards: 22,
      completionPercentage: "17.14"
    }
  ],
  byRarity: [
    {
      rarity: "Common",
      totalCards: 180,
      ownedCards: 45,
      totalPhysicalCards: 72,
      completionPercentage: "25.00"
    },
    {
      rarity: "Uncommon", 
      totalCards: 150,
      ownedCards: 28,
      totalPhysicalCards: 46,
      completionPercentage: "18.67"
    },
    {
      rarity: "Rare",
      totalCards: 90,
      ownedCards: 10,
      totalPhysicalCards: 18,
      completionPercentage: "11.11"
    },
    {
      rarity: "Legendary",
      totalCards: 30,
      ownedCards: 2,
      totalPhysicalCards: 6,
      completionPercentage: "6.67"
    }
  ]
};

const mockCards = [
  // Spark of Rebellion (SOR)
  {
    id: "SOR_001",
    name: "Luke Skywalker",
    set: "SOR",
    rarity: "Rare",
    cost: 7,
    marketPrice: 15.99
  },
  {
    id: "SOR_002", 
    name: "Darth Vader",
    set: "SOR",
    rarity: "Legendary",
    cost: 8,
    marketPrice: 45.99
  },
  {
    id: "SOR_003",
    name: "Princess Leia",
    set: "SOR",
    rarity: "Rare",
    cost: 6,
    marketPrice: 12.50
  },
  {
    id: "SOR_004",
    name: "Han Solo",
    set: "SOR", 
    rarity: "Uncommon",
    cost: 5,
    marketPrice: 8.99
  },
  {
    id: "SOR_005",
    name: "Chewbacca",
    set: "SOR",
    rarity: "Common",
    cost: 4,
    marketPrice: 3.99
  },
  {
    id: "SOR_006",
    name: "Obi-Wan Kenobi",
    set: "SOR",
    rarity: "Legendary",
    cost: 7,
    marketPrice: 38.99
  },
  {
    id: "SOR_007",
    name: "Yoda",
    set: "SOR",
    rarity: "Legendary", 
    cost: 6,
    marketPrice: 42.50
  },
  {
    id: "SOR_008",
    name: "Stormtrooper",
    set: "SOR",
    rarity: "Common",
    cost: 2,
    marketPrice: 1.50
  },
  {
    id: "SOR_009",
    name: "TIE Fighter",
    set: "SOR",
    rarity: "Uncommon",
    cost: 3,
    marketPrice: 5.99
  },
  {
    id: "SOR_010",
    name: "X-wing",
    set: "SOR",
    rarity: "Rare",
    cost: 5,
    marketPrice: 14.99
  },
  // Shadows of the Galaxy (SHD)
  {
    id: "SHD_001",
    name: "Boba Fett",
    set: "SHD",
    rarity: "Legendary",
    cost: 6,
    marketPrice: 35.99
  },
  {
    id: "SHD_002",
    name: "Lando Calrissian",
    set: "SHD",
    rarity: "Rare",
    cost: 5,
    marketPrice: 18.50
  },
  {
    id: "SHD_003",
    name: "Jabba the Hutt",
    set: "SHD",
    rarity: "Legendary",
    cost: 8,
    marketPrice: 42.99
  },
  {
    id: "SHD_004",
    name: "IG-88",
    set: "SHD",
    rarity: "Uncommon",
    cost: 4,
    marketPrice: 7.50
  },
  {
    id: "SHD_005",
    name: "Gamorrean Guard",
    set: "SHD",
    rarity: "Common",
    cost: 2,
    marketPrice: 2.25
  },
  // Twilight of the Republic (TWI)
  {
    id: "TWI_001",
    name: "Anakin Skywalker",
    set: "TWI",
    rarity: "Legendary",
    cost: 7,
    marketPrice: 48.99
  },
  {
    id: "TWI_002",
    name: "Padmé Amidala",
    set: "TWI",
    rarity: "Rare",
    cost: 5,
    marketPrice: 16.75
  },
  {
    id: "TWI_003",
    name: "Mace Windu",
    set: "TWI",
    rarity: "Rare",
    cost: 6,
    marketPrice: 19.99
  },
  {
    id: "TWI_004",
    name: "Clone Trooper",
    set: "TWI",
    rarity: "Common",
    cost: 2,
    marketPrice: 1.99
  },
  {
    id: "TWI_005",
    name: "Battle Droid",
    set: "TWI",
    rarity: "Common",
    cost: 1,
    marketPrice: 1.25
  }
];

// Routes
app.get('/api/cards/stats', (req, res) => {
  console.log('📊 Petición recibida: /api/cards/stats');
  res.json({
    success: true,
    data: mockStats
  });
});

app.get('/api/cards', (req, res) => {
  const { set, limit = 1000 } = req.query;
  console.log(`🃏 Petición recibida: /api/cards?set=${set}&limit=${limit}`);
  
  let filteredCards = mockCards;
  if (set) {
    filteredCards = mockCards.filter(card => card.set === set);
  }
  
  res.json({
    success: true,
    data: filteredCards.slice(0, parseInt(limit))
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Catch all
app.use((req, res) => {
  console.log(`❓ Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/cards/stats',
      'GET /api/cards',
      'GET /health'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor mock corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET http://localhost:${PORT}/api/cards/stats`);
  console.log(`   GET http://localhost:${PORT}/api/cards`);
  console.log(`   GET http://localhost:${PORT}/health`);
});
