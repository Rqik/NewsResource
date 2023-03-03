import express from 'express';

import { AuthorsController } from '../controllers';
import { adminMiddleware } from '../middleware';

const router = express.Router();

const path = '/authors';

router.get(path, adminMiddleware, AuthorsController.getAll);
router.get(`${path}/:id`, adminMiddleware, AuthorsController.getOne);
router.post(path, adminMiddleware, AuthorsController.create);
router.put(`${path}/:id`, adminMiddleware, AuthorsController.update);
router.delete(`${path}/:id`, adminMiddleware, AuthorsController.delete);

export default router;
