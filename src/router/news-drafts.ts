import express from 'express';
import { DraftsController } from '../controllers';

const router = express.Router();

const postPath = '/news';
const path = '/drafts';

router.get(`${postPath}/:id${path}`, DraftsController.getAll);
router.get(`${postPath}/:id${path}/:did`, DraftsController.getOne);
router.post(`${postPath}/:id${path}`, DraftsController.create);
router.put(`${postPath}/:id${path}/:did`, DraftsController.update);
router.delete(`${postPath}/:id${path}/:did`, DraftsController.delete);

export default router;
