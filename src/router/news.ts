import express from 'express';
import { NewsController } from '../controllers';

const router = express.Router();
const path = '/news';

router.get(path, NewsController.get);
router.get(`${path}/:id`, NewsController.getOne);
router.post(path, NewsController.create);
router.put(`${path}/:id`, NewsController.update);
router.patch(`${path}/:id`, NewsController.partialUpdate);
router.delete(`${path}/:id`, NewsController.delete);

export default router;
