import express from 'express';
import { CategoriesController } from '../controllers';

const router = express.Router();

const path = '/categories';

router.get(path, CategoriesController.get);
router.get(`${path}/:id`, CategoriesController.getOne);
router.post(path, CategoriesController.create);
router.put(`${path}/:id`, CategoriesController.update);
router.delete(`${path}/:id`, CategoriesController.delete);

export default router;
