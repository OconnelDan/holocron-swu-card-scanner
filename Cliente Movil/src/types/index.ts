// Tipos para las cartas de Star Wars Unlimited
export interface Card {
  id: string;
  name: string;
  set: string;
  number: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Special';
  type: string;
  cost?: number;
  power?: number;
  hp?: number;
  aspects?: string[];
  traits?: string[];
  imageUrl?: string;
  marketPrice?: number; // Precio de mercado opcional
}

// Tipos para la colección del usuario
export interface UserCollection {
  cardId: string;
  quantity: number;
  dateAdded: Date;
  condition?: 'Mint' | 'Near Mint' | 'Lightly Played' | 'Moderately Played' | 'Heavily Played' | 'Damaged';
}

// Tipos para el escáner
export interface ScanResult {
  card: Card | null;
  confidence: number;
  processingTime: number;
  imageBase64?: string;
}

// Tipos para la configuración de la cámara
export interface CameraConfig {
  quality: 'low' | 'medium' | 'high';
  format: 'jpg' | 'png';
  enableTorch: boolean;
  autoFocus: boolean;
}

// Tipos para la API del backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Tipos para la autenticación (futuro)
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

// Tipos para las estadísticas de la colección
export interface CollectionStats {
  totalCards: number;
  uniqueCards: number;
  completionPercentage: number;
  totalValue?: number; // Valor total de la colección
  valueEstimate?: number;
  lastUpdated: Date;
}

// Tipos para sets de cartas
export interface CardSet {
  setCode: string;
  name: string;
  totalCards: number;
  ownedCards: number;
  totalPhysicalCards: number;
  completionPercentage: number;
  releaseDate?: Date;
  description?: string;
}

// Tipos para navegación entre sets y cartas
export interface SetStats {
  overview: {
    totalCards: number;
    ownedCards: number;
    totalPhysicalCards: number;
    completionPercentage: string;
  };
  bySet: CardSet[];
  byRarity: RarityStats[];
}

export interface RarityStats {
  rarity: string;
  totalCards: number;
  ownedCards: number;
  totalPhysicalCards: number;
  completionPercentage: string;
}
