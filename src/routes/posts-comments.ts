import express from 'express';

import { PostsCommentsController } from '../controllers/index';
import authMiddleware from '../middleware/auth-middleware';

const router = express.Router();

const postPath = '/posts';
const path = '/comments';

router.get(`${postPath}/:id${path}`, PostsCommentsController.getCommentsPost);
router.post(
  `${postPath}/:id${path}`,
  authMiddleware,
  PostsCommentsController.create,
);
router.delete(
  `${postPath}/:id${path}/:cid`,
  authMiddleware,
  PostsCommentsController.delete,
);

export default router;
