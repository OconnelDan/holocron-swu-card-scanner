import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Card, Scan, IScan } from '../models';
import { logger, config } from '../utils';

/**
 * Interfaz para datos de escaneo desde el cliente
 */
interface ScanRequestBody {
  cardId: string;
  confidence: number;
  deviceInfo: {
    platform: 'ios' | 'android' | 'web' | 'desktop';
    userAgent?: string;
    appVersion?: string;
  };
  imageMetadata: {
    originalDimensions: { width: number; height: number };
    processedDimensions: { width: number; height: number };
    contourQuality: number;
    processingTimeMs: number;
  };
  boundingBox?: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  };
  alternativePredictions?: Array<{
    cardId: string;
    confidence: number;
  }>;
  imageHash?: string;
}

/**
 * Controller para operaciones de escaneo
 */
export class ScansController {
  /**
   * Registra un nuevo escaneo
   */
  static async createScan(req: Request, res: Response): Promise<void> {
    try {
      const scanData = req.body as ScanRequestBody;
      
      // Validaciones básicas
      if (!scanData.cardId || !mongoose.Types.ObjectId.isValid(scanData.cardId)) {
        res.status(400).json({
          error: 'ID de carta inválido',
          message: 'Debe proporcionar un ID de carta válido',
        });
        return;
      }
      
      if (!scanData.confidence || scanData.confidence < 0 || scanData.confidence > 1) {
        res.status(400).json({
          error: 'Confianza inválida',
          message: 'La confianza debe estar entre 0 y 1',
        });
        return;
      }
      
      // Verificamos que la carta existe
      const card = await Card.findById(scanData.cardId);
      if (!card) {
        res.status(404).json({
          error: 'Carta no encontrada',
          message: 'La carta especificada no existe en la base de datos',
        });
        return;
      }
      
      // Determinamos el estado del escaneo
      let status: IScan['status'] = 'success';
      if (scanData.confidence < config.ml.confidenceThreshold) {
        status = 'low_confidence';
      }
      
      // Procesamos predicciones alternativas
      const alternativePredictions = scanData.alternativePredictions?.map(pred => ({
        cardId: new mongoose.Types.ObjectId(pred.cardId),
        confidence: pred.confidence,
      }));
      
      // Creamos el documento de escaneo
      const scanDoc: Partial<IScan> = {
        cardId: new mongoose.Types.ObjectId(scanData.cardId),
        confidence: scanData.confidence,
        deviceInfo: scanData.deviceInfo,
        imageMetadata: scanData.imageMetadata,
        boundingBox: scanData.boundingBox,
        alternativePredictions,
        imageHash: scanData.imageHash,
        status,
        scannedAt: new Date(),
      };
      
      const scan = new Scan(scanDoc);
      await scan.save();
      
      // Populamos la carta para la respuesta
      await scan.populate('cardId', 'name subtitle rarity type imageUrl');
      
      logger.info('Nuevo escaneo registrado', {
        scanId: scan._id,
        cardId: scanData.cardId,
        confidence: scanData.confidence,
        status,
        platform: scanData.deviceInfo.platform,
      });
      
      res.status(201).json({
        message: 'Escaneo registrado exitosamente',
        scan: {
          id: scan._id,
          card: scan.cardId,
          confidence: scan.confidence,
          status: scan.status,
          scannedAt: scan.scannedAt,
        },
      });
      
    } catch (error) {
      logger.error('Error creando escaneo:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudo registrar el escaneo',
      });
    }
  }

  /**
   * Obtiene estadísticas de escaneos
   */
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const [
        totalScans,
        successfulScans,
        lowConfidenceScans,
        averageConfidence,
        topCards,
        platformStats,
      ] = await Promise.all([
        Scan.countDocuments(),
        Scan.countDocuments({ status: 'success' }),
        Scan.countDocuments({ status: 'low_confidence' }),
        Scan.aggregate([
          { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
        ]),
        Scan.aggregate([
          { $group: { _id: '$cardId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'cards',
              localField: '_id',
              foreignField: '_id',
              as: 'card',
            },
          },
          { $unwind: '$card' },
        ]),
        Scan.aggregate([
          { $group: { _id: '$deviceInfo.platform', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
      ]);
      
      const stats = {
        total: totalScans,
        successful: successfulScans,
        lowConfidence: lowConfidenceScans,
        successRate: totalScans > 0 ? (successfulScans / totalScans) * 100 : 0,
        averageConfidence: averageConfidence[0]?.avgConfidence || 0,
        topScannedCards: topCards.map(item => ({
          card: {
            id: item.card._id,
            name: item.card.name,
            subtitle: item.card.subtitle,
          },
          scanCount: item.count,
        })),
        platformDistribution: platformStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      };
      
      res.status(200).json({ stats });
      
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las estadísticas',
      });
    }
  }

  /**
   * Obtiene historial de escaneos con paginación
   */
  static async getScans(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const skip = (page - 1) * limit;
      
      const scans = await Scan.find()
        .populate('cardId', 'name subtitle rarity type imageUrl')
        .select('-__v')
        .sort({ scannedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
      
      const total = await Scan.countDocuments();
      const totalPages = Math.ceil(total / limit);
      
      res.status(200).json({
        scans,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
      
    } catch (error) {
      logger.error('Error obteniendo escaneos:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los escaneos',
      });
    }
  }
}
