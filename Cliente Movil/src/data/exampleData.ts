export interface Card {
  id: string;
  name: string;
  setCode: string;
  cardNumber: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Special';
  variants: string[];
  owned: number;
  total: number;
}

export interface Set {
  code: string;
  name: string;
  releaseDate: string;
  totalCards: number;
  ownedCards: number;
  completionPercentage: number;
  imageUrl: string;
}

export interface Pack {
  id: string;
  name: string;
  setCode: string;
  cardCount: number;
}

export const mockCards: Card[] = [
  {
    id: '1',
    name: 'Luke Skywalker',
    setCode: 'SOR',
    cardNumber: '001',
    rarity: 'Legendary',
    variants: ['Normal', 'Foil', 'Hyperspace'],
    owned: 2,
    total: 3
  },
  {
    id: '2',
    name: 'Darth Vader',
    setCode: 'SOR',
    cardNumber: '002',
    rarity: 'Legendary',
    variants: ['Normal', 'Foil'],
    owned: 1,
    total: 2
  },
  {
    id: '3',
    name: 'Princess Leia',
    setCode: 'SOR',
    cardNumber: '003',
    rarity: 'Rare',
    variants: ['Normal'],
    owned: 0,
    total: 1
  },
  {
    id: '4',
    name: 'Han Solo',
    setCode: 'SHD',
    cardNumber: '001',
    rarity: 'Rare',
    variants: ['Normal', 'Foil'],
    owned: 2,
    total: 2
  },
  {
    id: '5',
    name: 'Chewbacca',
    setCode: 'SHD',
    cardNumber: '002',
    rarity: 'Uncommon',
    variants: ['Normal'],
    owned: 3,
    total: 1
  }
];

export const mockSets: Set[] = [
  {
    code: 'SOR',
    name: 'Spark of Rebellion',
    releaseDate: '2024-03-08',
    totalCards: 249,
    ownedCards: 180,
    completionPercentage: 72.3,
    imageUrl: 'https://example.com/sor-logo.png'
  },
  {
    code: 'SHD',
    name: 'Shadows of the Galaxy',
    releaseDate: '2024-06-14',
    totalCards: 249,
    ownedCards: 95,
    completionPercentage: 38.2,
    imageUrl: 'https://example.com/shd-logo.png'
  },
  {
    code: '5LOF',
    name: 'Leaders of the Force',
    releaseDate: '2024-09-13',
    totalCards: 17,
    ownedCards: 12,
    completionPercentage: 70.6,
    imageUrl: 'https://example.com/5lof-logo.png'
  }
];

export const mockPacks: Pack[] = [
  {
    id: 'p1',
    name: 'Spark of Rebellion Booster Pack',
    setCode: 'SOR',
    cardCount: 16
  },
  {
    id: 'p2',
    name: 'Shadows of the Galaxy Booster Pack',
    setCode: 'SHD',
    cardCount: 16
  },
  {
    id: 'p3',
    name: 'Leaders of the Force Preconstructed Deck',
    setCode: '5LOF',
    cardCount: 50
  }
];

export const mockCollectionStats = {
  totalCards: 275,
  ownedCards: 287,
  uniqueCards: 195,
  completionPercentage: 70.9,
  totalValue: 1250.75,
  sets: mockSets.length,
  duplicates: 92
};
