import express from 'express';
import { PostsCommentsController } from '../controllers/index';

const router = express.Router();

const postPath = '/post';
const path = '/comments';

router.get(`${postPath}/:id${path}`, PostsCommentsController.getCommentsPost);
router.post(`${postPath}/:id${path}`, PostsCommentsController.create);
router.delete(`${postPath}/:id${path}/:cid`, PostsCommentsController.delete);

export default router;
