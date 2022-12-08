import express from 'express';
import { TagsController } from '../controllers';

const router = express.Router();

router.get('/tags', TagsController.get);
router.get('/tags/:id', TagsController.getOne);
router.post('/tags', TagsController.create);
router.put('/tags/:id', TagsController.update);
router.delete('/tags/:id', TagsController.delete);

export default router;
