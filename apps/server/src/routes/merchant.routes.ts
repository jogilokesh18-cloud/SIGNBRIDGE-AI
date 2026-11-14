import { Router } from 'express';
import { dbRepository } from '../repositories/db.repository.js';

export const merchantRouter = Router();

merchantRouter.get('/analytics', async (_req, res, next) => {
  try {
    const analytics = await dbRepository.getMerchantAnalytics();
    res.json({
      success: true,
      data: analytics
    });
  } catch (err) {
    next(err);
  }
});
