import { Router } from 'express';
import { stylistService } from '../services/stylist.service.js';
import { dbRepository } from '../repositories/db.repository.js';
import { StylistQuerySchema, BodyAnalysisSchema } from '@signbridge/shared-schemas';

export const stylistRouter = Router();

stylistRouter.post('/consult', async (req, res, next) => {
  try {
    const validated = StylistQuerySchema.parse(req.body);
    const reply = await stylistService.consult(validated);
    res.json({
      success: true,
      data: reply
    });
  } catch (err) {
    next(err);
  }
});

stylistRouter.post('/scan-body', async (req, res, next) => {
  try {
    const validated = BodyAnalysisSchema.parse(req.body);
    const scan = await dbRepository.recordBodyScan(validated);
    res.json({
      success: true,
      data: scan
    });
  } catch (err) {
    next(err);
  }
});
