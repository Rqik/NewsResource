import express from 'express';
import { TagsController } from '../controllers';
import { adminMiddleware } from '../middleware';

const router = express.Router();

const path = '/tags';

router.get(path, TagsController.getAll);
router.get(`${path}/:id`, TagsController.getOne);
router.post(path, adminMiddleware, TagsController.create);
router.put(`${path}/:id`, adminMiddleware, TagsController.update);
router.delete(`${path}/:id`, adminMiddleware, TagsController.delete);

export default router;
