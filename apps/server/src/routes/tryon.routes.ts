import { Router, Request, Response, NextFunction } from 'express';
import { tryonService } from '../services/tryon.service.js';
import { logger } from '../config/logger.js';

export const tryonRouter = Router();

/**
 * POST /api/v1/tryon/generate
 *
 * Accepts person photo + garment photo (as base64) and returns
 * an AI-generated photo where the person is genuinely wearing
 * the garment — not a paste or overlay.
 *
 * Body: {
 *   personImageBase64: string,     // base64 of person photo
 *   personImageMimeType: string,   // e.g. "image/jpeg"
 *   garmentImageBase64: string,    // base64 of garment photo
 *   garmentImageMimeType: string,  // e.g. "image/jpeg"
 *   garmentName?: string,          // e.g. "Bespoke Cashmere Tuxedo"
 *   garmentDescription?: string    // optional description
 * }
 */
tryonRouter.post(
  '/generate',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        personImageBase64,
        personImageMimeType,
        garmentImageBase64,
        garmentImageMimeType,
        garmentName,
        garmentDescription
      } = req.body;

      if (!personImageBase64 || !garmentImageBase64) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_IMAGES',
            message:
              'Both personImageBase64 and garmentImageBase64 are required.'
          }
        });
        return;
      }

      logger.info(
        { garmentName: garmentName || 'unknown' },
        'Virtual try-on generation requested'
      );

      const result = await tryonService.generateTryon({
        personImageBase64,
        personImageMimeType: personImageMimeType || 'image/jpeg',
        garmentImageBase64,
        garmentImageMimeType: garmentImageMimeType || 'image/jpeg',
        garmentName,
        garmentDescription
      });

      res.json({
        success: true,
        data: {
          resultImageBase64: result.resultImageBase64,
          resultMimeType: result.resultMimeType,
          stylingNotes: result.stylingNotes
        }
      });
    } catch (err: any) {
      logger.error({ err }, 'Virtual try-on generation failed');
      res.status(500).json({
        success: false,
        error: {
          code: 'TRYON_GENERATION_FAILED',
          message:
            err?.message || 'Failed to generate virtual try-on image.'
        }
      });
    }
  }
);
