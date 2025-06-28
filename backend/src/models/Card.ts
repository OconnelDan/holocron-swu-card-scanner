import mongoose, { Document, Schema } from 'mongoose';

/**
 * Representa una carta de Star Wars Unlimited con datos completos de colección
 */
export interface ICard extends Document {
  /** ID único generado: {setCode}-{cardNumber} */
  swudbId: string;
  /** Set al que pertenece (formato: 1SOR, 2SHD, etc.) */
  setCode: string;
  /** Número de la carta en el set (formato: 001, 002, etc.) */
  cardNumber: string;
  /** Nombre de la carta */
  name: string;
  /** Rareza de la carta */
  rarity: 'Común' | 'Infrecuente' | 'Rara' | 'Legendaria' | 'Especial';
  /** Tipo de carta */
  type: 'Unidad' | 'Evento' | 'Mejora' | 'Base' | 'Unidad líder';
  /** Aspecto principal */
  aspect1: 'VI' | 'HE' | 'ML' | 'MA' | 'AG' | 'AS' | 'INC';
  /** Aspecto secundario (opcional) */
  aspect2?: 'VI' | 'HE' | 'ML' | 'MA' | 'AG' | 'AS' | 'INC';
  /** Coste de la carta */
  cost?: number;
  /** Rasgos/traits de la carta */
  traits?: string;
  /** Arena donde puede jugar */
  arena?: 'Ground' | 'Space' | '';
  /** Total de copias que posee el usuario */
  copies: number;
  /** Variantes específicas de las cartas con cantidades reales */
  variants: {
    normal: number;
    foil: number;
    hyperspace: number;
    foil_hyperspace: number;
    showcase: number;
    organized_play: number;
    event_exclusive: number;
    prerelease_promo: number;
    organized_play_foil: number;
    standard_prestige: number;
    foil_prestige: number;
    serialized_prestige: number;
  };
  /** Fecha de última actualización */
  lastUpdated: Date;
}

const CardSchema: Schema = new Schema({
  swudbId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  setCode: {
    type: String,
    required: true,
    index: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    index: true,
  },
  rarity: {
    type: String,
    enum: ['Común', 'Infrecuente', 'Rara', 'Legendaria', 'Especial'],
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['Unidad', 'Evento', 'Mejora', 'Base', 'Unidad líder'],
    required: true,
    index: true,
  },
  aspect1: {
    type: String,
    enum: ['VI', 'HE', 'ML', 'MA', 'AG', 'AS', 'INC'],
    required: true,
  },
  aspect2: {
    type: String,
    enum: ['VI', 'HE', 'ML', 'MA', 'AG', 'AS', 'INC'],
    default: null,
  },
  cost: {
    type: Number,
    min: 0,
    default: null,
  },
  traits: {
    type: String,
    default: null,
  },
  arena: {
    type: String,
    enum: ['Ground', 'Space', ''],
    default: '',
  },
  copies: {
    type: Number,
    default: 0,
    min: 0,
  },
  variants: {
    normal: { type: Number, default: 0, min: 0 },
    foil: { type: Number, default: 0, min: 0 },
    hyperspace: { type: Number, default: 0, min: 0 },
    foil_hyperspace: { type: Number, default: 0, min: 0 },
    showcase: { type: Number, default: 0, min: 0 },
    organized_play: { type: Number, default: 0, min: 0 },
    event_exclusive: { type: Number, default: 0, min: 0 },
    prerelease_promo: { type: Number, default: 0, min: 0 },
    organized_play_foil: { type: Number, default: 0, min: 0 },
    standard_prestige: { type: Number, default: 0, min: 0 },
    foil_prestige: { type: Number, default: 0, min: 0 },
    serialized_prestige: { type: Number, default: 0, min: 0 },
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  collection: 'cards',
});

// Índices compuestos para queries eficientes
CardSchema.index({ setCode: 1, cardNumber: 1 }, { unique: true });
CardSchema.index({ name: 'text' });
CardSchema.index({ type: 1, rarity: 1 });
CardSchema.index({ aspect1: 1 });
CardSchema.index({ copies: 1 });

export const Card = mongoose.model<ICard>('Card', CardSchema);
