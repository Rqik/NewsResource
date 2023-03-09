import express from 'express';

import { PostsController } from '../controllers/index';
import { authMiddleware } from '../middleware/index';

const router = express.Router();
const path = '/posts';

router.get(path, PostsController.getAll);
router.get(`${path}/:id`, PostsController.getOne);
router.post(path, authMiddleware, PostsController.create);
router.put(`${path}/:id`, authMiddleware, PostsController.update);
router.patch(`${path}/:id`, authMiddleware, PostsController.partialUpdate);
router.delete(`${path}/:id`, authMiddleware, PostsController.delete);

export default router;
