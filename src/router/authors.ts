import express from 'express';
import { AuthorsController } from '../controllers';

const router = express.Router();

router.get('/authors', AuthorsController.get);
router.get('/authors/:id', AuthorsController.getOne);
router.post('/authors', AuthorsController.create);
router.put('/authors/:id', AuthorsController.update);
router.delete('/authors/:id', AuthorsController.delete);

export default router;
