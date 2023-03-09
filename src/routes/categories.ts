import express from 'express';

import { CategoriesController } from '../controllers/index';
import { adminMiddleware } from '../middleware/index';

const router = express.Router();

const path = '/categories';

router.get(path, CategoriesController.getAll);
router.get(`${path}/:id`, CategoriesController.getOne);
router.post(path, adminMiddleware, CategoriesController.create);
router.put(`${path}/:id`, adminMiddleware, CategoriesController.update);
router.delete(`${path}/:id`, adminMiddleware, CategoriesController.delete);

export default router;
