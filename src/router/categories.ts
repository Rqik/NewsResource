import express from 'express';
import { CategoriesController } from '../controllers';

const router = express.Router();

router.get('/categories', CategoriesController.get);
router.get('/categories/:id', CategoriesController.getOne);
router.post('/categories', CategoriesController.create);
router.put('/categories/:id', CategoriesController.update);
router.delete('/categories/:id', CategoriesController.delete);

export default router;
