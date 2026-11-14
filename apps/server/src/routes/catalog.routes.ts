import { Router } from 'express';
import { dbRepository } from '../repositories/db.repository.js';

export const catalogRouter = Router();

catalogRouter.get('/', async (req, res, next) => {
  try {
    const { category, vibe, featured } = req.query;
    const items = await dbRepository.getGarments({
      category: category as string,
      vibe: vibe as string,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined
    });

    res.json({
      success: true,
      data: items,
      count: items.length
    });
  } catch (err) {
    next(err);
  }
});

catalogRouter.post('/upload', async (req, res, next) => {
  try {
    const item = await dbRepository.addCustomGarment(req.body);
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
});

catalogRouter.get('/:id', async (req, res, next) => {
  try {
    const item = await dbRepository.getGarmentById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Garment not found' });
    }
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});
