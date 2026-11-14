import { Router } from 'express';
import { dbRepository } from '../repositories/db.repository.js';
import { CheckoutPayloadSchema } from '@signbridge/shared-schemas';

export const commerceRouter = Router();

commerceRouter.post('/checkout', async (req, res, next) => {
  try {
    const validated = CheckoutPayloadSchema.parse(req.body);
    const order = await dbRepository.createOrder(validated);
    res.status(201).json({
      success: true,
      data: order,
      message: 'Autonomous order authorized and dispatched'
    });
  } catch (err) {
    next(err);
  }
});

commerceRouter.get('/orders', async (req, res, next) => {
  try {
    const orders = await dbRepository.getOrders();
    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    next(err);
  }
});
