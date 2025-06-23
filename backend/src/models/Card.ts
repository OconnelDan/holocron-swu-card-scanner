import mongoose, { Document, Schema } from 'mongoose';

/**
 * Representa una carta de Star Wars Unlimited
 */
export interface ICard extends Document {
  /** ID único de SWUDB */
  swudbId: string;
  /** Nombre de la carta */
  name: string;
  /** Subtítulo de la carta */
  subtitle?: string;
  /** Número de la carta en el set */
  cardNumber: string;
  /** Set al que pertenece */
  setCode: string;
  /** Nombre del set */
  setName: string;
  /** Rareza de la carta */
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary' | 'Special';
  /** Tipo de carta */
  type: 'Unit' | 'Event' | 'Upgrade' | 'Base' | 'Leader';
  /** Aspectos de la carta */
  aspects: string[];
  /** Coste de la carta */
  cost?: number;
  /** Poder/Fuerza */
  power?: number;
  /** Puntos de vida */
  hp?: number;
  /** Arena donde puede jugar */
  arena?: 'Ground' | 'Space';
  /** Texto de la carta */
  text?: string;
  /** URL de la imagen */
  imageUrl?: string;
  /** URL de la imagen de alta resolución */
  imageUrlHd?: string;
  /** Traits/características */
  traits?: string[];
  /** Keywords */
  keywords?: string[];
  /** Fecha de última actualización */
  lastUpdated: Date;
  /** Metadatos adicionales del scraping */
  scrapingMetadata?: {
    lastScraped: Date;
    source: 'swudb' | 'official' | 'manual';
    officialUrl?: string;
  };
}

const CardSchema: Schema = new Schema({
  swudbId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  subtitle: {
    type: String,
    default: null,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  setCode: {
    type: String,
    required: true,
    index: true,
  },
  setName: {
    type: String,
    required: true,
  },
  rarity: {
    type: String,
    enum: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Special'],
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Unit', 'Event', 'Upgrade', 'Base', 'Leader'],
    required: true,
    index: true,
  },
  aspects: [{
    type: String,
    required: true,
  }],
  cost: {
    type: Number,
    min: 0,
    default: null,
  },
  power: {
    type: Number,
    min: 0,
    default: null,
  },
  hp: {
    type: Number,
    min: 0,
    default: null,
  },
  arena: {
    type: String,
    enum: ['Ground', 'Space'],
    default: null,
  },
  text: {
    type: String,
    default: null,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  imageUrlHd: {
    type: String,
    default: null,
  },
  traits: [{
    type: String,
  }],
  keywords: [{
    type: String,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  scrapingMetadata: {
    lastScraped: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      enum: ['swudb', 'official', 'manual'],
      default: 'swudb',
    },
    officialUrl: {
      type: String,
      default: null,
    },
  },
}, {
  timestamps: true,
  collection: 'cards',
});

// Índices compuestos para queries eficientes
CardSchema.index({ setCode: 1, cardNumber: 1 }, { unique: true });
CardSchema.index({ name: 'text', subtitle: 'text' });
CardSchema.index({ type: 1, rarity: 1 });

export const Card = mongoose.model<ICard>('Card', CardSchema);
