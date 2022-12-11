import express from 'express';
import { AuthorsController } from '../controllers';

const router = express.Router();

const path = '/authors';

router.get(path, AuthorsController.get);
router.get(`${path}/:id`, AuthorsController.getOne);
router.post(path, AuthorsController.create);
router.put(`${path}/:id`, AuthorsController.update);
router.delete(`${path}/:id`, AuthorsController.delete);

export default router;
