import mongoose, { Document, Schema } from 'mongoose';
import { ICard } from './Card';

/**
 * Representa un escaneo realizado por la app
 */
export interface IScan extends Document {
  /** ID de la carta escaneada */
  cardId: mongoose.Types.ObjectId | ICard;
  /** Confianza del modelo ML (0-1) */
  confidence: number;
  /** Timestamp del escaneo */
  scannedAt: Date;
  /** Dispositivo desde donde se escaneó */
  deviceInfo: {
    platform: 'ios' | 'android' | 'web' | 'desktop';
    userAgent?: string;
    appVersion?: string;
  };
  /** Metadatos del procesamiento de imagen */
  imageMetadata: {
    /** Dimensiones originales */
    originalDimensions: {
      width: number;
      height: number;
    };
    /** Dimensiones tras el warp */
    processedDimensions: {
      width: number;
      height: number;
    };
    /** Calidad de la detección de contornos */
    contourQuality: number;
    /** Tiempo de procesamiento en ms */
    processingTimeMs: number;
  };
  /** Coordenadas del bounding box detectado */
  boundingBox?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  /** Predicciones alternativas del modelo */
  alternativePredictions?: Array<{
    cardId: mongoose.Types.ObjectId;
    confidence: number;
  }>;
  /** Hash de la imagen procesada (para evitar duplicados) */
  imageHash?: string;
  /** Estado del escaneo */
  status: 'success' | 'low_confidence' | 'no_card_detected' | 'error';
  /** Mensaje de error si aplica */
  errorMessage?: string;
}

const ScanSchema: Schema = new Schema({
  cardId: {
    type: Schema.Types.ObjectId,
    ref: 'Card',
    required: true,
    index: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    index: true,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  deviceInfo: {
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'desktop'],
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    appVersion: {
      type: String,
      default: null,
    },
  },
  imageMetadata: {
    originalDimensions: {
      width: {
        type: Number,
        required: true,
        min: 1,
      },
      height: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    processedDimensions: {
      width: {
        type: Number,
        required: true,
        min: 1,
      },
      height: {
        type: Number,
        required: true,
        min: 1,
      },
    },
    contourQuality: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    processingTimeMs: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  boundingBox: {
    topLeft: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    topRight: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    bottomLeft: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    bottomRight: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
  },
  alternativePredictions: [{
    cardId: {
      type: Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  }],
  imageHash: {
    type: String,
    index: true,
  },
  status: {
    type: String,
    enum: ['success', 'low_confidence', 'no_card_detected', 'error'],
    required: true,
    default: 'success',
    index: true,
  },
  errorMessage: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  collection: 'scans',
});

// Índices para analytics y performance
ScanSchema.index({ scannedAt: -1 });
ScanSchema.index({ 'deviceInfo.platform': 1, scannedAt: -1 });
ScanSchema.index({ confidence: -1, status: 1 });
ScanSchema.index({ cardId: 1, scannedAt: -1 });

export const Scan = mongoose.model<IScan>('Scan', ScanSchema);
