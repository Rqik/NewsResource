import express from 'express';
import { NewsCommentsController } from '../controllers';

const router = express.Router();

router.get('/news/:id/comments', NewsCommentsController.getCommentsPost);
router.post('/news/:id/comments', NewsCommentsController.create);
router.delete('/news/:id/comments/:cid', NewsCommentsController.delete);

export default router;
