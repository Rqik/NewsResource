import express from 'express';
import { PostsController } from '../controllers/index';

const router = express.Router();
const path = '/post';

router.get(path, PostsController.getAll);
router.get(`${path}/:id`, PostsController.getOne);
router.post(path, PostsController.create);
router.put(`${path}/:id`, PostsController.update);
router.patch(`${path}/:id`, PostsController.partialUpdate);
router.delete(`${path}/:id`, PostsController.delete);

export default router;
