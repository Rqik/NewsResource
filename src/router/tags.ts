import express from 'express';
import { TagsController } from '../controllers';

const router = express.Router();

const path = '/tags';

router.get(path, TagsController.get);
router.get(`${path}/:id`, TagsController.getOne);
router.post(path, TagsController.create);
router.put(`${path}/:id`, TagsController.update);
router.delete(`${path}/:id`, TagsController.delete);

export default router;
