import express from 'express';
import { NewsCommentsController } from '../controllers';

const router = express.Router();

const postPath = '/news';
const path = '/comments';

router.get(`${postPath}/:id${path}`, NewsCommentsController.getCommentsPost);
router.post(`${postPath}/:id${path}`, NewsCommentsController.create);
router.delete(`${postPath}/:id${path}/:cid`, NewsCommentsController.delete);

export default router;
